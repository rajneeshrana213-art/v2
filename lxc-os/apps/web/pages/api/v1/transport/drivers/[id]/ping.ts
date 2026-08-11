import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);

    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;
    if (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'transport') {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "Driver ID required" });

    if (req.method === 'POST') {
        try {
            const { type, content } = req.body;

            const notification = await prisma.driverNotification.create({
                data: {
                    driverId: id,
                    type: type || "PING",
                    content: content || "Admin is requesting a status update.",
                }
            });

            return res.status(200).json(notification);
        } catch (error: any) {
            console.error("[DRIVER_PING_ERROR]", error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
