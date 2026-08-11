import { NextApiRequest, NextApiResponse } from "next";
import { StudentService } from "@/lib/services/dashboard/student-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const data = await StudentService.getLibraryInfo(user.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
