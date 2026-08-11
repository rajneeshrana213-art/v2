import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    // Auth check omitted
    const { driverId } = req.query; // Assuming driverId pass via query or extracted from token in real implementation
    // For now, simpler port matching controller logic which expects user attached to req

    if (req.method === 'GET') {
        const dId = driverId as string; 
        if (!dId) return res.status(400).json({ error: "Driver ID required" });

        try {
             const notifications = await prisma.driverNotification.findMany({
                 where: { driverId: dId },
                 orderBy: { sentAt: 'desc' }
             });
             return res.status(200).json({ notifications });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    if (req.method === 'PATCH' || req.method === 'PUT') {
         const { id } = req.query; // notification ID
         if (!id || typeof id !== 'string') return res.status(400).json({ error: "Notification ID required" });
         
         try {
             const updated = await prisma.driverNotification.update({
                 where: { id },
                 data: { isRead: true }
             });
             return res.status(200).json({ updated });
         } catch (e: any) {
             return res.status(500).json({ error: e.message });
         }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
}
