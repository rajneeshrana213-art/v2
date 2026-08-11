import { NextApiRequest, NextApiResponse } from "next";
import { HostelService } from "@/lib/services/hostel/HostelService";

import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const createHostelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["BOYS", "GIRLS", "COED"]),
  capacity: z.number().int().nonnegative(),
  schoolId: z.string().min(1),
  address: z.string().optional(),
  wardenId: z.string().optional(),
  rules: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    // Basic method handling. In a real app we'd check auth here.
    if (req.method === "POST") {
        const body = createHostelSchema.parse(req.body);
        const hostel = await HostelService.createHostel(body);
        return res.status(201).json(hostel);
    } else if (req.method === "GET") {
        const { schoolId, query, page, limit } = req.query;
        
        if (!schoolId || typeof schoolId !== "string") {
            return res.status(400).json({ error: "Missing schoolId" });
        }

        const result = await HostelService.getAllHostels(
            schoolId,
            typeof query === "string" ? query : undefined,
            Number(page) || 1,
            Number(limit) || 10
        );
        return res.status(200).json(result);
    } else {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Hostel API Error:", error);
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
