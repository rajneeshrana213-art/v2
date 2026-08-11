import { prisma } from "../../prisma";
import { DashboardOptimizationService } from "../finance/DashboardOptimizationService";

export const ParentService = {
  async getChildren(userId: string) {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      select: {
        students: {
          select: {
            id: true,
            academicRecords: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { rollNumber: true },
            },
            routeId: true,
            user: { select: { name: true, profilePic: true } },
            class: { select: { name: true } },
          },
        },
      },
    });

    if (!parent) return [];

    return (parent?.students || []).map((s) => ({
      id: s.id,
      name: s.user?.name || "Student",
      rollNo: s.academicRecords?.[0]?.rollNumber || "",
      routeId: s.routeId,
      profilePic: s.user?.profilePic || null,
      className: s.class?.name || "Unknown",
    }));
  },

  async getChildDashboardOverview(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        classId: true,
        schoolId: true,
        academicRecords: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { rollNumber: true },
        },
        routeId: true,
        user: { select: { name: true, profilePic: true } },
        class: {
          select: { name: true, school: { select: { schoolName: true } } },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    const [attendance, fees, assignments, academicPerformance, events] =
      await Promise.all([
        ParentService.getAttendance(studentId),
        ParentService.getFees(studentId),
        ParentService.getAssignments(studentId),
        ParentService.getAcademicPerformance(studentId),
        ParentService.getEvents(
          student.schoolId || (student.class?.school as any)?.id,
        ),
      ]);

    return {
      studentInfo: {
        name: student.user?.name || "Student",
        class: student.class?.name || "N/A",
        rollNo: student.academicRecords?.[0]?.rollNumber || "",
        routeId: student.routeId,
        profilePic: student.user?.profilePic || null,
        schoolName: student.class?.school?.schoolName || "N/A",
      },
      stats: {
        attendancePercentage: attendance.percentage,
        pendingHomework: assignments.filter(
          (a: any) => a.status === "Not Submitted",
        ).length,
        upcomingExamsCount: 0, // Simplified for V1
        feeStatus: fees.totalPending > 0 ? "Due" : "Paid",
        feePendingAmount: fees.totalPending,
      },
      notices: events.notices.slice(0, 5),
      recentHomework: assignments.slice(0, 3),
    };
  },

  async getDashboardData(userId: string) {
    // Legacy support or combined view
    const children = await ParentService.getChildren(userId);
    if (children.length === 0) throw new Error("No children found");

    return ParentService.getChildDashboardOverview(children[0].id);
  },

  getStudentInfo(student: any) {
    return {
      userId: student.user.id,
      name: student.user.name,
      class: student.class.name,
      rollNo: student.academicRecords?.[0]?.rollNumber || "",
      profilePic: student.user.profilePic || null,
      email: student.user.email || null,
      phone: student.user.phone || null,
      // dateOfBirth: student.user.dateOfBirth, // Not available in query above
      // admissionDate: student.admissionDate,
      schoolName: student.class.school.schoolName,
    };
  },

  async getAcademicPerformance(studentId: string) {
    const results = await prisma.result.findMany({
      where: { studentId },
      select: {
        score: true,
        createdAt: true,
        exam: {
          select: {
            title: true,
            subject: {
              select: { name: true },
            },
          },
        },
        assignment: {
          select: {
            title: true,
            subject: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const subjectScores: {
      [key: string]: { total: number; count: number; scores: any[] };
    } = {};

    results.forEach((result: any) => {
      const subject =
        result.exam?.subject?.name ||
        result.assignment?.subject?.name ||
        "Unknown Subject";

      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0, scores: [] };
      }
      subjectScores[subject].total += result.score;
      subjectScores[subject].count += 1;
      subjectScores[subject].scores.push({
        type: result.exam ? "Exam" : "Assignment",
        title: result.exam
          ? result.exam.title
          : result.assignment?.title || "Unknown Result",
        score: result.score,
        date: result.createdAt,
      });
    });

    const grades = await prisma.grade.findMany();

    const averages = Object.entries(subjectScores).map(
      ([subject, data]: [string, any]) => {
        const avg = data.total / data.count;
        const gradeInfo = grades.find(
          (g: any) => avg >= g.marksFrom && avg <= g.marksUpto,
        );

        return {
          subject,
          average: avg,
          grade: gradeInfo?.grade || "N/A",
          gradePoint: gradeInfo?.gradePoint || null,
          recentScores: data.scores.slice(0, 5),
        };
      },
    );

    return { averages, recentResults: results };
  },

  async getAttendance(studentId: string) {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a: any) => a.present).length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const recentRecords = attendanceRecords.slice(0, 10).map((a: any) => ({
      date: a.date,
      status: a.present ? "Present" : "Absent",
    }));

    return {
      percentage: Number(percentage.toFixed(2)),
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      recentRecords,
    };
  },

  async getFees(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    const activeAY = await prisma.academicYear.findFirst({
      where: { schoolId: student.schoolId, isActive: true },
      select: { id: true },
    });

    if (!activeAY) throw new Error("Active academic year not found");

    // Use optimized service to get net balance
    const balances = await DashboardOptimizationService.getAllStudentBalances(
      student.schoolId,
      activeAY.id,
      [studentId],
    );

    const balance = balances.get(studentId);
    if (!balance)
      return { pendingFees: [], totalPending: 0, paymentHistory: [] };

    // Fetch from the new StudentInvoiceItem table for granular breakdown
    const invoiceItems = await prisma.studentInvoiceItem.findMany({
      where: {
        studentId,
        academicYearId: activeAY.id,
      },
      include: {
        feeHead: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }, { dueDate: "asc" }],
    });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const pendingFees = invoiceItems.map((inv) => ({
      id: inv.id,
      amount: inv.balanceAmount,
      totalAmount: inv.grossAmount,
      paidAmount: inv.paidAmount,
      dueDate: inv.dueDate,
      status: inv.status,
      title:
        inv.feeHead.name +
        (inv.month ? ` (${months[inv.month - 1]} ${inv.year})` : ""),
    }));

    // Fetch actual Payment records with invoice and receipt data
    const payments = await prisma.payment.findMany({
      where: {
        studentId,
        status: "COMPLETED",
      },
      orderBy: { paymentDate: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        paymentMethod: true,
        status: true,
        invoiceNumber: true,
        invoiceUrl: true,
        receiptNumber: true,
        receiptUrl: true,
        officeInvoiceUrl: true,
        description: true,
        razorpayPaymentId: true,
      },
    });

    return {
      personalInfo: {
        id: student.id,
        schoolId: student.schoolId,
        userId: student.user?.id,
        name: student.user?.name,
        email: student.user?.email,
        phone: student.user?.phone,
      },
      totalPending: balance.netBalance > 0 ? balance.netBalance : 0,
      totalPaid: balance.collected,
      pendingFees,
      paymentHistory: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        date: p.paymentDate || p.id,
        method: p.paymentMethod || "CASH",
        status: p.status,
        invoiceNumber: p.invoiceNumber,
        invoiceUrl: p.invoiceUrl,
        receiptNumber: p.receiptNumber,
        // Prefer student copy (officeInvoiceUrl); fall back to full receipt
        receiptUrl: p.officeInvoiceUrl || p.receiptUrl,
        description: p.description,
        razorpayPaymentId: p.razorpayPaymentId,
      })),
    };
  },

  async getAssignments(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student?.classId) return [];
    const classId = student.classId;

    const [assignments, homeworks] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          classId,
          dueDate: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          subject: {
            select: { name: true },
          },
          AssignmentSubmission: {
            where: { studentId },
            select: {
              submittedAt: true,
              file: true,
            },
            take: 1,
          },
        },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),
      prisma.homeWork.findMany({
        where: {
          classId,
          dueDate: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          subject: {
            select: { name: true },
          },
          attachment: true,
          HomeworkSubmission: {
            where: { studentId },
            select: {
              submittedAt: true,
              file: true,
            },
            take: 1,
          },
        },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),
    ]);

    const normalizedAssignments = assignments.map((a) => {
      const submission = a.AssignmentSubmission[0];
      return {
        id: a.id,
        title: a.title,
        subject: a.subject?.name || "N/A",
        description: a.description,
        dueDate: a.dueDate,
        status: submission ? "Submitted" : "Not Submitted",
        submittedAt: submission?.submittedAt || null,
        file: submission?.file || null,
        type: "ASSIGNMENT",
      };
    });

    const normalizedHomework = homeworks.map((h) => {
      const submission = h.HomeworkSubmission[0];
      return {
        id: h.id,
        title: h.title,
        subject: h.subject?.name || "N/A",
        description: h.description,
        dueDate: h.dueDate,
        status: submission ? "Submitted" : "Not Submitted",
        submittedAt: submission?.submittedAt || null,
        file: submission?.file || null,
        attachment: h.attachment,
        type: "HOMEWORK",
      };
    });

    return [...normalizedAssignments, ...normalizedHomework].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  },

  async getExams(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student?.classId) return [];

    return prisma.exam.findMany({
      where: {
        classId: student.classId,
        scheduleDate: { gte: new Date() },
      },
      include: {
        subject: { select: { name: true } },
      },
      orderBy: { scheduleDate: "asc" },
    });
  },

  async getTimetable(classId: string) {
    const timetable = await prisma.lesson.findMany({
      where: { classId },
      select: {
        day: true,
        startTime: true,
        endTime: true,
        subject: {
          select: { name: true },
        },
        class: {
          select: { name: true },
        },
        teacher: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return timetable.map((t) => ({
      day: t.day,
      startTime: t.startTime,
      endTime: t.endTime,
      subject: t.subject.name,
      teacher: t.teacher?.user.name || "TBD",
      class: t.class?.name || "N/A",
      room: "N/A",
    }));
  },

  async getEvents(schoolId: string) {
    const events = await prisma.event.findMany({
      where: {
        schoolId,
        start: { gte: new Date() },
      },
      orderBy: { start: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        start: true,
        end: true,
      },
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        class: {
          schoolId: schoolId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    const notices = await prisma.notice.findMany({
      where: { schoolId },
      orderBy: { publishDate: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        publishDate: true,
        attachment: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return {
      events,
      announcements,
      notices: notices.map((n) => ({
        ...n,
        description: n.message, // Map message to description for frontend
      })),
    };
  },

  async getCommunication(parentId: string) {
    const messages = await prisma.message.findMany({
      where: { recipientUserId: parentId },
      include: { sender: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return messages.map((m) => ({
      id: m.id,
      sender: `${m.sender.name} (${m.sender.role})`,
      content: m.content,
      sentAt: m.createdAt,
      isRead: m.isRead,
    }));
  },
};
