import { NextApiRequest, NextApiResponse } from "next";
import { HostelService } from "@/lib/services/hostel/HostelService";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const updateHostelSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["BOYS", "GIRLS", "COED"]).optional(),
  capacity: z.number().int().nonnegative().optional(),
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

  const { hostelId } = req.query;

  if (!hostelId || typeof hostelId !== "string") {
    return res.status(400).json({ error: "Invalid Hostel ID" });
  }

  try {
    if (req.method === "GET") {
        const { includeHierarchy } = req.query;
        const hostel = await HostelService.getHostelById(
            hostelId, 
            includeHierarchy === "true"
        );
        if (!hostel) return res.status(404).json({ error: "Hostel not found" });
        return res.status(200).json(hostel);

    } else if (req.method === "PUT") {
        const body = updateHostelSchema.parse(req.body);
        const updated = await HostelService.updateHostel(hostelId, body);
        return res.status(200).json(updated);

    } else if (req.method === "DELETE") {
        await HostelService.deleteHostel(hostelId);
        return res.status(204).end();

    } else {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Hostel ID API Error:", error);
     if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
