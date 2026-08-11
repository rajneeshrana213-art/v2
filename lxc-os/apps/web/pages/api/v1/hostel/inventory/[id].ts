import { NextApiRequest, NextApiResponse } from "next";
import { InventoryService } from "@/lib/services/hostel/InventoryService";
import { updateInventorySchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Inventory ID is required" });
  }

  if (req.method === "GET") {
    try {
      const item = await InventoryService.getInventoryById(id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      return res.status(200).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const result = updateInventorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const item = await InventoryService.updateInventory(id, result.data);
      return res.status(200).json(item);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Item not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await InventoryService.deleteInventory(id);
      return res.status(204).end();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Item not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
