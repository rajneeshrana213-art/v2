
import { NextApiRequest, NextApiResponse } from "next";
import { runLogCleanup } from "../../../lib/cron-jobs/log-cleanup";
import { verifyCronSecret } from "../../../lib/middleware/cron-guard";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyCronSecret(req, res)) return;

  try {
    const result = await runLogCleanup();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
