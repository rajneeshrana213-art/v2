import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { SidebarPreferenceService } from "@/lib/services/admin/SidebarPreferenceService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== Role.admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === "GET") {
      const preferences = await SidebarPreferenceService.getPreferences(user.id);
      return res.status(200).json({ preferences });
    }

    if (req.method === "POST") {
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== "object") {
        console.log("Invalid preferences data received:", preferences);
        return res.status(400).json({ error: "Invalid preferences data" });
      }

      console.log("Saving sidebar preferences for User:", user.id);
      console.log("Preferences payload:", JSON.stringify(preferences));

      await SidebarPreferenceService.savePreferences(user.id, preferences);
      
      return res.status(200).json({ 
        success: true, 
        message: "Sidebar preferences saved successfully" 
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Error in sidebar preferences API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

