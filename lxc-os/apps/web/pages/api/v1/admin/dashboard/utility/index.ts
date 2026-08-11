import { NextApiRequest, NextApiResponse } from 'next';
import { UtilityService } from '@/lib/services/admin/dashboard/UtilityService';
import { createVisitorSchema, msg91TemplateSchema } from '@/lib/validations/admin/utility';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { action, schoolId } = req.query;

    try {
        if (req.method === 'GET') {
            if (action === 'visitors') {
                if (!schoolId) return res.status(400).json({ error: "School ID required" });
                const data = await UtilityService.getVisitors(schoolId as string);
                return res.status(200).json(data);
            }
             if (action === 'msg91') {
                 const data = await UtilityService.getMsg91Templates(schoolId as string);
                 return res.status(200).json(data);
            }
             if (action === 'teacher-attendance') {
                 if (!schoolId) return res.status(400).json({ error: "School ID required" });
                 const data = await UtilityService.getTeacherAttendance(schoolId as string);
                 return res.status(200).json(data);
             }
        }
        else if (req.method === 'POST') {
             if (action === 'visitor') {
                 const result = createVisitorSchema.safeParse(req.body);
                 if (!result.success) return res.status(400).json({ error: result.error.errors });
                 const data = await UtilityService.createVisitor(result.data);
                 return res.status(201).json(data);
             }
             if (action === 'msg91') {
                 const result = msg91TemplateSchema.safeParse(req.body);
                 if (!result.success) return res.status(400).json({ error: result.error.errors });
                 const data = await UtilityService.upsertMsg91Template(result.data.eventType, req.body);
                 return res.status(200).json(data);
             }
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(400).json({ error: "Invalid action or method" });
}
