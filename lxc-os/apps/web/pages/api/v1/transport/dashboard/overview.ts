import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";
import { getTransportOverview } from "@/lib/services/transport/dashboard-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const overview = await getTransportOverview(user.schoolId as string);
    return res.status(200).json(overview);
  } catch (error: any) {
    console.error("Transport overview error:", error);
    return res.status(500).json({ error: "Failed to load transport overview" });
  }
}


