import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Load feature catalog entirely from global settings. If none exists, return an empty array.
async function loadFeatureCatalog() {
  const setting = await prisma.globalSetting.findUnique({
    where: { key: "FEATURE_CATALOG" },
  });

  if (!setting) return [];

  try {
    const parsed = JSON.parse(setting.value || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.map((f: any) => ({
      name: f.name || f.key,
      key: f.key,
      defaultPrice:
        typeof f.defaultPrice === "number"
          ? f.defaultPrice
          : Number(f.defaultPrice || 0),
      routes: Array.isArray(f.routes) ? f.routes : [],
      subFeatures: Array.isArray(f.subFeatures) ? f.subFeatures : [],
    }));
  } catch {
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return; // verifyAuth handles 401 response

    if (!user?.schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school" });
    }

    const existingFeatures = await prisma.schoolFeatureConfig.findMany({
      where: { schoolId: user.schoolId },
    });

    const catalog = await loadFeatureCatalog();

    const features = catalog.map((df) => {
      const existing = existingFeatures.find(
        (ef) => ef.featureName === df.key
      );
      return {
        key: df.key,
        name: df.name,
        status: existing?.status || "DISABLED",
        monthlyPrice: existing?.monthlyPrice ?? df.defaultPrice,
        activatedOn: existing?.activatedOn || null,
        isMandatory: existing?.isMandatory || false,
        id: existing?.id || null,
        routes: df.routes || [],
        subFeatures: df.subFeatures || [],
      };
    }).filter(f => !f.name.toLowerCase().includes("group"));

    return res.status(200).json(features);
  } catch (error) {
    console.error("admin-features error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


