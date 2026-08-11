import { NextApiRequest, NextApiResponse } from 'next';
import { EmployeeDocumentService } from '@/lib/services/admin/dashboard/EmployeeDocumentService';
import { verifyAuth } from "@/lib/auth";

export const config = {
    api: { bodyParser: false } 
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { employeeId } = req.query;

    if (req.method === 'GET') {
         if (!employeeId || typeof employeeId !== 'string') return res.status(400).json({ error: "Employee ID required" });
         try {
             const docs = await EmployeeDocumentService.getDocuments(employeeId);
             return res.status(200).json(docs);
         } catch (e: any) {
             return res.status(500).json({ error: e.message });
         }
    } else if (req.method === 'POST') {
        return res.status(501).json({ error: "Upload not implemented yet" });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
