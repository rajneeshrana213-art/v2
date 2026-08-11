import { NextApiRequest, NextApiResponse } from 'next';
import { InventoryService } from '@/lib/services/admin/dashboard/InventoryService';
import { inventoryTransactionSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        const result = inventoryTransactionSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        try {
            const created = await InventoryService.recordTransaction(result.data);
            return res.status(201).json(created);
        } catch (e: any) {
             return res.status(500).json({ error: e.message });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
