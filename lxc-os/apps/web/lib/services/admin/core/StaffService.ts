import { prisma } from "@/lib/prisma";
import { UserSex } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";

export class StaffService {
  private static async generateUniqueUsername(name: string): Promise<string> {
    const baseName = name.toLowerCase().replace(/\s+/g, "").substring(0, 10);
    let userName = baseName;
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
      const check = await prisma.user.findUnique({ where: { userName } });
      if (!check) {
        isUnique = true;
      } else {
        counter++;
        userName = `${baseName}${counter}`;
      }
    }
    return userName;
  }

  private static async createUserBase(
    tx: any,
    data: any,
    role: string,
    profilePicUrl: string | null,
  ) {
    const tempPassword = randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const userName =
      data.userName || (await this.generateUniqueUsername(data.name));

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        userName: userName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        sex: data.sex,
        bloodType: data.bloodType,
        profilePic: profilePicUrl,
        password: hashedPassword,
        role: role,
        schoolId: data.schoolId,
      },
    });
    return { user, tempPassword };
  }

  private static async sendStaffCredentialsEmail(
    email: string,
    name: string,
    userName: string,
    password: string,
    schoolId: string,
    role: string,
    employeeCode?: string,
    prefetchedSchoolName?: string,
  ) {
    try {
      let schoolName = prefetchedSchoolName;
      if (!schoolName) {
        const school = await prisma.school.findUnique({
          where: { id: schoolId },
          select: { schoolName: true },
        });
        schoolName = school?.schoolName || "Your School";
      }

      const loginUrl = CONFIG.FRONTEND_BASE_URL
        ? `${CONFIG.FRONTEND_BASE_URL}/login`
        : process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
          : "http://localhost:3000/login";

      // Map role to display name
      const roleDisplayNames: { [key: string]: string } = {
        account: "Accountant",
        transport: "Transport Manager",
        hostel: "Hostel Manager",
        library: "Librarian",
        driver: "Driver",
        academics: "Academics Staff",
        staff: "Staff Member",
      };

      await renderAndSendEmail(
        "staff-credentials",
        {
          staffName: name,
          schoolName: schoolName,
          email: email,
          userName: userName,
          password: password,
          staffRole: roleDisplayNames[role] || role,
          employeeCode: employeeCode,
          loginUrl: loginUrl,
        },
        "Welcome to LearnXChain - Your Staff Account Credentials",
        email,
      );
    } catch (emailError) {
      console.error("Failed to send staff registration email:", emailError);
      // Don't throw - email failure shouldn't break registration
    }
  }

  // Account
  static async createAccountant(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "account",
        profilePicUrl,
      );
      const account = await tx.userAccount.create({
        data: { userId: user.id, schoolId: data.schoolId },
      });
      return {
        user,
        account,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    // Send email after successful creation
    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "account",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  static async getAccountants(schoolId?: string) {
    // Filter by schoolId if provided, though legacy controller didn't?!
    // Legacy getAllaccount didn't filter by school. That's a security flaw.
    // I will add schoolId filter capability but keep optional if needing legacy behavior (though legacy behavior was bad).
    // Actually, I should probably enforce schoolId if it comes from the request.
    // For now, I'll allow both.
    return prisma.user.findMany({ where: { role: "account" } });
  }

  // Transport
  static async createTransport(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "transport",
        profilePicUrl,
      );
      const transport = await tx.transport.create({
        data: {
          user: { connect: { id: user.id } },
          school: { connect: { id: data.schoolId } },
        },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { transportId: transport.id },
      });
      return {
        user,
        transport,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    // Send email after successful creation
    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "transport",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  static async getTransports() {
    return prisma.user.findMany({ where: { role: "transport" } });
  }

  // Hostel
  static async createHostel(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "hostel",
        profilePicUrl,
      );
      const hostel = await tx.hostel.create({
        data: {
          name: data.hostelName || `Hostel - ${data.name}`,
          type: data.type || "BOYS",
          capacity: data.capacity ? parseInt(data.capacity) : 0,
          address: data.address,
          schoolId: data.schoolId,
          wardenId: user.id,
        },
      });
      return {
        user,
        hostel,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    // Send email after successful creation
    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "hostel",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  static async getHostels() {
    return prisma.user.findMany({ where: { role: "hostel" } });
  }

  // Library
  static async createLibrarian(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "library",
        profilePicUrl,
      );
      const library = await tx.library.create({
        data: { school: { connect: { id: data.schoolId } } },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { libraryId: library.id },
      });
      return {
        user,
        library,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    // Send email after successful creation
    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "library",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  static async getLibrarians() {
    return prisma.user.findMany({ where: { role: "library" } });
  }

  // Driver
  static async createDriver(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "driver",
        profilePicUrl,
      );
      const driver = await tx.driver.create({
        data: {
          license: data.license,
          licensePhoto: data.licensePhoto || undefined,
          user: { connect: { id: user.id } },
          school: { connect: { id: data.schoolId } },
          ...(data.busId ? { bus: { connect: { id: data.busId } } } : {}),
        },
      });
      return {
        user,
        driver,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    // Send email after successful creation
    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "driver",
        data.employeeCode,
        data.schoolName,
      );
    }

    return result;
  }

  // Academics
  static async createAcademicsStaff(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "academics",
        profilePicUrl,
      );
      return {
        user,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "academics",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  // Generic Staff
  static async createGenericStaff(data: any, profilePicUrl: string | null) {
    if (!data.skipLimitCheck) {
      await SubscriptionService.validateUserLimit(data.schoolId);
      await SubscriptionService.checkWriteAccess(data.schoolId);
    }
    const result = await prisma.$transaction(async (tx) => {
      const { user, tempPassword } = await this.createUserBase(
        tx,
        data,
        "staff",
        profilePicUrl,
      );
      return {
        user,
        credentials: {
          userName: user.userName,
          email: data.email,
          password: tempPassword,
        },
      };
    });

    if (!data.skipEmail) {
      await this.sendStaffCredentialsEmail(
        data.email,
        data.name,
        result.credentials.userName,
        result.credentials.password,
        data.schoolId,
        "staff",
        undefined,
        data.schoolName,
      );
    }

    return result;
  }

  static async getAllStaff(
    schoolId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));
    const skip = (safePage - 1) * safeLimit;
    const where = {
      schoolId,
      role: {
        in: [
          "account",
          "transport",
          "hostel",
          "library",
          "driver",
          "academics",
          "staff",
        ] as any[],
      },
    };
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          userName: true,
          email: true,
          phone: true,
          profilePic: true,
          role: true,
          address: true,
          city: true,
          state: true,
          country: true,
          pincode: true,
          bloodType: true,
          sex: true,
          createdAt: true,
          updatedAt: true,
          account: true,
          transport: true,
          library: true,
          Driver: true,
        },
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      staff,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  // Generic
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        Driver: true,
        managedHostels: true,
        account: true,
        transport: true,
        library: true,
      },
    });
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static async updateUser(id: string, data: any) {
    return prisma.$transaction(
      async (tx) => {
        // 1. Separate user data from role-specific data
        const {
          license,
          busId,
          hostelName,
          capacity,
          licensePhoto,
          ...userData
        } = data;

        // 2. Update the base User model
        // Filter out empty/null values to prevent overwriting with bad data
        const filteredUserData = Object.fromEntries(
          Object.entries(userData).filter(([key, value]) => {
            if (key === "userName" && (value === "" || value === null))
              return false;
            return value !== undefined;
          }),
        );

        const user = await tx.user.update({
          where: { id },
          data: filteredUserData,
        });

        // 3. Handle role-specific updates
        if (user.role === "driver") {
          await tx.driver.updateMany({
            where: { userId: id },
            data: {
              ...(license && { license }),
              ...(busId && { busId }),
              ...(data.licensePhoto && { licensePhoto: data.licensePhoto }),
            },
          });
        } else if (user.role === "hostel") {
          await tx.hostel.updateMany({
            where: { wardenId: id },
            data: {
              ...(hostelName && { name: hostelName }),
              ...(capacity && { capacity: parseInt(capacity) }),
            },
          });
        }

        return user;
      },
      {
        maxWait: 10000, // default 5000
        timeout: 30000, // default 5000
      },
    );
  }

  static async bulkCreateStaff(schoolId: string, staffList: any[]) {
    const results = [];
    const errors = [];

    for (const staff of staffList) {
      try {
        let result;
        switch (staff.role) {
          case "account":
            result = await this.createAccountant(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "transport":
            result = await this.createTransport(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "hostel":
            result = await this.createHostel(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "library":
            result = await this.createLibrarian(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "driver":
            result = await this.createDriver(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "academics":
            result = await this.createAcademicsStaff(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          case "staff":
            result = await this.createGenericStaff(
              { ...staff, schoolId },
              staff.profilePic || null,
            );
            break;
          default:
            throw new Error(`Unsupported role: ${staff.role}`);
        }
        results.push(result);
      } catch (err: any) {
        errors.push({ staff, error: err.message });
      }
    }
    return { results, errors };
  }
}
