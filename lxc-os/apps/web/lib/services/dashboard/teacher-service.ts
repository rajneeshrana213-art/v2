
import { prisma } from "../../prisma";
import { getInstitutionalToday, getInstitutionalEndOfDay, getISTCurrentDayOfWeek } from "../../utils/date-utils";


export const TeacherService = {
  async getDashboardData(userId: string) {
    try {
      const teacher = await prisma.teacher.findFirst({
          where: { userId },
          include: {
          user: true,
          school: true,
          classes: true,
          subjects: true,
          },
      });

      if (!teacher) {
          throw new Error("Teacher not found");
      }

      const teacherId = teacher.id;
      const schoolId = teacher.schoolId;
      const userRole = teacher.user.role;
      const today = getInstitutionalToday(); // IST midnight → correct UTC for Vercel

      const [
        personalInfo, 
        classOverview, 
        homeworkToReviewCount, 
        timetable, 
        notices, 
        attendanceStatus,
        recentDoubts,
        recentSubmissions
      ] = await Promise.all([
        Promise.resolve(this.getPersonalInfo(teacher)).catch(err => { console.error("Error in getPersonalInfo:", err); return null; }),
        this.getClassOverview(teacher.classes || []).catch(err => { console.error("Error in getClassOverview:", err); return []; }),
        this.getHomeworkToReviewCount(teacher.id).catch(err => { console.error("Error in getHomeworkToReviewCount:", err); return 0; }),
        this.getTimetable(teacherId).catch(err => { console.error("Error in getTimetable:", err); return []; }),
        this.getNotices(schoolId).catch(err => { console.error("Error in getNotices:", err); return []; }),
        this.getAttendanceMarkedStatus(teacher.id, today).catch(err => { console.error("Error in getAttendanceMarkedStatus:", err); return true; }),
        this.getRecentDoubts(teacher.classes.map(c => c.id)).catch(err => { console.error("Error in getRecentDoubts:", err); return []; }),
        this.getRecentSubmissions(teacher.classes.map(c => c.id)).catch(err => { console.error("Error in getRecentSubmissions:", err); return []; }),
      ]);

      // Use IST weekday so filtering is correct on Vercel (UTC server)
      const todayDayIndex = getISTCurrentDayOfWeek();
      const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][todayDayIndex];
      const todaySchedule = timetable ? timetable.filter((t: any) => t.day === todayDay) : [];

      return {
          personalInfo: personalInfo || {},
          classOverview: classOverview || [],
          stats: {
            todayClasses: todaySchedule.length,
            homeworkToReview: homeworkToReviewCount || 0,
            attendancePending: !attendanceStatus, // true if attendance NOT marked for at least one class today
            noticesCount: (notices || []).length,
          },
          todaySchedule,
          notices: (notices || []).slice(0, 5),
          recentDoubts,
          recentSubmissions,
      };
    } catch (err) {
      console.error("Critical error in getDashboardData:", err);
      throw err;
    }
  },


  async getHomeworkToReviewCount(teacherId: string) {
    // Count homework created by this teacher that has submissions but not yet graded (simple V1 logic)
    // Actually, simple V1: just count submissions in the last 7 days for teacher's classes
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { classes: true }
    });
    if (!teacher) return 0;
    const classIds = teacher.classes.map(c => c.id);
    
    return await prisma.homeworkSubmission.count({
      where: {
        homework: {
          classId: { in: classIds }
        }
      }
    });
  },

  async getNotices(schoolId: string) {
    return await prisma.notice.findMany({
      where: {
        schoolId,
        recipients: {
          some: {
            userType: "TEACHER"
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  },

  async getAttendanceMarkedStatus(teacherId: string, date: Date) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { classes: true }
    });
    if (!teacher || teacher.classes.length === 0) return true;

    // Check if at least one attendance record exists for today for each class assigned to the teacher
    // This is a simplified check for V1
    const attendanceRecords = await prisma.attendance.findFirst({
      where: {
        date: {
          gte: date,
          lte: getInstitutionalEndOfDay()
        },
        lesson: {
          teacherId: teacherId
        }
      }
    });
    return !!attendanceRecords;
  },

  getPersonalInfo(teacher: any) {
    return {
      name: teacher.user.name,
      email: teacher.user.email,
      phone: teacher.user.phone,
      profilePic: teacher.user.profilePic || null,
      dateOfJoin: teacher.dateofJoin, // Note: check capitalization in schema (dateofJoin vs dateOfJoin)
      subjects: teacher.subjects.map((s: any) => s.name),
      school: teacher.school.schoolName,
    };
  },

  async getClassOverview(classes: any[]) {
    if (!Array.isArray(classes) || classes.length === 0) {
      return [];
    }
    return Promise.all(
      classes.map(async (cls: any) => {
        if (!cls || !cls.id) return null;
        const studentCount = await prisma.student.count({ where: { classId: cls.id } });
        return { classId: cls.id, className: cls.name || "N/A", studentCount };
      })
    ).then(results => results.filter(r => r !== null));
  },

  async getAttendance(classes: any[]) {
    return Promise.all(
      classes.map(async (cls: any) => {
        const records = await prisma.attendance.findMany({
          where: { lesson: { classId: cls.id } },
          orderBy: { date: "desc" },
          take: 30,
        });
        const total = records.length;
        const present = records.filter((r) => r.present).length;
        const percentage = total ? (present / total) * 100 : 0;
        return { classId: cls.id, className: cls.name, percentage };
      })
    );
  },

  async getAssignments(classes: any[]) {
    const data = await Promise.all(
      classes.map(async (cls: any) => {
        const assignments = await prisma.assignment.findMany({
          where: { classId: cls.id },
          include: { subject: { select: { name: true } } },
          orderBy: { dueDate: "asc" },
          take: 5,
        });
        return assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject?.name ?? "N/A",
          dueDate: a.dueDate,
          classId: cls.id,
        }));
      })
    );
    return data.flat();
  },

  async getTimetable(teacherId: string) {
    const lessons = await prisma.lesson.findMany({
      where: { teacherId },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  
    return lessons.map((l) => ({
      day: l.day,
      startTime: l.startTime,
      endTime: l.endTime,
      subject: l.subject?.name ?? "N/A",
      class: l.class.name,
      room: "N/A",
    }));
  },

  async getRecentDoubts(classIds: string[]) {
    return await prisma.doubt.findMany({
      where: {
        classId: { in: classIds },
        status: "OPEN"
      },
      include: {
        user: {
          select: { name: true, profilePic: true }
        },
        subject: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
  },

  async getRecentSubmissions(classIds: string[]) {
    return await prisma.homeworkSubmission.findMany({
      where: {
        homework: {
          classId: { in: classIds }
        }
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, profilePic: true } }
          }
        },
        homework: {
          select: {
            title: true,
            subject: { select: { name: true } }
          }
        }
      },
      orderBy: { submittedAt: "desc" },
      take: 5
    });
  },

  async getEvents(schoolId: string, userRole: string) {
    const allEvents = await prisma.event.findMany({
      where: {
        schoolId,
        start: { gte: new Date() },
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { start: "asc" },
      take: 50, 
    });
  
    const filteredEvents = allEvents.filter((event) => {
      const isTargetAudienceMatch =
        event.targetAudience === "ALL" || event.targetAudience === "STAFFS";
  
      if (event.roles && event.roles.length > 0) {
        const roleNames = event.roles.map((r) => r.name.toUpperCase());
        const isRoleMatch = roleNames.includes(userRole.toUpperCase());
        return isTargetAudienceMatch || isRoleMatch;
      }
  
      return isTargetAudienceMatch;
    });
  
    return filteredEvents.slice(0, 10).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
    }));
  },

  async getStudentAnalytics(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true, profilePic: true } } }
    });

    if (!student) throw new Error("Student not found");

    // Attendance stats
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 30
    });

    const presentCount = attendance.filter(a => a.present).length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    // Exam results
    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        exam: {
          include: { subject: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return {
      student,
      attendanceRate: Math.round(attendanceRate),
      attendanceHistory: attendance.map(a => ({
        date: a.date,
        present: a.present
      })),
      examResults: results.map(r => ({
        subject: r.exam?.subject?.name || "Unknown",
        score: r.score,
        total: r.exam?.totalMarks || 100,
        date: r.createdAt
      }))
    };
  }
};
