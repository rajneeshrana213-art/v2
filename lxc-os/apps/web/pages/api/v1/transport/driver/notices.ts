import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);

    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;

    if (user.role !== 'driver' && user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
    }

    if (req.method === 'GET') {
        try {
            const notifications = await prisma.driverNotification.findMany({
                where: {
                    driver: {
                        userId: user.id
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 20
            });

            return res.status(200).json(notifications);
        } catch (error: any) {
            console.error("[DRIVER_NOTICES_ERROR]", error);
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { id } = req.body;
            await prisma.driverNotification.updateMany({
                where: {
                    id: id,
                    driver: { userId: user.id }
                },
                data: {
                    isRead: true
                }
            });
            return res.status(200).json({ success: true });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
