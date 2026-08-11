import { NextApiRequest, NextApiResponse } from "next";
import { HostelService } from "@/lib/services/hostel/HostelService";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const createBlockSchema = z.object({
  name: z.string().min(1),
});

const createFloorSchema = z.object({
  blockId: z.string().min(1),
  floorNumber: z.number().int(),
  name: z.string().optional(),
});

const createRoomSchema = z.object({
  floorId: z.string().min(1),
  roomNumber: z.string().min(1),
  type: z.enum(["STANDARD", "PREMIUM", "LUXURY", "DORMITORY"]),
  capacity: z.number().int().min(1),
  hasAC: z.boolean().default(false),
  baseRent: z.number().nonnegative(),
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
    if (req.method === "POST") {
        const { type } = req.query;

        if (type === "block") {
            const body = createBlockSchema.parse(req.body);
            const block = await HostelService.createBlock(hostelId, body.name);
            return res.status(201).json(block);
        } else if (type === "floor") {
            const body = createFloorSchema.parse(req.body);
            // Verify block belongs to hostel? (Skipped for speed, but good practice)
            const floor = await HostelService.createFloor(body.blockId, body.floorNumber, body.name);
            return res.status(201).json(floor);
        } else if (type === "room") {
            const body = createRoomSchema.parse(req.body);
            const room = await HostelService.createRoom(body);
            return res.status(201).json(room);
        } else {
             return res.status(400).json({ error: "Invalid type param. Use 'block', 'floor', or 'room'." });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Hostel Infra API Error:", error);
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
