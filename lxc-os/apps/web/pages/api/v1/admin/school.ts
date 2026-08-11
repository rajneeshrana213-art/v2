import { NextApiRequest, NextApiResponse } from "next";

import { getSchoolInfoByUserId } from "@/lib/services/school-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;
    const userId = user.id;

    const result = await getSchoolInfoByUserId(userId);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("School Info Error:", error);
    return res.status(error.message === "School not found for this user" ? 404 : 500).json({ 
        error: error.message || "Internal Server Error",
    });
  }
}
