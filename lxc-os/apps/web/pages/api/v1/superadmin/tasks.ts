
import { NextApiRequest, NextApiResponse } from "next";
import { SuperAdminService } from "../../../../lib/services/dashboard/super-admin-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }

  try {
    if (req.method === "POST") {
      const { title, description, assignedToId, priority, deadline } = req.body;
      if (!title || !assignedToId) {
        return res.status(400).json({ error: "Missing required fields: title and assignedToId" });
      }
      const data = await SuperAdminService.assignInternalTask(user.id, {
          title,
          description,
          assignedToId,
          priority,
          deadline: deadline ? new Date(deadline) : undefined
      });
      return res.status(201).json(data);
    }
    
    if (req.method === "GET") {
        const employees = await SuperAdminService.getAllEmployees();
        return res.status(200).json(employees);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Super Admin Tasks API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
