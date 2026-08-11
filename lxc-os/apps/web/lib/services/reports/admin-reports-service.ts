
import { prisma } from "../../prisma";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from "date-fns";
import { 
  PaymentStatus, 
  Role, 
  ActiveStatus, 
  IssueStatus, 
  PayrollStatus, 
  RequestStatus, 
  TicketStatus,
  TransactionType
} from "@prisma/client";

export const AdminReportsService = {
  async getOverviewReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalStaff,
      totalEarnings,
      avgAttendance,
      openTickets,
      lowStockItems,
      todayVisitors,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, status: ActiveStatus.ACTIVE } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.user.count({ where: { schoolId, role: Role.staff } }),
      prisma.payment.aggregate({
        where: {
          schoolId,
          status: PaymentStatus.COMPLETED,
          paymentDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.getOverallAttendancePercentage(schoolId, startDate, endDate),
      prisma.ticket.count({
        where: { schoolId, status: TicketStatus.OPEN },
      }),
      prisma.inventoryItem.count({
        where: { schoolId, quantity: { lt: 10 } }, // Threshold of 10
      }),
      prisma.visitor.count({
        where: {
          schoolId,
          entryTime: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
        },
      }),
    ]);

    const routeCount = await prisma.route.count({ where: { schoolId } });

    return {
      metrics: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalStaff,
        totalEarnings: totalEarnings._sum.amount || 0,
        avgAttendance,
        openTickets,
        lowStockItems,
        todayVisitors,
        routes: routeCount,
      },
      dateRange: { from: startDate, to: endDate },
    };
  },

  async getAcademicReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { students: true, Section: true },
        },
        Exam: {
          where: { scheduleDate: { gte: startDate, lte: endDate } },
          include: {
            results: true,
          },
        },
      },
    });

    const report = classes.map((cls) => {
      let totalScore = 0;
      let resultCount = 0;
      cls.Exam.forEach((exam) => {
        exam.results.forEach((res) => {
          totalScore += res.score;
          resultCount++;
        });
      });

      return {
        classId: cls.id,
        className: cls.name,
        studentCount: cls._count.students,
        sectionCount: cls._count.Section,
        performanceIndex: resultCount > 0 ? Math.round(totalScore / resultCount) : 0,
      };
    });

    return { data: report };
  },

  async getAttendanceReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const attendanceData = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        student: { schoolId },
      },
      select: {
        present: true,
        status: true,
      },
    });

    const total = attendanceData.length;
    const present = attendanceData.filter((a) => a.present).length;
    const emergency = attendanceData.filter((a) => a.status === "EMERGENCY").length;

    return {
      overall: total > 0 ? Math.round((present / total) * 100) : 0,
      totalRecords: total,
      presentCount: present,
      absentCount: total - present,
      emergencyCount: emergency,
    };
  },

  async getFinanceReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const [earnings, expenses] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          schoolId,
          status: PaymentStatus.COMPLETED,
          paymentDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.schoolExpense.aggregate({
        where: {
          schoolId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const inflow = earnings._sum.amount || 0;
    const outflow = expenses._sum.amount || 0;

    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      netBalance: inflow - outflow,
    };
  },

  async getTransportReport(schoolId: string) {
    const [buses, routes, drivers] = await Promise.all([
      prisma.bus.count({ where: { schoolId } }),
      prisma.route.count({ where: { schoolId } }),
      prisma.driver.count({ where: { schoolId } }),
    ]);

    const routeDetails = await prisma.route.findMany({
      where: { schoolId },
      include: {
        _count: { select: { students: true } },
      },
    });

    return {
      summary: { buses, routes, drivers },
      routes: routeDetails.map((r) => ({
        name: r.name,
        students: r._count.students,
        buses: 0, // In schema Route has single bus relation, summary uses global count
      })),
    };
  },

  async getStaffReport(schoolId: string) {
    const [teachers, staff] = await Promise.all([
      prisma.teacher.findMany({
        where: { schoolId },
        select: { status: true },
      }),
      prisma.user.findMany({
        where: { schoolId, role: Role.staff },
        select: { id: true },
      }),
    ]);

    return {
      teachers: {
        total: teachers.length,
        active: teachers.filter((t) => t.status === ActiveStatus.ACTIVE).length,
      },
      staff: {
        total: staff.length,
      },
    };
  },

  async getLibraryReport(schoolId: string) {
    const library = await prisma.library.findFirst({
      where: { schoolId },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    if (!library) return { totalBooks: 0, issuedBooks: 0, overdueBooks: 0 };

    const [issuedBooks, overdueBooks] = await Promise.all([
      prisma.issueTransaction.count({
        where: {
          bookCopy: { book: { libraryId: library.id } },
          status: IssueStatus.ISSUED,
        },
      }),
      prisma.issueTransaction.count({
        where: {
          bookCopy: { book: { libraryId: library.id } },
          status: IssueStatus.ISSUED,
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      totalBooks: library._count.books,
      issuedBooks,
      overdueBooks,
    };
  },

  async getHostelReport(schoolId: string) {
    const hostels = await prisma.hostel.findMany({
      where: { schoolId },
      include: {
        _count: { select: { allocation: true } },
        blocks: {
          include: {
            floors: {
              include: {
                rooms: {
                  include: {
                    beds: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const report = hostels.map((h) => {
      let totalBeds = 0;
      let occupiedBeds = 0;

      h.blocks.forEach((b) => {
        b.floors.forEach((f) => {
          f.rooms.forEach((r) => {
            r.beds.forEach((bed) => {
              totalBeds++;
              if (bed.status !== "AVAILABLE") occupiedBeds++;
            });
          });
        });
      });

      return {
        name: h.name,
        capacity: h.capacity,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
      };
    });

    return { data: report };
  },

  async getInventoryReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const items = await prisma.inventoryItem.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: {
            transactions: {
              where: { date: { gte: startDate, lte: endDate } },
            },
          },
        },
      },
    });

    const recentTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        inventoryItem: { schoolId },
        date: { gte: startDate, lte: endDate },
      },
      include: { inventoryItem: { select: { name: true } } },
      take: 10,
      orderBy: { date: "desc" },
    });

    return {
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        transactionCount: i._count.transactions,
        status: i.quantity < 10 ? "LOW_STOCK" : "OK",
      })),
      recentTransactions: recentTransactions.map((t) => ({
        item: t.inventoryItem.name,
        type: t.type,
        quantity: t.quantity,
        date: t.date,
      })),
    };
  },

  async getHRReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const [payrolls, leaveRequests] = await Promise.all([
      prisma.payroll.findMany({
        where: {
          schoolId,
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          user: { schoolId },
          fromDate: { gte: startDate },
        },
        include: { user: { select: { name: true, role: true } } },
      }),
    ]);

    const totalSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const paidCount = payrolls.filter((p) => p.status === PayrollStatus.PAID).length;

    return {
      payroll: {
        totalSalary,
        recordCount: payrolls.length,
        paidCount,
        pendingCount: payrolls.length - paidCount,
      },
      leaves: leaveRequests.map((l) => ({
        staffName: l.user.name,
        role: l.user.role,
        days: Math.ceil((l.toDate.getTime() - l.fromDate.getTime()) / (1000 * 3600 * 24)) + 1,
        status: l.status,
      })),
    };
  },

  async getOperationsReport(schoolId: string, from?: string, to?: string) {
    const startDate = from ? new Date(from) : startOfMonth(new Date());
    const endDate = to ? new Date(to) : endOfMonth(new Date());

    const [visitors, tickets] = await Promise.all([
      prisma.visitor.findMany({
        where: {
          schoolId,
          entryTime: { gte: startDate, lte: endDate },
        },
      }),
      prisma.ticket.findMany({
        where: {
          schoolId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const ticketSummary = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
      closed: tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
    };

    return {
      visitors: {
        total: visitors.length,
        averageStay: visitors.length > 0 ? "2.5 hrs" : "0", // Mock or calculate if exitTime exists
      },
      tickets: ticketSummary,
      recentVisitors: visitors.slice(0, 5).map((v) => ({
        name: v.name,
        purpose: v.purpose,
        time: v.entryTime,
      })),
    };
  },

  // Helper
  async getOverallAttendancePercentage(schoolId: string, start: Date, end: Date) {
    const records = await prisma.attendance.aggregate({
      where: {
        date: { gte: start, lte: end },
        student: { schoolId },
      },
      _count: { id: true },
    });

    const present = await prisma.attendance.count({
      where: {
        date: { gte: start, lte: end },
        student: { schoolId },
        present: true,
      },
    });

    if (records._count.id === 0) return 0;
    return Math.round((present / records._count.id) * 100);
  },
};
