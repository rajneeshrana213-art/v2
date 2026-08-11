import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";
import { uploadFile } from "@/lib/config/upload";
import { INSTITUTION_TIMEZONE } from "@/lib/utils/date-utils";

/**
 * Normalise a passed-in date to IST start-of-day (00:00:00 IST → correct UTC).
 * Safe to use for any user-supplied date, not just "today".
 */
function toISTDayStart(date: Date): Date {
  const tz = INSTITUTION_TIMEZONE;
  // Get the date parts in IST
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  // Build an ISO string anchored to IST midnight
  return new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00+05:30`);
}

/**
 * Normalise a passed-in date to IST end-of-day (23:59:59.999 IST → correct UTC).
 */
function toISTDayEnd(date: Date): Date {
  const tz = INSTITUTION_TIMEZONE;
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  const end = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T23:59:59+05:30`);
  end.setMilliseconds(999);
  return end;
}


export class AdminAttendanceService {
  /**
   * Get student attendance for a specific class and date range
   */
  static async getClassAttendance(
    schoolId: string,
    classId: string,
    date: Date,
    startDate?: Date,
    endDate?: Date,
  ) {
    let rangeStart = toISTDayStart(new Date(date));
    let rangeEnd   = toISTDayEnd(new Date(date));

    if (startDate && endDate) {
      rangeStart = toISTDayStart(new Date(startDate));
      rangeEnd   = toISTDayEnd(new Date(endDate));
    }


    // Fetch students in the class
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        classId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        attendances: {
          where: {
            date: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          include: {
            lesson: {
              select: {
                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        academicRecords: {
          where: {
            classId: classId,
          },
          take: 1,
          select: {
            rollNumber: true,
          },
        },
      },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.user.name,
      rollNo: student.academicRecords[0]?.rollNumber || "",
      profilePic: student.user.profilePic,
      attendances: student.attendances.map((att) => ({
        id: att.id,
        present: att.present,
        status: att.status,
        subject: att.lesson.subject.name,
        timestamp: att.date,
      })),
    }));
  }

  /**
   * Get teacher attendance for a school and date range
   */
  static async getTeacherAttendance(
    schoolId: string,
    date: Date,
    startDate?: Date,
    endDate?: Date,
  ) {
    let rangeStart = toISTDayStart(new Date(date));
    let rangeEnd   = toISTDayEnd(new Date(date));

    if (startDate && endDate) {
      rangeStart = toISTDayStart(new Date(startDate));
      rangeEnd   = toISTDayEnd(new Date(endDate));
    }


    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
            email: true,
          },
        },
        TeacherAttendance: {
          where: {
            attendanceDate: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
        },
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      profilePic: teacher.user.profilePic,
      attendances: teacher.TeacherAttendance.map((att) => ({
        id: att.id,
        date: att.attendanceTime || att.attendanceDate,
        latitude: att.latitude,
        longitude: att.longitude,
        matched: att.matched,
        status: att.status,
        type: att.type,
      })),
    }));
  }

  /**
   * Get staff/employee attendance for a school and date range
   */
  static async getStaffAttendance(
    schoolId: string,
    date: Date,
    startDate?: Date,
    endDate?: Date,
  ) {
    let rangeStart = toISTDayStart(new Date(date));
    let rangeEnd   = toISTDayEnd(new Date(date));

    if (startDate && endDate) {
      rangeStart = toISTDayStart(new Date(startDate));
      rangeEnd   = toISTDayEnd(new Date(endDate));
    }


    const staff = await prisma.employee.findMany({
      where: {
        user: { schoolId },
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
            email: true,
          },
        },
        attendances: {
          where: {
            date: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
        },
      },
    });

    return staff.map((emp) => ({
      id: emp.id,
      name: emp.user.name,
      email: emp.user.email,
      profilePic: emp.user.profilePic,
      attendances: emp.attendances.map((att) => ({
        id: att.id,
        date: att.date,
        status: att.status,
        type: att.attendanceType,
      })),
    }));
  }

  /**
   * Get teacher face model status
   */
  static async getTeacherFaceStatus(schoolId: string) {
    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        TeacherFaceData: true,
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.user.name,
      profilePic: teacher.user.profilePic,
      hasFaceModel: !!teacher.TeacherFaceData,
      lastUpdated: teacher.TeacherFaceData?.createdAt || null,
      latitude: teacher.TeacherFaceData?.latitude ?? null,
      longitude: teacher.TeacherFaceData?.longitude ?? null,
    }));
  }

  /**
   * Update/Create teacher face model
   */
  static async updateFaceModel(
    teacherId: string,
    faceImage: string,
    embedding: any,
    latitude?: number,
    longitude?: number,
  ) {
    const base64Data = faceImage.includes(",")
      ? faceImage.split(",")[1]
      : faceImage;
    const imageBuffer = Buffer.from(base64Data, "base64");
    const { url: faceImageUrl } = await uploadFile(
      imageBuffer,
      "face-attendance",
      "image",
      `teacher_${teacherId}_${Date.now()}.jpg`,
    );

    // Convert embedding to Buffer
    let faceEmbedding;
    if (typeof embedding === "string") {
      faceEmbedding = Buffer.from(embedding, "base64") as any;
    } else {
      faceEmbedding = Buffer.from(new Float32Array(embedding).buffer) as any;
    }

    return prisma.teacherFaceData.upsert({
      where: { teacherId },
      create: {
        teacherId,
        faceImageUrl,
        faceEmbedding,
        ...(latitude != null && longitude != null
          ? { latitude, longitude }
          : {}),
      },
      update: {
        faceImageUrl,
        faceEmbedding,
        ...(latitude != null && longitude != null
          ? { latitude, longitude }
          : {}),
        createdAt: new Date(),
      },
    });
  }

  static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static async deleteFaceModel(teacherId: string) {
    return prisma.teacherFaceData.delete({
      where: { teacherId },
    });
  }

  /**
   * Get detailed attendance for a specific student for a month
   */
  static async getStudentDetailedAttendance(
    schoolId: string,
    studentId: string,
    month: number,
    year: number
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId,
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        class: {
          include: {
            Section: {
              take: 1
            },
          }
        },
        academicRecords: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            rollNumber: true,
          },
        },
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            lesson: {
              select: {
                id: true,
                subject: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
    });

    if (!student) {
      throw new Error("Student not found or access denied");
    }

    return {
      id: student.id,
      name: student.user.name,
      rollNo: student.academicRecords[0]?.rollNumber || "N/A",
      profilePic: student.user.profilePic,
      className: student.class?.name,
      sectionName: student.class?.Section[0]?.name,
      attendances: student.attendances.map((att) => ({
        id: att.id,
        date: att.date,
        present: att.present,
        status: att.status,
        subject: att.lesson?.subject?.name || "Unknown",
      })),
    };
  }

  /**
   * Get detailed attendance for a specific teacher for a month
   */
  static async getTeacherDetailedAttendance(
    schoolId: string,
    teacherId: string,
    month: number,
    year: number
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId: schoolId,
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        subjects: {
          select: {
            name: true,
          }
        },
        TeacherAttendance: {
          where: {
            attendanceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            attendanceDate: 'asc'
          }
        }
      },
    });

    if (!teacher) {
      throw new Error("Teacher not found or access denied");
    }

    return {
      id: teacher.id,
      name: teacher.user.name,
      profilePic: teacher.user.profilePic,
      subjects: teacher.subjects.map(s => s.name).join(", ") || "N/A",
      attendances: teacher.TeacherAttendance.map((att) => ({
        id: att.id,
        date: att.attendanceDate,
        present: att.status === 'PRESENT',
        status: att.status,
        subject: att.type, 
      })),
    };
  }

  /**
   * Get detailed attendance for a specific staff member for a month
   */
  static async getStaffDetailedAttendance(
    schoolId: string,
    employeeId: string,
    month: number,
    year: number
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        user: {
          schoolId: schoolId
        }
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        department: {
          select: { name: true }
        },
        designation: {
          select: { name: true }
        },
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
    });

    if (!employee) {
      throw new Error("Staff member not found or access denied");
    }

    return {
      id: employee.id,
      name: employee.user.name,
      profilePic: employee.user.profilePic,
      employeeCode: employee.employeeCode,
      department: employee.department?.name || "N/A",
      designation: employee.designation?.name || "N/A",
      attendances: employee.attendances.map((att) => ({
        id: att.id,
        date: att.date,
        present: att.status === 'PRESENT',
        status: att.status,
        subject: att.attendanceType, 
      })),
    };
  }
}
