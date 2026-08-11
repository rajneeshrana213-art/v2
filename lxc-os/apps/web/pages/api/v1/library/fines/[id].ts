import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query; // fineId
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "Fine ID required" });

    if (req.method === 'PUT') {
        // Action: Pay Fine
        try {
            const result = await LibraryService.settleFine(id);
            return res.status(200).json(result);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
