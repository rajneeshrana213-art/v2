import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";
import { resolveSOS } from "@/lib/services/transport/sos-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid SOS id" });
  }

  try {
    const incident = await resolveSOS(id);
    return res.status(200).json(incident);
  } catch (error: any) {
    console.error("Resolve SOS error:", error);
    return res.status(500).json({ error: error.message || "Failed to resolve SOS incident" });
  }
}


