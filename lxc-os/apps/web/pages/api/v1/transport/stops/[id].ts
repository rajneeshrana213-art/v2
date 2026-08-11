import { NextApiRequest, NextApiResponse } from "next";
import { StopService } from "@/lib/services/transport-service";
import { updateBusStopSchema } from "@/lib/validations/transport";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    try {
        if (req.method === 'GET') {
            const stop = await StopService.getById(id);
            if (!stop) return res.status(404).json({ error: "Stop not found" });
            return res.status(200).json(stop);
        }

        if (req.method === 'PUT') {
            const parsed = updateBusStopSchema.parse(req.body);
            const stop = await StopService.update(id, parsed);
            return res.status(200).json(stop);
        }

        if (req.method === 'DELETE') {
            await StopService.delete(id);
            return res.status(204).end();
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
