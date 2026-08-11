import { prisma } from "../../prisma";
import { PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export const GroupAdminService = {
  async getDashboardData(schoolGroupId: string) {
    const branches = await prisma.school.findMany({
      where: { groupId: schoolGroupId },
      select: { id: true, schoolName: true },
    });

    const branchIds = branches.map((b) => b.id);

    const [totalStudents, totalTeachers, totalRevenue, branchPerformance, subscription, group] =
      await Promise.all([
        prisma.student.count({ where: { schoolId: { in: branchIds }, status: "ACTIVE" } }),
        prisma.teacher.count({ where: { schoolId: { in: branchIds } } }),
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            OR: [
              { school: { groupId: schoolGroupId } },
              { subscription: { some: { schoolGroupId: schoolGroupId } } }
            ]
          },
          _sum: { amount: true },
        }),
        this.getBranchPerformance(branchIds),
        prisma.subscription.findFirst({
          where: { schoolGroupId: schoolGroupId, status: "ACTIVE" },
          include: { plan: true }
        }),
        prisma.schoolGroup.findUnique({
          where: { id: schoolGroupId },
          select: { branchLimit: true }
        })
      ]);

    return {
      summary: {
        totalBranches: branches.length,
        totalStudents,
        totalTeachers,
        totalRevenue: totalRevenue._sum?.amount || 0,
        planName: subscription?.plan?.name || null,
        branchLimit: group?.branchLimit || 10
      },
      branchPerformance,
    };
  },

  async getBranchPerformance(branchIds: string[]) {
    const performance = await Promise.all(
      branchIds.map(async (id) => {
        const school = await prisma.school.findUnique({
          where: { id },
          select: { schoolName: true },
        });

        const studentCount = await prisma.student.count({
          where: { schoolId: id, status: "ACTIVE" },
        });

        // Simplified attendance for group view
        const attendance = await prisma.attendance.findMany({
          where: { student: { schoolId: id } },
          take: 100, // sample
          select: { present: true },
        });
        const attendanceRate =
          attendance.length > 0
            ? Math.round(
                (attendance.filter((a) => a.present).length /
                  attendance.length) *
                  100,
              )
            : 0;

        const revenue = await prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            OR: [
              { schoolId: id },
              { student: { schoolId: id } }
            ]
          },
          _sum: { amount: true },
        });

        return {
          branchId: id,
          branchName: school?.schoolName || "Unknown",
          students: studentCount,
          attendance: attendanceRate,
          revenue: revenue._sum?.amount || 0,
        };
      }),
    );

    return performance;
  },

  async getBranches(schoolGroupId: string) {
    return prisma.school.findMany({
      where: { groupId: schoolGroupId },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getBranchById(branchId: string, schoolGroupId: string) {
    const branch = await prisma.school.findFirst({
      where: { id: branchId, groupId: schoolGroupId },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            Notice: true,
            buses: true,
            hostels: true,
          },
        },
        user: {
          select: { name: true, email: true, profilePic: true },
        },
      },
    });

    if (!branch) return null;

    const [recentStudents, recentTeachers, attendanceSample, revenueData] =
      await Promise.all([
        prisma.student.findMany({
          where: { schoolId: branchId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            user: { select: { name: true, profilePic: true } },
            admissionNo: true,
          },
        }),
        prisma.teacher.findMany({
          where: { schoolId: branchId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            user: { select: { name: true, profilePic: true } },
            teacherSchoolId: true,
          },
        }),
        prisma.attendance.findMany({
          where: { student: { schoolId: branchId } },
          take: 200,
          select: { present: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            student: { schoolId: branchId },
          },
          _sum: { amount: true },
        }),
      ]);

    const attendanceRate =
      attendanceSample.length > 0
        ? Math.round(
            (attendanceSample.filter((a) => a.present).length /
              attendanceSample.length) *
              100,
          )
        : 0;

    return {
      ...branch,
      stats: {
        students: branch._count.students,
        teachers: branch._count.teachers,
        notices: branch._count.Notice,
        buses: branch._count.buses,
        hostels: branch._count.hostels,
        attendanceRate,
        totalRevenue: revenueData._sum?.amount || 0,
      },
      recentStudents: recentStudents.map((s) => ({
        id: s.id,
        name: s.user.name,
        profilePic: s.user.profilePic,
        admissionNo: s.admissionNo,
      })),
      recentTeachers: recentTeachers.map((t) => ({
        id: t.id,
        name: t.user.name,
        profilePic: t.user.profilePic,
        teacherCode: t.teacherSchoolId,
      })),
    };
  },

  async createBranch(
    schoolGroupId: string,
    data: {
      schoolName: string;
      schoolCode?: string;
      userId: string;
      schoolOpening?: string;
      schoolClosing?: string;
    },
  ) {
    return prisma.school.create({
      data: {
        ...data,
        groupId: schoolGroupId,
      },
    });
  },

  async updateBranch(branchId: string, schoolGroupId: string, data: any) {
    // Ensure the branch belongs to the group
    const branch = await prisma.school.findFirst({
      where: { id: branchId, groupId: schoolGroupId },
    });

    if (!branch) {
      throw new Error("Branch not found or unauthorized");
    }

    return prisma.school.update({
      where: { id: branchId },
      data,
    });
  },

  async toggleBranchStatus(
    branchId: string,
    schoolGroupId: string,
    isActive: boolean,
  ) {
    const branch = await prisma.school.findFirst({
      where: { id: branchId, groupId: schoolGroupId },
    });

    if (!branch) {
      throw new Error("Branch not found or unauthorized");
    }

    return prisma.school.update({
      where: { id: branchId },
      data: { isActive },
    });
  },

  async getGroupDetails(schoolGroupId: string) {
    return prisma.schoolGroup.findUnique({
      where: { id: schoolGroupId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async updateGroupDetails(
    schoolGroupId: string,
    data: { name?: string; logo?: string },
  ) {
    return prisma.schoolGroup.update({
      where: { id: schoolGroupId },
      data,
    });
  },

  async getDetailedAnalytics(schoolGroupId: string) {
    const branches = await prisma.school.findMany({
      where: { groupId: schoolGroupId },
      select: { id: true, schoolName: true },
    });

    const branchIds = branches.map((b) => b.id);

    // Get revenue trends (last 6 months)
    const revenueTrends = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return prisma.payment
          .aggregate({
            where: {
              status: PaymentStatus.COMPLETED,
              paymentDate: { gte: start, lte: end },
              OR: [
                { school: { groupId: schoolGroupId } },
                { subscription: { some: { schoolGroupId: schoolGroupId } } }
              ]
            },
            _sum: { amount: true },
          })
          .then((res) => ({
            month: start.toLocaleString("default", { month: "short" }),
            revenue: res._sum?.amount || 0,
          }));
      }),
    );

    return {
      revenueTrends: revenueTrends.reverse(),
      branchDistribution: await this.getBranchPerformance(branchIds),
    };
  },

  async registerOrganization(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    organizationName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    bloodType?: string;
    sex?: any; // Use UserSex from @prisma/client if needed
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return prisma.$transaction(async (tx) => {
      // 1. Create the User (Group Admin)
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          bloodType: data.bloodType || "O+", // Default if not provided
          sex: data.sex || "MALE", // Default if not provided
          role: "group_admin",
        },
      });

      // 2. Create the SchoolGroup
      const group = await tx.schoolGroup.create({
        data: {
          name: data.organizationName,
          ownerId: user.id,
        },
      });

      // 3. Update User with Group ID (optional but good for relations)
      await tx.user.update({
        where: { id: user.id },
        data: { schoolGroupId: group.id },
      });

      return { user, group };
    });
  },
};
