import { NextApiRequest, NextApiResponse } from "next";
import { BusService } from "@/lib/services/transport-service";
import { updateBusSchema } from "@/lib/validations/transport";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || typeof id !== "string")
    return res.status(400).json({ error: "ID required" });

  try {
    if (req.method === "GET") {
      const bus = await BusService.getById(id);
      if (!bus) return res.status(404).json({ error: "Bus not found" });
      return res.status(200).json(bus);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const parsed = updateBusSchema.parse(req.body);
      const bus = await BusService.update(id, parsed);
      return res.status(200).json(bus);
    }

    if (req.method === "DELETE") {
      await BusService.delete(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
