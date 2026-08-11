import { prisma } from "@/lib/prisma";

export const getSchoolInfoByUserId = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { schoolId: true }
    });

    if (!user || !user.schoolId) {
        throw new Error("School not found for this user");
    }

    const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: {
            id: true,
            schoolName: true,
            schoolLogo: true,
            schoolCode: true,
        }
    });

    if (!school) {
        throw new Error("School details not found");
    }

    return {
        schoolId: school.id,
        schoolName: school.schoolName,
        schoolLogo: school.schoolLogo,
        schoolCode: school.schoolCode,
    };
}

export const updateSchoolInfo = async (schoolId: string, data: { schoolName?: string; schoolLogo?: string }) => {
    return await prisma.school.update({
        where: { id: schoolId },
        data
    });
};

export const getPaymentConfig = async (schoolId: string) => {
    const config = await prisma.paymentSecret.findUnique({
        where: { schoolId }
    });
    
    if (!config) return null;

    return {
        keyId: config.keyId,
        // Censor the secret for security when sending to frontend
        keySecret: config.keySecret ? "****" + config.keySecret.slice(-4) : null 
    };
};

export const updatePaymentConfig = async (schoolId: string, data: { keyId: string; keySecret: string }) => {
    return await prisma.paymentSecret.upsert({
        where: { schoolId },
        update: data,
        create: {
            schoolId,
            ...data
        }
    });
};

export const getAcademicYearsBySchoolId = async (schoolId: string) => {
    return await prisma.academicYear.findMany({
        where: { schoolId },
        orderBy: { startDate: 'desc' }
    });
};

export const createAcademicYear = async (schoolId: string, data: { year: string; startDate: Date; endDate: Date; isActive?: boolean }) => {
    if (data.isActive) {
        // Deactivate other years if this one is active
        await prisma.academicYear.updateMany({
            where: { schoolId, isActive: true },
            data: { isActive: false }
        });
    }

    return await prisma.academicYear.create({
        data: {
            schoolId,
            ...data
        }
    });
};

export const updateAcademicYear = async (id: string, schoolId: string, data: { year?: string; startDate?: Date; endDate?: Date; isActive?: boolean }) => {
    if (data.isActive) {
        await prisma.academicYear.updateMany({
            where: { schoolId, isActive: true, NOT: { id } },
            data: { isActive: false }
        });
    }

    return await prisma.academicYear.update({
        where: { id },
        data
    });
};
