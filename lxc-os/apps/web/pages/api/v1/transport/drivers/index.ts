import { NextApiRequest, NextApiResponse } from "next";
import { DriverService } from "@/lib/services/transport-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        if (req.method === 'GET') {
            const { schoolId } = req.query;
            const drivers = await DriverService.getAll(schoolId as string);
            return res.status(200).json(drivers);
        }
        
        // POST to /register for file upload support
        return res.status(405).json({ error: "Method not allowed. Use /transport/drivers/register for creation." });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
