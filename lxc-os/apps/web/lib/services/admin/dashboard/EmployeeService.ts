
import { prisma } from "@/lib/prisma";
import { EmployeeType, UserSex } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";

// Helper to generate employee code
async function generateEmployeeCode() {
  const count = await prisma.employee.count();
  return `EMP${(count + 1).toString().padStart(4, '0')}`;
}

export class EmployeeService {
    static async registerEmployee(data: any) {
        const tempPassword = randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        let isNewUser = false;
        
        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Enforce Subscription Limits & Write Access
            await SubscriptionService.validateUserLimit(data.schoolId);
            await SubscriptionService.checkWriteAccess(data.schoolId);

            let user;
             if (data.userId) {
                user = await tx.user.findUnique({ where: { id: data.userId } });
                if (!user) throw new Error("USER_NOT_EXIST");
            } else if (data.email) {
                user = await tx.user.findUnique({ where: { email: data.email } });
            }

            if (!user) {
                user = await tx.user.create({
                    data: {
                        name: data.name!,
                        email: data.email!,
                        phone: data.phone!,
                        address: data.address!,
                        city: data.city!,
                        state: data.state!,
                        country: data.country!,
                        pincode: data.pincode!,
                        bloodType: data.bloodType!,
                        sex: data.sex!,
                        password: hashedPassword,
                        profilePic: "", // Default or handled separately
                        role: "employee",
                        schoolId: data.schoolId
                    }
                });
                isNewUser = true;
            }

            const existingEmployee = await tx.employee.findUnique({ where: { userId: user.id } });
            if (existingEmployee) throw new Error("Employee already exists for this user");

            const employeeCode = await generateEmployeeCode();

            const employee = await tx.employee.create({
                data: {
                    employeeCode,
                    userId: user.id,
                    employeeType: data.employeeType ?? EmployeeType.BACKEND_ENGINEER,
                    company: data.company ?? "",
                    departmentId: data.departmentId || null,
                    designationId: data.designationId || null,
                    status: "ACTIVE"
                },
                include: { user: true, department: true, designation: true }
            });

            return { user, employee, tempPassword, isNewUser };
        }, { timeout: 20000 });

        return result;
    }

    static async getAllEmployees() {
        return prisma.employee.findMany({
            include: { user: true, department: true, designation: true },
            orderBy: { createdAt: "desc" }
        });
    }

    static async getEmployeesBySchool(schoolId: string) {
        return prisma.employee.findMany({
            where: { user: { schoolId } },
            include: { user: true }
        });
    }

    static async getEmployeeById(id: string) {
        return prisma.employee.findUnique({
            where: { id },
             include: { user: true, department: true, designation: true }
        });
    }

    static async updateEmployee(id: string, data: any) {
        const existingStaff = await prisma.employee.findUnique({ where: { id } });
        if (!existingStaff) throw new Error("Employee not found");

        await prisma.user.update({
            where: { id: existingStaff.userId },
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
                bloodType: data.bloodType,
                sex: data.sex,
            }
        });

        return prisma.employee.update({
            where: { id },
            data: {
                employeeType: data.employeeType,
                company: data.company
            }
        });
    }

    static async deleteEmployee(id: string) {
        const existingStaff = await prisma.employee.findUnique({ where: { id } });
        if (!existingStaff) throw new Error("Employee not found");
        
        // Cascading delete is not guaranteed in application code usually, 
        // but User deletion should be careful. 
        // Legacy code deleted both.
        await prisma.employee.delete({ where: { id } });
        await prisma.user.delete({ where: { id: existingStaff.userId } });
    }

    static async updateStatus(id: string, status: any) {
        return prisma.employee.update({
            where: { id },
            data: { status },
            include: { user: true, department: true, designation: true }
        });
    }

    // Generic Staff Registration
    static async registerStaff(data: any) {
        // Enforce Subscription Limits & Write Access
        await SubscriptionService.validateUserLimit(data.schoolId);
        await SubscriptionService.checkWriteAccess(data.schoolId);

        const tempPassword = randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
                bloodType: data.bloodType,
                sex: data.sex,
                password: hashedPassword,
                role: "staff",
                schoolId: data.schoolId,
                userName: data.userName || data.email
            }
        });

        return { user, tempPassword };
    }
}
