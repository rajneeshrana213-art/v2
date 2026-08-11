
import { prisma } from "../../prisma";
import { getCachedOrFetch } from "../../utils/performance";
import logger from "../../utils/logger";
import { AttendanceStatus, AttendanceType, isLeaveApproved, TicketStatus, TicketPriority } from "@prisma/client";
import { getInstitutionalToday, getInstitutionalNow, getISTHours, getISTMinutes } from "../../utils/date-utils";

// Attendance constants
const WORK_START_HOUR = 9;
const LATE_THRESHOLD_MINUTES = 15;
const HALF_DAY_LATE_MINUTES = 120;
const WORK_END_HOUR = 18;
const EARLY_EXIT_THRESHOLD_MINUTES = 30;
const OVERTIME_THRESHOLD_HOURS = 8;

export const EmployeeService = {
  async getDashboardData(userId: string) {
    try {
      // Get employee record
      const cacheKey = `employee:${userId}`;
      const employee = await getCachedOrFetch(
        cacheKey,
        async () => {
          return prisma.employee.findFirst({
            where: { userId },
            select: {
              id: true,
              employeeCode: true,
              employeeType: true,
              status: true,
              company: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
              designation: {
                select: {
                  id: true,
                  name: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  profilePic: true,
                },
              },
            },
          });
        },
        600 // Cache for 10 minutes
      );

      if (!employee) {
        throw new Error("Employee not found for this user");
      }

      const employeeId = employee.id;

      // Get dashboard data with caching
      const dashboardCacheKey = `dashboard:employee:${employeeId}`;
      const dashboardData = await getCachedOrFetch(
        dashboardCacheKey,
        async () => {
          const [
            todayAttendance,
            monthlyAttendance,
            recentPunchHistory,
            leaveStatus,
            assignedTickets,
            assignedTasks,
            attendanceStats,
            assignedLeads,
            scheduledDemos,
            employeeKPIs,
          ] = await Promise.all([
            this.getTodayAttendance(employeeId),
            this.getMonthlyAttendance(employeeId),
            this.getRecentPunchHistory(employeeId),
            this.getLeaveStatus(userId),
            this.getAssignedTickets(employeeId, userId),
            this.getAssignedTasks(userId),
            this.getAttendanceStats(employeeId),
            this.getAssignedLeads(userId),
            this.getScheduledDemos(userId),
            this.getEmployeeKPIs(employeeId),
          ]);

          return {
            personalInfo: {
              employeeId: employee.id,
              employeeCode: employee.employeeCode,
              name: employee.user.name,
              email: employee.user.email,
              phone: employee.user.phone,
              profilePic: employee.user.profilePic,
              employeeType: employee.employeeType,
              status: employee.status,
              company: employee.company,
              department: employee.department,
              designation: employee.designation,
            },
            todayAttendance,
            monthlyAttendance,
            recentPunchHistory,
            leaveStatus,
            assignedTickets,
            assignedTasks,
            attendanceStats,
            leads: assignedLeads,
            demos: scheduledDemos,
            kpis: employeeKPIs,
          };
        },
        120 // Cache for 2 minutes
      );

      return dashboardData;
    } catch (error) {
      logger.error("Employee Dashboard Error:", error);
      throw error;
    }
  },

  async getTodayAttendance(employeeId: string) {
    const today = getInstitutionalToday();

    const attendance = await prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance) {
      return {
        status: "NOT_PUNCHED",
        punchIn: null,
        punchOut: null,
        workingHours: 0,
        isLateEntry: false,
        isEarlyExit: false,
        overtimeHours: 0,
      };
    }

    return {
      status: attendance.status,
      punchIn: attendance.punchIn,
      punchOut: attendance.punchOut,
      workingHours: attendance.workingHours || 0,
      isLateEntry: attendance.isLateEntry,
      isEarlyExit: attendance.isEarlyExit,
      overtimeHours: attendance.overtimeHours || 0,
      attendanceType: attendance.attendanceType,
      notes: attendance.notes,
    };
  },

  async getMonthlyAttendance(employeeId: string, month?: number, year?: number) {
    const now = new Date();
    const selectedMonth = month !== undefined ? month - 1 : now.getMonth();
    const selectedYear = year !== undefined ? year : now.getFullYear();
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    const attendances = await prisma.employeeAttendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Calculate summary
    const totalDays = endDate.getDate();
    const presentDays = attendances.filter(
      (a: any) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
    ).length;
    const lateDays = attendances.filter((a: any) => a.isLateEntry).length;
    const absentDays = attendances.filter((a: any) => a.status === AttendanceStatus.ABSENT).length;
    const halfDays = attendances.filter((a: any) => a.attendanceType === AttendanceType.HALF_DAY).length;
    const totalWorkingHours = attendances.reduce((sum: number, a: any) => sum + (a.workingHours || 0), 0);
    const totalOvertimeHours = attendances.reduce((sum: number, a: any) => sum + (a.overtimeHours || 0), 0);

    return {
      month: selectedMonth + 1,
      year: selectedYear,
      calendar: attendances.map((a: any) => ({
        date: a.date,
        status: a.status,
        punchIn: a.punchIn,
        punchOut: a.punchOut,
        workingHours: a.workingHours,
        isLateEntry: a.isLateEntry,
        isEarlyExit: a.isEarlyExit,
        overtimeHours: a.overtimeHours,
        attendanceType: a.attendanceType,
      })),
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        halfDays,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      },
    };
  },

  async getRecentPunchHistory(employeeId: string, limit: number = 10) {
    const attendances = await prisma.employeeAttendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        date: true,
        punchIn: true,
        punchOut: true,
        workingHours: true,
        status: true,
        isLateEntry: true,
        isEarlyExit: true,
        overtimeHours: true,
        attendanceType: true,
        notes: true,
      },
    });

    return attendances;
  },

  async getLeaveStatus(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [pendingLeaves, approvedLeaves, rejectedLeaves, upcomingLeaves] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: {
          userId,
          isApproved: "PENDING",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          reason: true,
          fromDate: true,
          toDate: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          userId,
          isApproved: "APPROVED",
          fromDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { fromDate: "desc" },
        select: {
          id: true,
          reason: true,
          fromDate: true,
          toDate: true,
          approvedAt: true,
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          userId,
          isApproved: "REJECTED",
          createdAt: {
            gte: startOfMonth,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          reason: true,
          fromDate: true,
          toDate: true,
          rejectionReason: true,
          createdAt: true,
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          userId,
          isApproved: "APPROVED",
          fromDate: {
            gt: now,
          },
        },
        orderBy: { fromDate: "asc" },
        take: 5,
        select: {
          id: true,
          reason: true,
          fromDate: true,
          toDate: true,
        },
      }),
    ]);

    const totalApprovedDays = approvedLeaves.reduce((sum, leave) => {
      const days = Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    return {
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves,
      upcoming: upcomingLeaves,
      stats: {
        pendingCount: pendingLeaves.length,
        approvedCount: approvedLeaves.length,
        rejectedCount: rejectedLeaves.length,
        totalApprovedDays,
      },
    };
  },

  async getAssignedTickets(employeeId: string, userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { employeeId: employeeId },
          { assignedToId: userId }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        User: {
          select: {
            name: true,
            school: {
              select: {
                schoolName: true
              }
            }
          }
        }
      },
    });

    return {
      tickets,
      totalCount: tickets.length,
      openCount: tickets.filter((t) => t.status === "OPEN").length,
      inProgressCount: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolvedCount: tickets.filter((t) => t.status === "RESOLVED").length,
    };
  },

  async getAssignedTasks(userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,
      },
    });

    return tasks;
  },

  async getAttendanceStats(employeeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [thisMonth, lastMonth] = await Promise.all([
      prisma.employeeAttendance.findMany({
        where: {
          employeeId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.employeeAttendance.findMany({
        where: {
          employeeId,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth,
          },
        },
      }),
    ]);

    const thisMonthStats = {
      present: thisMonth.filter(
        (a: any) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
      ).length,
      absent: thisMonth.filter((a: any) => a.status === AttendanceStatus.ABSENT).length,
      late: thisMonth.filter((a: any) => a.isLateEntry).length,
      totalWorkingHours: thisMonth.reduce((sum: number, a: any) => sum + (a.workingHours || 0), 0),
      totalOvertimeHours: thisMonth.reduce((sum: number, a: any) => sum + (a.overtimeHours || 0), 0),
    };

    const lastMonthStats = {
      present: lastMonth.filter(
        (a: any) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
      ).length,
      absent: lastMonth.filter((a: any) => a.status === AttendanceStatus.ABSENT).length,
      late: lastMonth.filter((a: any) => a.isLateEntry).length,
      totalWorkingHours: lastMonth.reduce((sum: number, a: any) => sum + (a.workingHours || 0), 0),
      totalOvertimeHours: lastMonth.reduce((sum: number, a: any) => sum + (a.overtimeHours || 0), 0),
    };

    return {
      thisMonth: thisMonthStats,
      lastMonth: lastMonthStats,
      trend: {
        presentChange: thisMonthStats.present - lastMonthStats.present,
        workingHoursChange: thisMonthStats.totalWorkingHours - lastMonthStats.totalWorkingHours,
      },
    };
  },

  async getAssignedLeads(userId: string) {
    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return {
      leads,
      totalCount: await prisma.lead.count({ where: { assignedToId: userId } }),
      newCount: await prisma.lead.count({ where: { assignedToId: userId, status: "NEW" } }),
    };
  },

  async getScheduledDemos(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const demos = await prisma.demo.findMany({
      where: {
        conductedById: userId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: startOfToday,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            schoolName: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 5,
    });
    return demos;
  },

  async getAllDemos(userId: string) {
    console.log('EmployeeService.getAllDemos called with:', userId);
    try {
      const demos = await prisma.demo.findMany({
        where: {
          conductedById: userId,
        },
        include: {
          lead: {
            select: {
              id: true,
              schoolName: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            }
          }
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      });
      return demos;
    } catch (error) {
      console.error('Error in getAllDemos:', error);
      throw error;
    }
  },

  async getEmployeeKPIs(employeeId: string) {
    const now = new Date();
    const currentPeriod = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    const kpis = await prisma.employeeKPI.findMany({
      where: {
        employeeId,
        period: currentPeriod,
      },
    });

    return kpis;
  },

  async punchIn(userId: string) {
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new Error("Employee not found");
    if (employee.status !== "ACTIVE") throw new Error("Employee is not active");

    const today = getInstitutionalToday();

    const existing = await prisma.employeeAttendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } }
    });

    if (existing && existing.punchIn) {
      throw new Error("Already punched in today");
    }

    const now = getInstitutionalNow();

    // Calculate late minutes using IST hours
    const punchHour = getISTHours(now);
    const punchMinute = getISTMinutes(now);
    const totalPunchMinutes = punchHour * 60 + punchMinute;
    const workStartMinutes = WORK_START_HOUR * 60;
    const lateMinutes = Math.max(0, totalPunchMinutes - workStartMinutes);
    const isLate = lateMinutes > LATE_THRESHOLD_MINUTES;

    let attendanceType: AttendanceType = AttendanceType.FULL_DAY;
    if (lateMinutes >= HALF_DAY_LATE_MINUTES) attendanceType = AttendanceType.HALF_DAY;

    const attendance = await prisma.employeeAttendance.upsert({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      update: {
        punchIn: now,
        status: AttendanceStatus.PRESENT,
        isLateEntry: isLate,
        attendanceType,
        notes: isLate ? `Late entry by ${lateMinutes} minutes` : undefined,
        updatedAt: now
      },
      create: {
        employeeId: employee.id,
        date: today,
        punchIn: now,
        status: AttendanceStatus.PRESENT,
        isLateEntry: isLate,
        attendanceType,
        notes: isLate ? `Late entry by ${lateMinutes} minutes` : undefined
      }
    });

    return attendance;
  },

  async punchOut(userId: string) {
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new Error("Employee not found");

    const today = getInstitutionalToday();

    const existing = await prisma.employeeAttendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } }
    });

    if (!existing || !existing.punchIn) {
      throw new Error("Cannot punch out without punch in");
    }

    if (existing.punchOut) {
      throw new Error("Already punched out today");
    }

    const punchOut = getInstitutionalNow();
    const workingHours = (punchOut.getTime() - existing.punchIn.getTime()) / (1000 * 60 * 60);

    // Check for early exit
    const punchOutHour = getISTHours(punchOut);
    const punchOutMinute = getISTMinutes(punchOut);
    const punchOutTotalMinutes = punchOutHour * 60 + punchOutMinute;
    const workEndMinutes = WORK_END_HOUR * 60;
    const earlyMinutes = workEndMinutes - punchOutTotalMinutes;
    const isEarlyExit = earlyMinutes > EARLY_EXIT_THRESHOLD_MINUTES;

    // Calculate overtime
    const overtimeHours = Math.max(0, workingHours - OVERTIME_THRESHOLD_HOURS);

    // Downgrade to half day if worked less than 4 hours
    let attendanceType = existing.attendanceType;
    if (workingHours < 4) attendanceType = AttendanceType.HALF_DAY;

    const attendance = await prisma.employeeAttendance.update({
      where: { id: existing.id },
      data: {
        punchOut,
        workingHours: Math.round(workingHours * 100) / 100,
        isEarlyExit,
        overtimeHours: overtimeHours > 0 ? Math.round(overtimeHours * 100) / 100 : null,
        attendanceType,
        updatedAt: punchOut
      }
    });

    return attendance;
  },

  async applyLeave(userId: string, data: { fromDate: string; toDate: string; reason: string; type: "LEAVE" | "COMP_OFF" }) {
    const fromDate = new Date(data.fromDate);
    const toDate = new Date(data.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error("Invalid date range");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      throw new Error("Cannot apply for leave in past days");
    }

    if (toDate < fromDate) {
      throw new Error("To Date cannot be before From Date");
    }

    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (data.type === "LEAVE" && diffDays > 30) {
      throw new Error("General Leave cannot exceed 30 days");
    }

    if (data.type === "COMP_OFF" && diffDays > 15) {
      throw new Error("Comp-off cannot exceed 15 days");
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        fromDate,
        toDate,
        reason: `${data.type}: ${data.reason}`,
        isApproved: isLeaveApproved.PENDING,
      }
    });

    return leaveRequest;
  },

  async getLeaveRequests(userId: string) {
    const requests = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return requests;
  },

  async updateTicketStatus(userId: string, ticketId: string, status: TicketStatus) {
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new Error("Employee not found");

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        OR: [
          { employeeId: employee.id },
          { assignedToId: userId }
        ]
      }
    });

    if (!ticket) throw new Error("Ticket not found or not assigned to you");

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status, updatedAt: new Date() }
    });

    return updatedTicket;
  },

  async getAllTickets(filters: { status?: TicketStatus; priority?: TicketPriority; skipAssigned?: boolean; assignedToId?: string } = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.skipAssigned) {
      where.assignedToId = null;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        attachment: true,
        User: {
          select: {
            name: true,
            school: {
              select: {
                schoolName: true
              }
            }
          }
        }
      },
    });

    return tickets;
  },

  async assignTicketToSelf(userId: string, ticketId: string) {
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new Error("Employee not found");

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: userId,
        employeeId: employee.id,
        status: TicketStatus.IN_PROGRESS,
        updatedAt: new Date(),
      }
    });

    return updatedTicket;
  },

  async createInternalTicket(userId: string, data: { title: string; description: string; category?: string; priority?: TicketPriority; attachment?: string }) {
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new Error("Employee not found");

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || TicketPriority.LOW,
        attachment: data.attachment,
        userId: userId,
        status: TicketStatus.OPEN,
      }
    });

    return ticket;
  },

  async updateDemoStatus(demoId: string, status: string, notes?: string) {
    const demo = await prisma.demo.update({
      where: { id: demoId },
      data: {
        status: status as any,
        ...(notes && { notes })
      },
      include: {
        lead: true
      }
    });

    return demo;
  }
};
