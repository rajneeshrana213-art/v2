
import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "../../../../../../lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(410).json({ 
    message: "Fee invoice endpoint deprecated. Fee model removed - use finance system endpoints instead",
    deprecated: true
  });
}
