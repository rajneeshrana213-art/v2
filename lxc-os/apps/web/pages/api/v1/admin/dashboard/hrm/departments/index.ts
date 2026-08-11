import { NextApiRequest, NextApiResponse } from 'next';
import { HrmService } from '@/lib/services/admin/dashboard/HrmService';
import { createDepartmentSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "School ID required" });
        const list = await HrmService.getDepartments(schoolId as string);
        return res.status(200).json(list);
    } else if (req.method === 'POST') {
        const result = createDepartmentSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const created = await HrmService.createDepartment(result.data);
        return res.status(201).json(created);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
