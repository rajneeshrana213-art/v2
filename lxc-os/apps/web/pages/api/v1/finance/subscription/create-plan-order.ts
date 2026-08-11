import { NextApiRequest, NextApiResponse } from "next";
import { SubscriptionService } from "../../../../../lib/services/finance/subscription-service";
import { cors } from "../../../../../lib/middleware/cors";
import { withAuth } from "../../../../../lib/middleware/api-guard";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await SubscriptionService.createRazorpayOrder(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create plan order error:", error);
    const statusCode = error.message?.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ message: error.message || "Failed to create plan order" });
  }
}

export default withAuth(handler);


