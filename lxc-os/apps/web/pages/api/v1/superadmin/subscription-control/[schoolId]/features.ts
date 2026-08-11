import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { SubscriptionFeatureStatus } from "@prisma/client";

// Load feature catalog from global settings. If none is configured, return an empty array.
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
  res: NextApiResponse,
) {
  const { schoolId } = req.query;

  if (!schoolId || typeof schoolId !== "string") {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser) return; // verifyAuth handles 401 response

  // Allow admins only for their OWN school, or superadmin for all schools
  const isSuperAdmin = authUser.role === "superadmin";
  const isAdminOfThisSchool =
    authUser.role === "admin" && authUser.schoolId === schoolId;

  if (!isSuperAdmin && !isAdminOfThisSchool) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }

  // Admins can GET and PATCH (to enable/disable features), but only superadmin can POST (bulk update)
  if (req.method === "POST" && !isSuperAdmin) {
    return res
      .status(403)
      .json({
        message: "Forbidden: Super Admin access required for bulk operations",
      });
  }

  if (req.method === "GET") {
    return handleGet(schoolId, res);
  } else if (req.method === "PATCH") {
    return handlePatch(schoolId, req, res);
  } else if (req.method === "POST") {
    return handlePost(schoolId, req, res);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

async function handleGet(schoolId: string, res: NextApiResponse) {
  try {
    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const existingFeatures = await prisma.schoolFeatureConfig.findMany({
      where: { schoolId },
    });

    const catalog = await loadFeatureCatalog();

    // Merge catalog with existing records to ensure all features are represented
    const features = catalog.map((df) => {
      const existing = existingFeatures.find((ef) => ef.featureName === df.key);
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
    });

    return res.status(200).json(features);
  } catch (error) {
    console.error("Error fetching school features:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePatch(
  schoolId: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const { featureKey, status, monthlyPrice, isMandatory } = req.body;

    if (!featureKey) {
      return res.status(400).json({ message: "Feature key is required" });
    }

    const updated = await prisma.schoolFeatureConfig.upsert({
      where: {
        schoolId_featureName: {
          schoolId,
          featureName: featureKey,
        },
      },
      update: {
        status: status as SubscriptionFeatureStatus,
        monthlyPrice:
          monthlyPrice !== undefined ? parseFloat(monthlyPrice) : undefined,
        isMandatory: isMandatory !== undefined ? isMandatory : undefined,
        activatedOn: status === "ENABLED" ? new Date() : undefined,
      },
      create: {
        schoolId,
        featureName: featureKey,
        status: (status as SubscriptionFeatureStatus) || "DISABLED",
        monthlyPrice: monthlyPrice !== undefined ? parseFloat(monthlyPrice) : 0,
        isMandatory: isMandatory || false,
        activatedOn: status === "ENABLED" ? new Date() : null,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating school feature:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Bulk update or initialization
async function handlePost(
  schoolId: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const { features } = req.body; // Array of feature updates

    if (!Array.isArray(features)) {
      return res.status(400).json({ message: "Features must be an array" });
    }

    const results = await Promise.all(
      features.map((f) =>
        prisma.schoolFeatureConfig.upsert({
          where: {
            schoolId_featureName: {
              schoolId,
              featureName: f.key,
            },
          },
          update: {
            status: f.status,
            monthlyPrice: f.monthlyPrice,
            isMandatory: f.isMandatory,
          },
          create: {
            schoolId,
            featureName: f.key,
            status: f.status || "DISABLED",
            monthlyPrice: f.monthlyPrice || 0,
            isMandatory: f.isMandatory || false,
          },
        }),
      ),
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in bulk feature update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
