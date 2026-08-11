import { NextApiRequest, NextApiResponse } from "next";
import { SubscriptionService } from "../../../../../lib/services/finance/subscription-service";
import { cors } from "../../../../../lib/middleware/cors";
import getRawBody from "raw-body";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBody = await getRawBody(req, {
      encoding: "utf-8",
    });

    await SubscriptionService.handleWebhook(signature, rawBody);
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return res.status(400).json({ message: error.message || "Webhook handling failed" });
  }
}
