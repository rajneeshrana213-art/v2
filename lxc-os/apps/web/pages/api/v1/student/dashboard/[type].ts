import { NextApiRequest, NextApiResponse } from "next";
import { 
    getLessonsForStudent, 
    getStudentExams, 
    getStudentResultsAnalysis, 
    getStudentAttendanceAndLeaves,
    getStudentAcademicResources,
    getStudentDashboardResources,
    getStudentReportCard,
    getStudentQuizzesAndNewspapers
} from "@/lib/services/student-dashboard-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, studentId } = req.query;

    if (!studentId || typeof studentId !== 'string') {
        return res.status(400).json({ error: "Student ID is required" });
    }

    try {
        if (type === 'lessons') {
            const result = await getLessonsForStudent(studentId);
            return res.status(200).json({ success: true, lessons: result });
        }

        if (type === 'exams') {
            const result = await getStudentExams(studentId);
            return res.status(200).json({ success: true, exams: result });
        }

        if (type === 'results') {
            const result = await getStudentResultsAnalysis(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'attendance') {
            const result = await getStudentAttendanceAndLeaves(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'resources') {
            const result = await getStudentAcademicResources(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'dashboard-resources') {
            const result = await getStudentDashboardResources(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'report-card') {
            const result = await getStudentReportCard(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'quiz-newspaper') {
            const result = await getStudentQuizzesAndNewspapers(studentId);
            return res.status(200).json({ success: true, ...result });
        }

        if (type === 'fees') {
            // Deprecated fee model
            return res.status(200).json({ 
                success: true, 
                message: "Fee model removed - use finance system endpoints instead", 
                fees: [], 
                totalPending: 0, 
                totalPaid: 0, 
                paymentHistory: [] 
            });
        }

        return res.status(404).json({ error: "Resource not found" });

    } catch (error: any) {
        console.error(`Student Dashboard API Error (${type}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
