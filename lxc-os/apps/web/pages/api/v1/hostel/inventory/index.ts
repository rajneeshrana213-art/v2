import { NextApiRequest, NextApiResponse } from "next";
import { InventoryService } from "@/lib/services/hostel/InventoryService";
import { createInventorySchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const { roomId } = req.query;
      if (!roomId || typeof roomId !== 'string') {
          return res.status(400).json({ error: "Room ID is required to fetch inventory" });
      }
      const inventory = await InventoryService.getInventoriesByRoom(roomId);
      return res.status(200).json(inventory);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createInventorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const item = await InventoryService.createInventory(result.data);
      return res.status(201).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
