import { NextApiRequest, NextApiResponse } from "next";
// import { verifyAuth } from "../../../../lib/auth"; // Trigger might be system/webhook? Original had no auth middleware on trigger route in code snippet provided?
// Wait, looking back at routes file: router.post("/notification/trigger", trigger); has NO middleware.
// But it's safer to have some auth or at least verify it's mostly internal. For now, I'll leaving it open but keep an eye on it.
// Actually, safely assume it should be authenticated if called from frontend.

import { triggerNotification } from "../../../../lib/services/notification/notification-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
     // Original route didn't have explicit auth check in the snippet provided:
     // router.post("/notification/trigger", trigger);
     // But usually triggers come from internal events or authenticated users.
    
    await triggerNotification({
      triggerEvent: req.body.triggerEvent,
      schoolId: req.body.schoolId,
      data: req.body.data,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
