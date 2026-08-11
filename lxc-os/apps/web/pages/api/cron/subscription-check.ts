
import { NextApiRequest, NextApiResponse } from "next";
import { checkSubscriptions } from "../../../lib/cron-jobs/subscription-management";
import { verifyCronSecret } from "../../../lib/middleware/cron-guard";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyCronSecret(req, res)) return;

  try {
    const result = await checkSubscriptions();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
