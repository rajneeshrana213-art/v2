import { NextApiRequest, NextApiResponse } from 'next';
import { EmployeeService } from '@/lib/services/admin/dashboard/EmployeeService';
import { registerEmployeeSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export const config = {
    api: { bodyParser: false } // For potential profile pic upload
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
         const { schoolId } = req.query;
         try {
             if (schoolId) {
                 const list = await EmployeeService.getEmployeesBySchool(schoolId as string);
                 return res.status(200).json({ message: "Employees", data: list });
             }
             const list = await EmployeeService.getAllEmployees();
             return res.status(200).json({ message: "All Employees", data: list });
         } catch (e: any) {
             return res.status(500).json({ error: e.message });
         }
    } else if (req.method === 'POST') {
        // Upload logic placeholder
        return res.status(501).json({ error: "Upload pending migration. Use form-data." });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
