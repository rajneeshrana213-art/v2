
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class SchoolManagementService {
    static async registerSchool(data: any) {
        // Create user (School Owner)
        const password = data.password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        return prisma.$transaction(async (tx) => {
             const user = await tx.user.create({
                 data: {
                     name: data.name,
                     email: data.email,
                     phone: data.phone,
                     address: data.address,
                     pincode: data.pincode,
                     city: data.city,
                     state: data.state,
                     country: data.country,
                     bloodType: data.bloodType,
                     sex: data.sex,
                     password: hashedPassword,
                     role: "admin", // Assuming 'role' enum has 'school' or similar logic
                     // If schoolId is not needed for owner initially, skip.
                 }
             });

             const school = await tx.school.create({
                 data: {
                     schoolName: data.schoolName,
                     userId: user.id,
                     // Add other fields as per schema
                     latitude: data.latitude,
                     longitude: data.longitude
                 }
             });

             // Link back (if needed)
             await tx.user.update({
                 where: { id: user.id },
                 data: { schoolId: school.id }
             });

             return school;
        });
    }

    static async getSchools() {
        return prisma.school.findMany({
            include: { user: { select: { name: true, email: true, phone: true } } }
        });
    }

    static async getSchoolById(id: string) {
        return prisma.school.findUnique({
             where: { id },
             include: { user: true }
        });
    }

    // --- PLANS ---
    static async createPlan(data: any) {
        return prisma.plan.create({ data });
    }

    static async getPlans() {
        return prisma.plan.findMany();
    }
}
