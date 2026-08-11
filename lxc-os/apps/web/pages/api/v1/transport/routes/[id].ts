import { NextApiRequest, NextApiResponse } from "next";
import { RouteService } from "@/lib/services/transport-service";
import { updateRouteSchema } from "@/lib/validations/transport";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    try {
        if (req.method === 'GET') {
            const route = await RouteService.getById(id);
            if (!route) return res.status(404).json({ error: "Route not found" });
            return res.status(200).json(route);
        }

        if (req.method === 'PUT') {
            const parsed = updateRouteSchema.parse(req.body);
            const route = await RouteService.update(id, parsed);
            return res.status(200).json(route);
        }

        if (req.method === 'DELETE') {
            await RouteService.delete(id);
            return res.status(204).end();
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
