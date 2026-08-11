import { NextApiRequest, NextApiResponse } from "next";
import { 
    markAttendanceService, 
    markMultipleAttendanceService, 
    getAttendanceReportData,
    getTeacherAttendanceStats,
    getTeacherStudentsLeaveRequests,
    getTeacherLeaveBalances
} from "@/lib/services/daily-activity-service";
import { attendanceSchema, markMultipleAttendanceSchema } from "@/lib/validations/daily-activity";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { type } = req.query; // 'attendance', 'leave-request'

    try {
        // --- ATTENDANCE ---
        if (type === 'attendance') {
            if (req.method === 'POST') {
                if (req.body.records) {
                    // Bulk
                    const parsed = markMultipleAttendanceSchema.parse(req.body);
                    const result = await markMultipleAttendanceService(parsed);
                    return res.status(201).json(result);
                } else {
                    // Single
                    const parsed = attendanceSchema.parse(req.body);
                    
                    // Ensure lessonId is provided
                    if (!parsed.lessonId) {
                        return res.status(400).json({ error: "lessonId is required" });
                    }
                    
                    const result = await markAttendanceService({
                        studentId: parsed.studentId,
                        lessonId: parsed.lessonId,
                        present: parsed.present,
                        date: parsed.date
                    });
                    return res.status(201).json(result);
                }
            }
            if (req.method === 'GET') {
                const { schoolId, fromDate, toDate, teacherId, stats } = req.query;
                
                // Teacher Stats
                if (stats === 'teacher' && teacherId && typeof teacherId === 'string') {
                    const result = await getTeacherAttendanceStats(teacherId);
                    return res.status(200).json(result);
                }

                // School Report
                if (schoolId && typeof schoolId === 'string') {
                    const result = await getAttendanceReportData(schoolId, fromDate as string, toDate as string);
                    return res.status(200).json({ data: result });
                }
            }
        }

        // --- LEAVE REQUESTS ---
        if (type === 'leave-request') {
             if (req.method === 'GET') {
                const { teacherId, scope } = req.query; // scope: 'students' (requests from students), 'balance' (teacher's own)
                
                if (!teacherId || typeof teacherId !== 'string') return res.status(400).json({error: "Teacher ID required"});

                if (scope === 'students') {
                    const result = await getTeacherStudentsLeaveRequests(teacherId);
                    return res.status(200).json(result);
                }
                
                if (scope === 'balance') {
                     const result = await getTeacherLeaveBalances(teacherId);
                     return res.status(200).json(result);
                }
             }
        }

        return res.status(404).json({ error: "Route not found" });

    } catch (error: any) {
        console.error(`Daily Activity API Error (${type}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
