import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Constant ID to maintain a single global configuration record
const CONFIG_ID = "global-app-version-config";

export interface AppVersionConfig {
  currentVersion: string;
  minimumVersion: string;
  downloadUrl:    string;
  whatsNew:       string;
  updatedAt:      string;
  updatedBy:      string;
}

function getDefaults(): AppVersionConfig {
  // These env-var defaults are used ONLY on first launch before the superadmin
  // has saved anything. After the first save, the JSON config file takes over.
  return {
    currentVersion: process.env.APP_CURRENT_VERSION || "1.0.0",
    minimumVersion: process.env.APP_MINIMUM_VERSION || "1.0.0",
    downloadUrl:    process.env.APP_DOWNLOAD_URL    || "https://play.google.com/store/apps/details?id=com.learnxchain.lxc&hl=en_IN",
    whatsNew:       process.env.APP_WHATS_NEW       || "Bug fixes and performance improvements.",
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
}

export async function readConfig(): Promise<AppVersionConfig> {
  try {
    const config = await prisma.appVersion.findUnique({
      where: { id: CONFIG_ID },
    });
    if (config) {
      return {
        currentVersion: config.currentVersion,
        minimumVersion: config.minimumVersion,
        downloadUrl:    config.downloadUrl,
        whatsNew:       config.whatsNew,
        updatedAt:      config.updatedAt.toISOString(),
        updatedBy:      config.updatedBy,
      };
    }
  } catch (err) {
    console.error("[readConfig] Database error:", err);
  }
  return getDefaults();
}

async function writeConfig(cfg: Omit<AppVersionConfig, "updatedAt">): Promise<void> {
  await prisma.appVersion.upsert({
    where: { id: CONFIG_ID },
    update: {
      currentVersion: cfg.currentVersion,
      minimumVersion: cfg.minimumVersion,
      downloadUrl:    cfg.downloadUrl,
      whatsNew:       cfg.whatsNew,
      updatedBy:      cfg.updatedBy,
    },
    create: {
      id:             CONFIG_ID,
      currentVersion: cfg.currentVersion,
      minimumVersion: cfg.minimumVersion,
      downloadUrl:    cfg.downloadUrl,
      whatsNew:       cfg.whatsNew,
      updatedBy:      cfg.updatedBy,
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth guard: superadmin only
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }

  // ── GET: return current config ──────────────────────────────────────────────
  if (req.method === "GET") {
    const config = await readConfig();
    return res.status(200).json(config);
  }

  // ── PUT: update config ──────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const { currentVersion, minimumVersion, downloadUrl, whatsNew } =
      req.body as Partial<AppVersionConfig>;

    if (!currentVersion || !minimumVersion || !downloadUrl) {
      return res.status(400).json({
        error: "currentVersion, minimumVersion, and downloadUrl are required.",
      });
    }

    const semver = /^\d+\.\d+\.\d+$/;
    if (!semver.test(currentVersion) || !semver.test(minimumVersion)) {
      return res.status(400).json({
        error: "Version must be in X.Y.Z format (e.g. 1.2.0).",
      });
    }

    const configData = {
      currentVersion,
      minimumVersion,
      downloadUrl,
      whatsNew: whatsNew || "",
      updatedBy: authUser.name || authUser.email || "superadmin",
    };

    await writeConfig(configData);
    const finalConfig = await readConfig();
    return res.status(200).json({ success: true, config: finalConfig });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
