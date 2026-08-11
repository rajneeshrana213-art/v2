import { prisma } from "@/lib/prisma";
import { generateStudentIdCard, generateBulkIdCards } from "@/lib/utils/id-card-generator";
import { TEMPLATE_CONFIGS, TemplateId } from "@/lib/utils/id-card-templates";

export const getTemplates = () => {
    return Object.values(TEMPLATE_CONFIGS).map(config => ({
        id: config.id,
        name: config.name,
        description: config.description,
        dimensions: config.dimensions,
        orientation: config.orientation
    }));
};

export const getSchoolBranding = async (schoolId: string) => {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { user: true }
    });

    if (!school) throw new Error("School not found");

    return {
        schoolName: school.schoolName,
        schoolLogo: school.schoolLogo,
        address: school.user.address,
        phone: school.user.phone,
        email: school.user.email
    };
};

export const generateStudentIdCardService = async (studentId: string, templateId: TemplateId = 'classic_horizontal') => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: true,
            class: true,
            school: { include: { user: true } }
        }
    });

    if (!student) throw new Error("Student not found");

    return await generateStudentIdCard(student, templateId);
};

export const generateBulkIdCardsService = async (studentIds: string[], templateId: TemplateId = 'classic_horizontal', classId?: string) => {
    const whereClause: any = {
        id: { in: studentIds }
    };

    if (classId) {
        whereClause.classId = classId;
    }

    const students = await prisma.student.findMany({
        where: whereClause,
        include: {
            user: true,
            class: true,
            school: { include: { user: true } }
        }
    });

    if (students.length === 0) {
        throw new Error('No students found');
    }

    if (students.length !== studentIds.length) {
        throw new Error(`Only ${students.length} of ${studentIds.length} students found`);
    }

    return await generateBulkIdCards(students, templateId);
};

