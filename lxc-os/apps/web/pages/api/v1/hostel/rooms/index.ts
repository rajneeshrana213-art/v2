import { NextApiRequest, NextApiResponse } from "next";
import { RoomService } from "@/lib/services/hostel/RoomService";
import { createRoomSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const { page, limit, hostelId } = req.query;
      
      if (!hostelId || typeof hostelId !== 'string') {
          return res.status(400).json({ error: "Hostel ID is required to fetch rooms" });
      }

      const result = await RoomService.getAllRooms(
        hostelId,
        Number(page) || 1,
        Number(limit) || 10
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createRoomSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const room = await RoomService.createRoom(result.data);
      return res.status(201).json(room);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
