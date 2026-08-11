import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { 
    createAssignmentService, 
    createHomeworkService, 
    createExamService,
    getAssignmentsByClass,
    getHomeworkByClass,
    getExamsByClass,
    submitHomeworkService
} from "@/lib/services/academic-activity-service";
import { createAssignmentSchema, createHomeworkSchema, createExamSchema } from "@/lib/validations/academic-activity";
import { verifyAuth } from "@/lib/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest & { file: any },
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { type } = req.query; // 'assignment', 'homework', 'exam'

    try {
        await runMiddleware(req, res, upload.single("attachment")); // Field name 'attachment' or 'file'

        if (req.method === 'POST') {
            // --- ASSIGNMENT ---
            if (type === 'assignment') {
                const parsed = createAssignmentSchema.parse(req.body);
                const result = await createAssignmentService(parsed, req.file);
                return res.status(201).json(result);
            }

            // --- HOMEWORK ---
            if (type === 'homework') {
                const parsed = createHomeworkSchema.parse(req.body);
                const result = await createHomeworkService(parsed, req.file);
                return res.status(201).json(result);
            }

             // --- HOMEWORK SUBMISSION ---
             if (type === 'homework-submission') {
                const { studentId, homeworkId } = req.body;
                if (!studentId || !homeworkId) return res.status(400).json({error: "Missing IDs"});
                const result = await submitHomeworkService(studentId, homeworkId, req.file);
                return res.status(201).json(result);
            }

            // --- EXAM ---
            if (type === 'exam') {
                const parsed = createExamSchema.parse(req.body);
                const result = await createExamService(parsed); // No file for exam creation
                return res.status(201).json(result);
            }
        }

        if (req.method === 'GET') {
            const { classId } = req.query;
            if (!classId || typeof classId !== 'string') {
                return res.status(400).json({ error: "Class ID required" });
            }

            if (type === 'assignment') {
                const result = await getAssignmentsByClass(classId);
                return res.status(200).json(result);
            }
            if (type === 'homework') {
                 const result = await getHomeworkByClass(classId);
                 return res.status(200).json(result);
            }
            if (type === 'exam') {
                const result = await getExamsByClass(classId);
                return res.status(200).json(result);
            }
        }

        return res.status(404).json({ error: "Activity route not found or method not supported" });

    } catch (error: any) {
        console.error(`Academic Activity API Error (${type}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
