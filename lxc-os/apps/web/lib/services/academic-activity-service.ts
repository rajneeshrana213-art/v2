import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/config/upload";
import { AssignmentStatus, HomeworkStatus } from "@prisma/client";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

// --- Helper Types ---
interface FileUpload {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

// --- Assignment Services ---

export const createAssignmentService = async (data:any, file?: FileUpload) => {
    let url: string | undefined;
    if (file) {
        const upload = await uploadFile(file.buffer, "School_Assignments", "raw", file.originalname);
        url = upload.url;
    }

    const assignment = await prisma.assignment.create({
        data: {
            title: data.title,
            description: data.description,
            attachment: url || "",
            status: data.status as AssignmentStatus,
            startDate: data.startDate,
            dueDate: data.dueDate,
            lessonId: data.lessonId,
            classId: data.classId,
            sectionId: data.sectionId,
            subjectId: data.subjectId,
        }
    });

    // 🔔 Notify students in the class (fire-and-forget)
    if (assignment.classId) {
        const dueDateStr = assignment.dueDate
            ? new Date(assignment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "TBD";
        const schoolQuery = await (prisma as any).class.findUnique({ where: { id: assignment.classId }, select: { schoolId: true } }).catch(() => null);
        if (schoolQuery?.schoolId) {
            fcmTriggers.notifyAssignmentAssigned(assignment.classId, assignment.title, dueDateStr, schoolQuery.schoolId);
        }
    }

    return assignment;
};

export const getAssignmentsByClass = async (classId: string) => {
    return await prisma.assignment.findMany({
        where: { classId },
        include: { lesson: true, subject: true }
    });
};

// --- Homework Services ---

export const createHomeworkService = async (data: any, file?: FileUpload) => {
    let url: string | undefined;
    if (file) {
        const type = file.mimetype.startsWith("image/") ? "image" : "raw";
        const upload = await uploadFile(file.buffer, "homework_attachments", type, file.originalname);
        url = upload.url;
    }

    const homework = await prisma.homeWork.create({
        data: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            classId: data.classId,
            subjectId: data.subjectId,
            attachment: url,
            status: "PENDING"
        }
    });

    // 🔔 Notify students in the class about new homework (fire-and-forget)
    if (homework.classId) {
        const dueDateStr = homework.dueDate
            ? new Date(homework.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "TBD";
        const subject = await (prisma as any).subject.findUnique({ where: { id: homework.subjectId }, select: { name: true } }).catch(() => null);
        fcmTriggers.notifyHomeworkAssigned(
            homework.classId,
            subject?.name ?? "a subject",
            dueDateStr,
            (await (prisma as any).homeWork.findUnique({ where: { id: homework.id }, select: { class: { select: { schoolId: true } } } }))?.class?.schoolId ?? ""
        );
    }
    return homework;
};

export const submitHomeworkService = async (studentId: string, homeworkId: string, file?: FileUpload) => {
    if (!file) throw new Error("File required for submission");

    const type = file.mimetype.startsWith("image/") ? "image" : "raw";
    const upload = await uploadFile(file.buffer, "homework_submissions", type, file.originalname);
    
    return await prisma.homeworkSubmission.create({
        data: {
            studentId,
            homeworkId,
            file: upload.url
        }
    });
};

export const getHomeworkByClass = async (classId: string) => {
    return await prisma.homeWork.findMany({
        where: { classId },
        include: { subject: true },
        orderBy: { createdAt: 'desc' }
    });
};

// --- Exam Services ---

export const createExamService = async (data: any) => {
    // Basic formatting for Title if ExamType provided
    const examLabel = data.title || data.examType || "CUSTOM";
    const formattedTitle = data.title && data.title.startsWith("[") ? data.title : `[${data.examType || 'CUSTOM'}]${examLabel}`;

    const existing = await prisma.exam.findFirst({
        where: {
            title: formattedTitle,
            classId: data.classId,
            subjectId: data.subjectId
        }
    });

    if (existing) throw new Error("Exam already exists for this subject/class");

    const { examType, ...examData } = data; // strip auxiliary field

    const exam = await prisma.exam.create({
        data: {
            ...examData,
            title: formattedTitle
        }
    });

    // 🔔 Notify students about the new exam (fire-and-forget)
    if (exam.classId) {
        const startDateStr = exam.startTime
            ? new Date(exam.startTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "TBD";
        const classData = await (prisma as any).class.findUnique({ where: { id: exam.classId }, select: { schoolId: true } }).catch(() => null);
        fcmTriggers.notifyExamScheduled(
            exam.classId,
            exam.title,
            startDateStr,
            classData?.schoolId ?? ""
        );
    }
    return exam;
};

export const getExamsByClass = async (classId: string) => {
    const exams = await prisma.exam.findMany({
        where: { classId },
        include: { subject: true },
        orderBy: { startTime: 'asc' }
    });

    // Return simple list for now, grouping logic can be added on frontend or separate service method if complex
    return exams.map(e => ({
        ...e,
        examType: e.title.match(/^\[([^\]]+)\]/)?.[1] || "CUSTOM",
        examName: e.title.replace(/^\[([^\]]+)\]\s*/, "")
    }));
};
