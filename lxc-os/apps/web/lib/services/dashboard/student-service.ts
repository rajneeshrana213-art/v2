import { prisma } from "../../prisma";
import { getCachedOrFetch } from "../../utils/performance";
import logger from "../../utils/logger";
import { PaymentSettlementService } from "../finance/PaymentSettlementService";

export const StudentService = {
  async getDashboardData(userId: string) {
    try {
      const cacheKey = `student:${userId}`;
      const student = await getCachedOrFetch(
        cacheKey,
        async () => {
          return prisma.student.findFirst({
            where: { userId },
            select: {
              id: true,
              classId: true,
              schoolId: true,
              academicRecords: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { rollNumber: true },
              },
              admissionDate: true,
              routeId: true,
              busStopId: true,
              user: {
                select: {
                  name: true,
                  profilePic: true,
                  email: true,
                  phone: true,
                },
              },
              class: {
                select: {
                  name: true,
                },
              },
            },
          });
        },
        600,
      );

      if (!student) {
        throw new Error("Student not found");
      }
      if (!student.classId || !student.schoolId) {
        throw new Error("Student class or school not found");
      }

      const studentId = student.id;
      const classId = student.classId;
      const schoolId = student.schoolId;

      // Dashboard data caching
      const dashboardCacheKey = `dashboard:student:${studentId}`;
      const dashboardData = await getCachedOrFetch(
        dashboardCacheKey,
        async () => {
          const [
            personalInfo,
            attendance,
            fees,
            timetable,
            assignments,
            academicPerformance,
            notices,
          ] = await Promise.all([
            StudentService.getPersonalInfo(student),
            StudentService.getAttendance(studentId),
            StudentService.getFees(studentId, schoolId),
            StudentService.getTimetable(classId),
            StudentService.getAssignments(studentId, classId),
            StudentService.getAcademicPerformance(studentId, classId),
            StudentService.getEvents(schoolId),
          ]);

          const today = [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
          ][new Date().getDay()];
          const todayClasses = timetable.filter((t: any) => t.day === today);

          return {
            personalInfo,
            stats: {
              attendancePercentage: attendance.percentage,
              pendingHomework: assignments.filter(
                (a: any) => a.status === "Not Submitted",
              ).length,
              upcomingExamsCount: academicPerformance.upcomingExams.length,
              feeStatus: fees.totalPending > 0 ? "Due" : "Paid",
              feePendingAmount: fees.totalPending,
            },
            todaySchedule: todayClasses,
            upcomingExams: academicPerformance.upcomingExams.slice(0, 3),
            recentHomework: assignments.slice(0, 5),
            notices: notices.slice(0, 5),
            feesPreview: fees,
          };
        },
        120,
      );
      return dashboardData;
    } catch (e: any) {
      console.error("CRITICAL ERROR in StudentService.getDashboardData:", e);
      logger.error("Error in StudentService.getDashboardData", e);
      throw e;
    }
  },

  getPersonalInfo(student: any) {
    return {
      name: student.user?.name,
      class: student.class?.name,
      rollNo: student.academicRecords?.[0]?.rollNumber || "",
      profilePic: student.user?.profilePic,
      email: student.user?.email,
      phone: student.user?.phone,
      admissionDate: student.admissionDate,
      routeId: student.routeId,
      busStopId: student.busStopId,
    };
  },

  async getAcademicPerformance(studentId: string, classId: string) {
    const results = await prisma.result.findMany({
      where: {
        studentId,
        exam: {
          isPublished: true,
        },
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
        exam: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
        assignment: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const upcomingExams = await prisma.exam.findMany({
      where: {
        classId,
        scheduleDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduleDate: "asc",
      },
      take: 5,
      select: {
        title: true,
        scheduleDate: true,
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    return { recentResults: results, upcomingExams };
  },

  async getAttendance(studentId: string) {
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        date: true,
        present: true,
      },
      orderBy: { date: "desc" },
      take: 30,
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.present).length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    const recentRecords = attendance.slice(0, 10).map((a) => ({
      date: a.date,
      status: a.present ? "Present" : "Absent",
    }));

    return { percentage, totalDays, presentDays, recentRecords };
  },

  async getFees(studentId: string, schoolId: string) {
    try {
      // 1. Get Active Academic Year
      const academicYear = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
        select: { id: true },
      });

      if (!academicYear) {
        return {
          totalAssigned: 0,
          totalPaid: 0,
          totalPending: 0,
          pendingFees: [],
          paymentHistory: [],
        };
      }

      // 2. Get Student Balance from Ledger (receivable, advance, collected)
      const balance = await PaymentSettlementService.getStudentBalance(
        schoolId,
        academicYear.id,
        studentId,
      );

      // 3. Get Outstanding Dues & Student Info & Direct Payment Records (in parallel)
      const [outstandingDuesBreakdown, directPayments, studentDetail] =
        await Promise.all([
          PaymentSettlementService.getOutstandingDues(
            prisma,
            schoolId,
            academicYear.id,
            studentId,
          ),
          // Fetch Payment records directly — covers all payment methods, includes invoice/receipt data
          prisma.payment.findMany({
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
          }),
          prisma.student.findUnique({
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
          }),
        ]);

      const feePlan = await prisma.studentFeePlan.findFirst({
        where: {
          studentId,
          schoolId,
          academicYearId: academicYear.id,
          isActive: true,
        },
        select: { createdAt: true },
      });

      const totalPending = balance.netBalance;
      const totalPaid = balance.collected;

      return {
        totalAssigned: balance.receivable,
        totalPaid,
        totalPending,
        personalInfo: {
          id: studentId,
          schoolId: schoolId,
          userId: studentDetail?.userId,
          name: studentDetail?.user.name,
          email: studentDetail?.user.email,
          phone: studentDetail?.user.phone,
        },
        pendingFees:
          outstandingDuesBreakdown.map((h) => ({
            id: h.feeHeadId,
            amount: h.outstanding,
            dueDate: feePlan?.createdAt || new Date(),
            title: h.feeHeadName,
            description: `Outstanding balance for ${h.feeHeadName}. Total due: ₹${h.totalDue}, Paid: ₹${h.paid}.`,
          })) || [],
        paymentHistory: directPayments.map((p) => ({
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
    } catch (error) {
      logger.error("Error in getFees:", error);
      throw error;
    }
  },

  async getLibraryInfo(userId: string) {
    // Find library member for this user
    const libraryMember = await prisma.libraryMember.findUnique({
      where: { userId },
    });

    if (!libraryMember) {
      return [];
    }

    const bookIssues = await prisma.issueTransaction.findMany({
      where: { memberId: libraryMember.id },
      select: {
        issueDate: true,
        dueDate: true,
        returnDate: true,
        fineAmount: true,
        bookCopy: {
          select: {
            book: {
              select: {
                title: true,
                isbn: true,
              },
            },
          },
        },
        fineLedgers: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
      take: 20,
    });

    const currentBooks = bookIssues
      .filter((b) => !b.returnDate)
      .map((issue) => {
        const ledgerFines = issue.fineLedgers.reduce(
          (sum, ledger) => sum + Number(ledger.amount),
          0,
        );
        const totalFine = ledgerFines + Number(issue.fineAmount || 0);
        return {
          title: issue.bookCopy.book.title,
          isbn: issue.bookCopy.book.isbn,
          issueDate: issue.issueDate,
          dueDate: issue.dueDate,
          fine: totalFine,
        };
      });

    const pastBooks = bookIssues
      .filter((b) => b.returnDate)
      .map((issue) => {
        const ledgerFines = issue.fineLedgers.reduce(
          (sum, ledger) => sum + Number(ledger.amount),
          0,
        );
        const totalFine = ledgerFines + Number(issue.fineAmount || 0);
        return {
          title: issue.bookCopy.book.title,
          isbn: issue.bookCopy.book.isbn,
          issueDate: issue.issueDate,
          returnDate: issue.returnDate,
          fine: totalFine,
        };
      });

    return {
      currentBooks,
      pastBooks,
    };
  },

  async getTransportInfo(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        busId: true,
      },
    });

    if (!student?.busId) return null;

    const bus = await prisma.bus.findUnique({
      where: { id: student.busId },
      include: {
        drivers: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
        routes: {
          include: {
            busStops: {
              select: {
                name: true,
                location: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!bus) return null;

    const driverName = bus.drivers?.[0]?.user?.name || null;
    const route = bus.routes?.[0];

    return {
      busNumber: bus.busNumber,
      driverName,
      routeName: route?.name || null,
      stops:
        route?.busStops?.map((stop) => ({
          name: stop.name,
          location: stop.location,
        })) || [],
    };
  },

  async getEvents(schoolId: string) {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        schoolId,
        start: {
          gte: new Date(),
        },
      },
      orderBy: {
        start: "asc",
      },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        start: true,
        end: true,
        category: true,
        attachment: true,
        targetAudience: true,
        roles: {
          select: {
            name: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return upcomingEvents;
  },

  async getDoubts(userId: string) {
    const doubts = await prisma.doubt.findMany({
      where: { userId },
      include: {
        replies: { include: { user: { select: { name: true } } } },
        subject: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return doubts.map((doubt) => ({
      id: doubt.id,
      title: doubt.title,
      content: doubt.content,
      subject: doubt.subject?.name,
      createdAt: doubt.createdAt,
      answers: doubt.replies.map((a) => ({
        content: a.content,
        answeredBy: a.user.name,
        createdAt: a.createdAt,
      })),
    }));
  },

  async getQuizzes(userId: string, classId: string) {
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            title: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const activeQuizzes = await prisma.quiz.findMany({
      where: {
        classId,
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    return {
      results: quizResults.map((result) => ({
        quizTitle: result.quiz.title,
        score: result.score,
        maxScore: result.quiz.points,
        attemptedAt: result.createdAt,
      })),
      activeQuizzes,
    };
  },

  async getRoadmaps(userId: string) {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        startDate: true,
        topics: {
          select: {
            name: true,
            isCompleted: true,
            completedAt: true,
          },
          take: 50,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: 10,
    });

    return roadmaps.map((roadmap) => {
      const completedTopics = roadmap.topics.filter(
        (t) => t.isCompleted,
      ).length;
      const totalTopics = roadmap.topics.length;
      const progress =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        title: roadmap.title,
        progress,
        topics: roadmap.topics.map((t) => ({
          name: t.name,
          isCompleted: t.isCompleted,
          completedAt: t.completedAt,
        })),
      };
    });
  },

  async getNewspaperSubmissions(studentId: string) {
    const submissions = await prisma.newspaperSubmission.findMany({
      where: { studentId },
      include: {
        newspaper: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    return submissions.map((sub: any) => ({
      newspaperTitle: sub.newspaper.title,
      articleTitle: sub.content,
      submittedAt: sub.submittedAt,
      feedback: sub.feedback,
      score: sub.score,
    }));
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
      subject: t.subject?.name ?? "N/A",
      teacher: t.teacher?.user?.name ?? "TBD",
      class: t.class?.name ?? "N/A",
      room: "N/A",
    }));
  },

  async getAssignments(studentId: string, classId: string) {
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

  async getParentsInfo(studentId: string) {
    const parents = await prisma.parent.findMany({
      where: { students: { some: { id: studentId } } },
      include: { user: true },
    });

    return parents.map((p) => ({
      name: p.user?.name,
      email: p.user?.email,
      phone: p.user?.phone,
    }));
  },

  async submitHomework(studentId: string, homeworkId: string, fileUrl: string) {
    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        id:
          (
            await prisma.homeworkSubmission.findFirst({
              where: { studentId, homeworkId },
            })
          )?.id || "new-id",
      },
      update: {
        file: fileUrl,
        submittedAt: new Date(),
      },
      create: {
        studentId,
        homeworkId,
        file: fileUrl,
        submittedAt: new Date(),
      },
    });

    // Update parent homework status to SUBMITTED if it's currently PENDING
    await prisma.homeWork.updateMany({
      where: {
        id: homeworkId,
        status: "PENDING"
      },
      data: {
        status: "SUBMITTED" as any
      }
    });

    return submission;
  },

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    fileUrl: string,
  ) {
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        file: fileUrl,
        submittedAt: new Date(),
      },
      create: {
        studentId,
        assignmentId,
        file: fileUrl,
        submittedAt: new Date(),
      },
    });

    // Update parent assignment status to COMPLETED if it's currently PENDING
    await prisma.assignment.updateMany({
      where: {
        id: assignmentId,
        status: "PENDING"
      },
      data: {
        status: "COMPLETED" as any
      }
    });

    return submission;
  },
};
