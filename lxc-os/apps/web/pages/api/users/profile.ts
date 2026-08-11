import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getUserProfile } from "@/lib/services/user-service";

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
    
    // Logic from getProfileRoute.ts
    const userProfile = await getUserProfile(user.id);
    
    // OPTIMIZATION: Don't fetch full permissions here
    res.status(200).json({ success: "ok", user: userProfile, permissions: {} });

  } catch (error: any) {
    console.error("Error in /api/users/profile:", error);
    return res.status(500).json({ 
      error: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
