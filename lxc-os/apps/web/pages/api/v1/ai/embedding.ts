import { NextApiRequest, NextApiResponse } from "next";
import { getFaceEmbedding } from "@/lib/utils/face-matcher";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return; // verifyAuth handles 401 internally

    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    // Call the server-side AI utility which is NOT subject to CORS
    const result = await getFaceEmbedding(imageUrl);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`[AI Proxy Service Error]:`, error.message);
    const status = error.message?.includes("not detected") ? 400 : 500;
    return res.status(status).json({ error: error.message || "Failed to process face embedding" });
  }
}
