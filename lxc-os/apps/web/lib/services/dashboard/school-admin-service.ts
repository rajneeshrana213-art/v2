
import { prisma } from "../../prisma";
import { startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, subQuarters } from "date-fns";
import { PaymentStatus } from "@prisma/client";
import { INSTITUTION_TIMEZONE, formatISTDateKey, getISTNowParts, parseInstitutionalDate } from "@/lib/utils/date-utils";

/**
 * Normalise any date to IST start-of-day, returning the correct UTC Date for DB queries.
 * Works for both "today" and user-supplied date strings.
 */
function toISTDayStart(date: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: INSTITUTION_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  return new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00+05:30`);
}

function toISTDayEnd(date: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: INSTITUTION_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  const end = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T23:59:59+05:30`);
  end.setMilliseconds(999);
  return end;
}


export const SchoolAdminService = {
  async getDashboardData(schoolId: string, filters: any) {
    const [
      keyMetrics,
      schedules,
      attendance,
      classRoutines,
      earnings,
      expenses,
      feesCollected,
      notices,
      topSubjects,
      studentActivities,
      todos,
      feesCollectionChart,
      leaveRequests,
      upcomingEvents,
      bestPerformer,
      starStudents,
      performanceMetrics,
    ] = await Promise.all([
      this.getKeyMetrics(schoolId),
      this.getSchedules(schoolId),
      this.getAttendance(filters?.attendanceDate, schoolId),
      this.getClassRoutines(schoolId),
      this.getTotalEarnings(schoolId),
      this.getTotalExpenses(schoolId),
      this.getTotalFeesCollected(schoolId),
      this.getNotices(schoolId),
      this.getTopSubjects(filters?.classFilter || "Class II", schoolId),
      this.getStudentActivities(filters?.activityFilter || "THIS MONTH", schoolId),
      this.getTodos(filters?.todoFilter || "TODAY", schoolId),
      this.getFeesCollectionChart(filters?.feesFilter || "Last 8 Quarters", schoolId),
      this.getLeaveRequests(filters?.leaveFilter || "Today", schoolId),
      this.getUpcomingEvents(schoolId),
      this.getBestPerformer(schoolId),
      this.getStarStudents(schoolId),
      this.getPerformanceMetrics(filters?.performanceMonth || "Oct 2024", schoolId),
    ]);

    const aiInsights = await this.getAIInsights(schoolId, { keyMetrics, attendance, earnings });

    return {
      keyMetrics,
      schedules,
      attendance,
      classRoutines,
      quickLinks: [
        { name: "Calendar", icon: "calendar", color: "green" },
        { name: "Exam Result", icon: "exam", color: "blue" },
        { name: "Fees", icon: "fees", color: "cyan" },
        { name: "Home Works", icon: "homework", color: "red" },
      ],
      earnings,
      expenses,
      feesCollected,
      notices,
      topSubjects,
      studentActivities,
      todos,
      feesCollectionChart,
      leaveRequests,
      upcomingEvents,
      bestPerformer,
      starStudents,
      performanceMetrics,
      aiInsights,
    };
  },


  async getAIInsights(schoolId: string, data: any) {
    const { keyMetrics, attendance, earnings } = data;
    
    // Safety checks
    if (!attendance || !keyMetrics || !keyMetrics.totalStudents || !keyMetrics.interactions) {
        return {
            summary: "Unable to generate insights due to missing data.",
            score: 0,
            status: "N/A",
            trend: "up"
        };
    }

    // Logic for generating insights
    const insights = [];
    
    if (attendance.overallPercentage > 90) {
      insights.push("Exceptional attendance rates today! Your student engagement is at peak levels.");
    } else if (attendance.overallPercentage < 70) {
      insights.push("Attendance is lower than usual. Consider reviewing class engagement metrics.");
    }
    
    const totalStudents = keyMetrics.totalStudents.total || 0;
    const activeRatio = totalStudents > 0 
      ? keyMetrics.totalStudents.active / totalStudents 
      : 0;

    if (activeRatio > 0.95) {
      insights.push("Your enrollment retention is excellent. 95%+ of students are actively participating.");
    }
    
    if (keyMetrics.interactions.openTickets > 10) {
      insights.push(`There are ${keyMetrics.interactions.openTickets} open support tickets. Resolving these could improve parent satisfaction.`);
    }

    if (insights.length === 0) {
      insights.push("Operations are running smoothly. No critical issues detected by LearnX AI.");
    }

    const calculatedScore = (attendance.overallPercentage + (activeRatio * 100)) / 2;

    return {
      summary: insights[0],
      score: Math.min(100, isNaN(calculatedScore) ? 0 : calculatedScore),
      status: attendance.overallPercentage > 85 ? "Healthy" : "Attention Required",
      trend: "up"
    };
  },


  // Helper Functions
  percentageChange(current: number, previous: number): string {
    if (previous === 0) return "0";
    return (((current - previous) / previous) * 100).toFixed(1);
  },

  async getKeyMetrics(schoolId: string) {
    const startOfCurrentMonth = startOfMonth(new Date());

    const [
      totalStudents,
      activeStudents,
      previousStudents,
      totalTeachers,
      activeTeachers,
      previousTeachers,
      totalStaff,
      previousStaff,
      totalSubjects,
      activeSubjects,
      totalClasses,
      totalLibraries,
      totalBuses,
      totalDrivers,
      totalTickets,
      openTickets,
      pendingFeedback,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId, isDeleted: false } }).catch(() => 0),
      prisma.student.count({ where: { status: "ACTIVE", schoolId, isDeleted: false } }).catch(() => 0),
      prisma.student.count({ where: { schoolId, isDeleted: false, createdAt: { lt: startOfCurrentMonth } } }).catch(() => 0),
      prisma.teacher.count({ where: { schoolId, isDeleted: false } }).catch(() => 0),
      prisma.teacher.count({ where: { status: "ACTIVE", schoolId, isDeleted: false } }).catch(() => 0),
      prisma.teacher.count({ where: { schoolId, isDeleted: false, createdAt: { lt: startOfCurrentMonth } } }).catch(() => 0),
      prisma.user.count({ where: { role: "staff", schoolId, isDeleted: false } }).catch(() => 0),
      prisma.user.count({ where: { role: "staff", schoolId, isDeleted: false, createdAt: { lt: startOfCurrentMonth } } }).catch(() => 0),
      prisma.subject.count({ where: { schoolId } }).catch(() => 0),
      prisma.subject.count({ where: { status: "ACTIVE", schoolId } }).catch(() => 0),
      prisma.class.count({ where: { schoolId } }).catch(() => 0),
      prisma.library.count({ where: { schoolId } }).catch(() => 0),
      prisma.bus.count({ where: { schoolId } }).catch(() => 0),
      prisma.driver.count({ where: { schoolId } }).catch(() => 0),
      prisma.ticket.count({ where: { schoolId } }).catch(() => 0),
      prisma.ticket.count({ where: { schoolId, status: "OPEN" } }).catch(() => 0),
      prisma.feedback.count({ where: { schoolId, status: "PENDING" } }).catch(() => 0),
    ]);

    const activeStaff = totalStaff; // User model has no status field; all staff users are considered active

    return {
      totalStudents: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
        percentageChange: this.percentageChange(totalStudents, previousStudents),
      },
      totalTeachers: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: totalTeachers - activeTeachers,
        percentageChange: this.percentageChange(totalTeachers, previousTeachers),
      },
      totalStaff: {
        total: totalStaff,
        active: activeStaff,
        inactive: totalStaff - activeStaff,
        percentageChange: this.percentageChange(totalStaff, previousStaff),
      },
      totalClasses: {
        total: totalClasses,
        active: totalClasses,
        inactive: 0,
        percentageChange: "0", // Class model lacks createdAt
      },
      totalSubjects: {
        total: totalSubjects,
        active: activeSubjects,
        inactive: totalSubjects - activeSubjects,
        percentageChange: "0", // Subject model lacks createdAt
      },
      facilities: {
        // hostels: totalHostels,
        libraries: totalLibraries,
        buses: totalBuses,
        drivers: totalDrivers,
      },
      interactions: {
        totalTickets,
        openTickets,
        pendingFeedback,
      },
    };
  },

  async getSchedules(schoolId: string) {
    const now = new Date();

    const upcomingEvents = await prisma.event.findMany({
      where: {
        start: { gte: now },
        schoolId,
      },
      orderBy: {
        start: "asc",
      },
      take: 1,
      select: {
        title: true,
        start: true,
      },
    });

    const currentMonth = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    return {
      currentMonth,
      highlightedDate: now.getDate(),
      upcomingEvents: upcomingEvents.length
        ? upcomingEvents
        : [{ title: "Parents, Teacher Meet", start: new Date("2024-07-15") }],
    };
  },

  async getAttendance(dateFilter: string | undefined, schoolId: string) {
    const targetDate = dateFilter ? parseInstitutionalDate(dateFilter) : new Date();

    const startOfDay = toISTDayStart(targetDate);  // IST midnight → correct UTC
    const endOfDay   = toISTDayEnd(targetDate);     // IST 23:59:59 → correct UTC

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        student: {
          schoolId,
        },
      },
      select: {
        present: true,
        status: true,
        student: {
          select: {
            user: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter((r) => r.present).length;
    const overallPercentage = totalRecords ? Math.round((presentRecords / totalRecords) * 100) : 0;

    const studentsEmergency = attendanceRecords.filter(
      (r) => r.student?.user?.role === "student" && r.status === "EMERGENCY"
    ).length;

    const teachersAbsent = attendanceRecords.filter(
      (r) => r.student?.user?.role === "teacher" && r.status === "ABSENT"
    ).length;

    const staffLate = attendanceRecords.filter((r) => r.student?.user?.role === "staff" && r.status === "LATE").length;
    const staffEmergency = attendanceRecords.filter(
      (r) => r.student?.user?.role === "staff" && r.status === "EMERGENCY"
    ).length;
    const staffAbsent = attendanceRecords.filter(
      (r) => r.student?.user?.role === "staff" && r.status === "ABSENT"
    ).length;

    return {
      overallPercentage,
      issues: {
        students: { emergency: studentsEmergency },
        teachers: { absent: teachersAbsent },
        staff: {
          late: staffLate,
          emergency: staffEmergency,
          absent: staffAbsent,
        },
      },
      // Stable day key in IST (never flips on UTC hosts).
      dateFilter: formatISTDateKey(startOfDay),
    };
  },

  async getClassRoutines(schoolId: string) {
    // Month selection should follow institutional calendar (IST), not server UTC.
    const nowParts = getISTNowParts();
    const currentMonth = nowParts.month - 1; // JS Date month index
    const lastMonth = currentMonth - 1;

    const months = [lastMonth, currentMonth].map((month) => {
      const now = new Date();
      const firstDay = startOfMonth(new Date(now.getFullYear(), month, 1));
      const lastDay = endOfMonth(new Date(now.getFullYear(), month, 1));
      return {
        label: firstDay.toLocaleString("default", { month: "long", year: "numeric" }),
        start: firstDay,
        end: lastDay,
      };
    });

    const routines = await Promise.all(
      months.map(async (m) => {
        const lessonCount = await prisma.lesson.count({
          where: {
            startTime: {
              gte: m.start,
              lte: m.end,
            },
            subject: {
              schoolId,
            },
          },
        });

        const progress = Math.min((lessonCount / 100) * 100, 100);

        return {
          month: m.label,
          progress: Math.round(progress),
        };
      })
    );

    return { routines };
  },

  async getTotalEarnings(schoolId: string) {
    const earnings = await prisma.payment.aggregate({
      where: {
        studentId: { not: null },
        status: PaymentStatus.COMPLETED,
        student: {
          schoolId,
        },
      },
      _sum: { amount: true },
    });

    const graphData = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 11 - i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        return prisma.payment
          .aggregate({
            where: {
              studentId: { not: null },
              status: PaymentStatus.COMPLETED,
              paymentDate: { gte: start, lte: end },
              student: {
                schoolId,
              },
            },
            _sum: { amount: true },
          })
          .then((result) => ({
            month: start.toLocaleString("default", { month: "short" }),
            value: result._sum?.amount || 0,
          }));
      })
    );

    return {
      total: earnings._sum?.amount || 0,
      graphData,
    };
  },

  async getTotalExpenses(schoolId: string) {
    const expenses = await prisma.schoolExpense.aggregate({
      where: { schoolId },
      _sum: { amount: true },
    });

    const graphData = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 11 - i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        return prisma.schoolExpense
          .aggregate({
            where: {
              schoolId,
              date: {
                gte: start,
                lte: end,
              },
            },
            _sum: { amount: true },
          })
          .then((result) => ({
            month: start.toLocaleString("default", { month: "short" }),
            value: result._sum?.amount || 0,
          }));
      })
    );

    return {
      total: expenses._sum.amount || 0,
      graphData,
    };
  },

  async getTotalFeesCollected(schoolId: string) {
    const totalPaid = await prisma.payment.aggregate({
      where: {
        studentId: { not: null },
        status: PaymentStatus.COMPLETED,
        student: {
          schoolId,
        },
      },
      _sum: { amount: true },
    });

    const totalOutstandingResult = await prisma.financeLedger.groupBy({
      by: ["studentId"],
      where: {
        schoolId,
        debitAccount: {
          code: "STUDENT_RECEIVABLE",
        },
        transactionType: "DEMAND_GENERATION",
      },
      _sum: {
        amount: true,
      },
    });

    const totalOutstanding = totalOutstandingResult.reduce((sum, item) => {
      return sum + (item._sum.amount || 0);
    }, 0);

    const studentsWithOutstanding = await prisma.student.count({
      where: {
        schoolId,
        isDeleted: false,
      },
    });

    return {
      total: totalPaid._sum?.amount || 0,
      fineCollected: 0,
      studentNotPaid: studentsWithOutstanding,
      totalOutstanding,
      percentageChange: {
        total: 0,
        fine: 0,
        notPaid: 0,
        outstanding: 0,
      },
    };
  },

  async getNotices(schoolId: string) {
    const notices = await prisma.notice.findMany({
      where: { schoolId },
      orderBy: { noticeDate: "desc" },
      take: 5,
      select: {
        title: true,
        noticeDate: true,
        publishDate: true,
        createdAt: true,
      },
    });

    return notices.map((n) => {
      const daysSince = Math.floor((Date.now() - new Date(n.noticeDate).getTime()) / (1000 * 60 * 60 * 24));

      return {
        title: n.title,
        date: n.noticeDate.toLocaleDateString(),
        daysSince,
        icon: "document",
        color: "blue",
      };
    });
  },

  async getTopSubjects(classFilter: string, schoolId: string) {
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        class: {
          name: classFilter,
        },
        status: "ACTIVE",
      },
      select: {
        name: true,
        lessons: { select: { id: true } },
        Assignment: { select: { id: true } },
        Exam: { select: { id: true } },
      },
    });

    const subjectsWithPerformance = subjects.map((subject) => {
      const lessonCount = subject.lessons.length;
      const assignmentCount = subject.Assignment.length;
      const examCount = subject.Exam.length;

      const rawCompletion = lessonCount + assignmentCount + examCount;
      const performance = Math.min(100, rawCompletion * 10);

      return {
        name: subject.name,
        performance,
      };
    });

    const allClasses = await prisma.class.findMany({
      where: { schoolId },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    const availableClasses = allClasses.map((c) => c.name);

    return {
      class: classFilter,
      subjects: subjectsWithPerformance,
      availableClasses,
    };
  },

  async getStudentActivities(filter: string, schoolId: string) {
    const now = new Date();
    const fromDate = new Date();

    if (filter === "THIS WEEK") {
      fromDate.setDate(now.getDate() - 7);
    } else if (filter === "THIS MONTH") {
      fromDate.setDate(now.getDate() - 30);
    } else {
      fromDate.setDate(now.getDate() - 1);
    }

    const examActivities = await prisma.result.findMany({
      where: {
        examId: { not: null },
        createdAt: { gte: fromDate },
        score: { gte: 80 },
        student: {
          schoolId,
        },
      },
      include: {
        exam: { select: { title: true } },
        student: {
          select: {
            user: {
              select: {
                name: true,
                profilePic: true,
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const examMapped = examActivities.map((result) => ({
      title: `Top score in "${result.exam?.title}"`,
      description: `${result.student?.user?.name || "Student"} scored ${result.score} marks.`,
      image: result.student?.user?.profilePic || "assets/img/profiles/avatar-14.jpg",
    }));

    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        submittedAt: { gte: fromDate },
        student: {
          schoolId,
        },
      },
      include: {
        assignment: { select: { title: true } },
        student: {
          select: {
            user: {
              select: {
                name: true,
                profilePic: true,
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { submittedAt: "desc" },
    });

    const assignmentMapped = assignmentSubmissions.map((submission) => ({
      title: `Submitted "${submission.assignment?.title}"`,
      description: `${submission.student?.user?.name || "Student"} submitted assignment.`,
      image: submission.student?.user?.profilePic || "assets/img/profiles/avatar-14.jpg",
    }));

    return {
      filter,
      activities: [...examMapped, ...assignmentMapped].slice(0, 5),
    };
  },

  async getTodos(filter: string, schoolId: string) {
    const now = new Date();
    const fromDate = new Date();

    if (filter === "THIS WEEK") {
      fromDate.setDate(now.getDate() - 7);
    } else if (filter === "THIS MONTH") {
      fromDate.setDate(now.getDate() - 30);
    } else {
      fromDate.setDate(now.getDate() - 1);
    }

    const todos = await prisma.todo.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: fromDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        title: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      filter,
      tasks: todos.map((todo) => ({
        title: todo.title,
        dueDate: todo.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        status: todo.status,
      })),
    };
  },

  async getFeesCollectionChart(filter: string, schoolId: string) {
    const currentDate = new Date();

    const quarters = Array.from({ length: 8 }, (_, index) => {
      const quarterDate = subQuarters(currentDate, 7 - index);
      const start = startOfQuarter(quarterDate);
      const end = endOfQuarter(quarterDate);
      const label = `Q${Math.floor(start.getMonth() / 3) + 1}:${start.getFullYear()}`;

      return { label, start, end };
    });

    const data = await Promise.all(
      quarters.map(async ({ label, start, end }) => {
        const [totalFee, collectedFee] = await Promise.all([
          prisma.payment.aggregate({
            where: {
              paymentDate: { gte: start, lte: end },
              studentId: { not: null },
              student: {
                schoolId,
              },
            },
            _sum: { amount: true },
          }),
          prisma.payment.aggregate({
            where: {
              paymentDate: { gte: start, lte: end },
              status: PaymentStatus.COMPLETED,
              studentId: { not: null },
              student: {
                schoolId,
              },
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          quarter: label,
          totalFee: totalFee._sum?.amount || 0,
          collectedFee: collectedFee._sum?.amount || 0,
        };
      })
    );

    return {
      filter,
      data,
    };
  },

  async getLeaveRequests(filter: string, schoolId: string) {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        user: {
          school: {
            id: schoolId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return {
      filter,
      requests: leaveRequests.map((req) => {
        const isEmergency =
          req.reason?.toLowerCase().includes("emergency") || req.reason?.toLowerCase().includes("urgent");
        const leaveType = isEmergency ? "Emergency" : "Regular";

        return {
          id: req.id,
          user: {
            name: req.user?.name || "Unknown",
            role: req.user?.role || "staff",
            avatar: req.user?.profilePic || "assets/img/profiles/avatar-14.jpg",
          },
          type: leaveType,
          from: req.fromDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          to: req.toDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          reason: req.reason || "Not specified",
          status: req.status,
        };
      }),
    };
  },

  async getUpcomingEvents(schoolId: string) {
    const today = new Date();

    const events = await prisma.event.findMany({
      where: {
        schoolId,
      },
      orderBy: {
        start: "asc",
      },
      take: 5,
    });

    return events.map((event) => ({
      time: `${event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      title: event.title,
      date: event.start
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase(),
      iconColor: event.start > today ? "blue" : "pink",
      status: event.start > today ? "upcoming" : "past",
    }));
  },

  async getBestPerformer(schoolId: string) {
    const topTeacher = await prisma.teacher.findFirst({
      where: {
        schoolId,
        lessons: {
          some: {
            assignments: {
              some: {
                results: {
                  some: {},
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            role: true,
            profilePic: true,
          },
        },
        lessons: {
          select: {
            assignments: {
              select: {
                results: {
                  select: {
                    score: true,
                  },
                },
              },
              take: 10,
            },
            subject: {
              select: { name: true },
            },
          },
          take: 5,
        },
      },
    });

    if (!topTeacher) {
      return {
        name: "No Data",
        role: "N/A",
        image: "/images/default.jpg",
        carouselPosition: 0,
        totalItems: 0,
      };
    }

    const scores: number[] = [];

    for (const lesson of topTeacher.lessons) {
      for (const assignment of lesson.assignments) {
        for (const result of assignment.results) {
          if (typeof result.score === "number") scores.push(result.score);
        }
      }
    }

    const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

    return {
      name: topTeacher.user.name,
      role: topTeacher.user.role,
      image: topTeacher.user.profilePic || "/images/default.jpg",
      carouselPosition: 1,
      totalItems: 2,
      averageScore: Math.round(averageScore),
    };
  },

  async getStarStudents(schoolId: string) {
    const topScorer = await prisma.result.groupBy({
      by: ["studentId"],
      where: {
        student: {
          schoolId,
        },
      },
      _avg: {
        score: true,
      },
      orderBy: {
        _avg: {
          score: "desc",
        },
      },
      take: 1,
    });

    const top = topScorer[0];
    if (!top) {
      return {
        name: "No Data",
        class: "-",
        image: "/images/default-student.jpg",
        carouselPosition: 0,
        totalItems: 0,
      };
    }

    const student = await prisma.student.findUnique({
      where: { id: top.studentId },
      select: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        class: {
          select: {
            name: true,
            Section: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.user || !student.class) {
      return {
        name: "Data Missing",
        class: "-",
        image: "/images/default-student.jpg",
        carouselPosition: 0,
        totalItems: 0,
      };
    }

    const sectionNames = student.class.Section && Array.isArray(student.class.Section) 
      ? student.class.Section.map((s: any) => s.name).join(", ") 
      : "";

    return {
      name: student.user.name,
      class: `${student.class.name}${sectionNames ? ", " + sectionNames : ""}`,
      image: student.user.profilePic || "/images/default-student.jpg",
      averageScore: Math.round(top._avg.score ?? 0),
      carouselPosition: 1,
      totalItems: 2,
    };
  },

  async getPerformanceMetrics(month: string, schoolId: string) {
    let targetDate = new Date(); // Default to now
    
    if (month && typeof month === "string" && month.includes(" ")) {
        try {
            const [monthName, yearStr] = month.split(" ");
            const year = parseInt(yearStr);
            // Verify monthName is valid
            const tempDate = new Date(`${monthName} 1, ${year}`);
            if (!isNaN(tempDate.getTime())) {
                const monthIndex = tempDate.getMonth();
                targetDate = new Date(year, monthIndex);
            }
        } catch (e) {
            console.error("Error parsing performance month:", month, e);
        }
    }

    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const results = await prisma.result.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        student: {
          schoolId,
        },
      },
      select: {
        score: true,
      },
    });

    const topThreshold = 75;
    const avgThreshold = 40;

    let top = 0;
    let average = 0;
    let belowAverage = 0;

    for (const r of results) {
      if (r.score >= topThreshold) {
        top++;
      } else if (r.score >= avgThreshold) {
        average++;
      } else {
        belowAverage++;
      }
    }

    const availableMonths = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return date.toLocaleString("default", { month: "short", year: "numeric" });
    });

    return {
      month,
      data: {
        top,
        average,
        belowAverage,
      },
      availableMonths,
    };
  },
};
