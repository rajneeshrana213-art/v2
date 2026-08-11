import { NextApiRequest, NextApiResponse } from "next";
import { 
    createClassService, 
    getClassesBySchoolId, 
    createSectionService, 
    getSectionsByClassId,
    createSubjectService,
    getAllSubjectsOfSchool,
    getSubjectsByClassId
} from "@/lib/services/academic-service";
import { createClassSchema, createSectionSchema, createSubjectSchema } from "@/lib/validations/academic";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { entity, action } = req.query;

    try {
        // --- CLASSES ---
        if (entity === 'class') {
            if (req.method === 'POST') {
                const parsed = createClassSchema.parse(req.body);
                const result = await createClassService(parsed);
                return res.status(201).json(result);
            }
            if (req.method === 'GET') {
                const { schoolId } = req.query;
                if (!schoolId || typeof schoolId !== 'string') throw new Error("School ID required");
                const result = await getClassesBySchoolId(schoolId);
                return res.status(200).json(result);
            }
        }

        // --- SECTIONS ---
        if (entity === 'section') {
            if (req.method === 'POST') {
                const parsed = createSectionSchema.parse(req.body);
                const result = await createSectionService(parsed);
                return res.status(201).json(result);
            }
            if (req.method === 'GET') {
                const { classId } = req.query;
                if (!classId || typeof classId !== 'string') throw new Error("Class ID required");
                const result = await getSectionsByClassId(classId);
                return res.status(200).json(result);
            }
        }

        // --- SUBJECTS ---
        if (entity === 'subject') {
            if (req.method === 'POST') {
                const parsed = createSubjectSchema.parse(req.body);
                // Schema has default but Zod parse might need handling for ActiveStatus string -> Enum if sent as string
                // But nativeEnum handles string input usually.
                const result = await createSubjectService(parsed as any);
                return res.status(201).json(result);
            }
            if (req.method === 'GET') {
                const { schoolId, classId } = req.query;
                if (classId && typeof classId === 'string') {
                    const result = await getSubjectsByClassId(classId);
                    return res.status(200).json(result);
                }
                if (schoolId && typeof schoolId === 'string') {
                     const result = await getAllSubjectsOfSchool(schoolId);
                     return res.status(200).json(result);
                }
                throw new Error("School ID or Class ID required");
            }
        }

        return res.status(404).json({ error: "Route not found" });

    } catch (error: any) {
        console.error(`Academic API Error (${entity}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
