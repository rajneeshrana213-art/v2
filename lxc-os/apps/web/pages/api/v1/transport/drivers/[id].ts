import { NextApiRequest, NextApiResponse } from "next";
import { DriverService } from "@/lib/services/transport-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    try {
        if (req.method === 'GET') {
            const driver = await DriverService.getById(id);
            if (!driver) return res.status(404).json({ error: "Driver not found" });
            return res.status(200).json(driver);
        }

        if (req.method === 'DELETE') {
            await DriverService.delete(id);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
