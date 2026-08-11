
import { NextApiRequest, NextApiResponse } from "next";
import { SubscriptionService } from "../../../../../../lib/services/finance/subscription-service";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const { subscriptionId } = req.query;

    const { buffer, filename } = await SubscriptionService.getPlanInvoice(
      subscriptionId as string,
      user.id,
      user.role
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (error: any) {
    console.error("Invoice download error:", error);
    res.status(500).json({ message: error.message || "Failed to download invoice" });
  }
}
