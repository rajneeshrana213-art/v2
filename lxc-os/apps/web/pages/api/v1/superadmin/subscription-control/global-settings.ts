import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import {
  getGlobalSettingsByGroup,
  invalidateGlobalSettingsCache,
} from "@/lib/cache/globalSettings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    res.status(403).json({ message: "Forbidden: Super Admin access required" });
    return;
  }

  if (req.method === "GET") {
    return handleGet(req, res);
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use cached version instead of direct database query
    // Cache returns Record<string,any>; convert to [{key,value}] array so the
    // frontend can call .find() consistently with the POST response format.
    const forceRefresh = !!req.query.t;
    const settingsObj = await getGlobalSettingsByGroup("SUBSCRIPTION", forceRefresh);
    const settings = Object.entries(settingsObj).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching global settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings)) {
      res.status(400).json({ message: "Settings must be an array" });
      return;
    }

    const results = await Promise.all(
      settings.map((s) =>
        prisma.globalSetting.upsert({
          where: { key: s.key },
          update: { value: JSON.stringify(s.value) },
          create: {
            key: s.key,
            value: JSON.stringify(s.value),
            group: "SUBSCRIPTION",
          },
        }),
      ),
    );

    // Invalidate cache after update
    invalidateGlobalSettingsCache("SUBSCRIPTION");

    res.status(200).json(results);
  } catch (error) {
    console.error("Error updating global settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
