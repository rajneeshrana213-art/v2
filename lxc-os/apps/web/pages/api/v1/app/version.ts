import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Constant ID to maintain a single global configuration record
const CONFIG_ID = "global-app-version-config";

interface AppVersionConfig {
  currentVersion: string;
  minimumVersion: string;
  downloadUrl: string;
  whatsNew: string;
}

async function readConfig(): Promise<AppVersionConfig> {
  // Priority: 1) Superadmin-saved Database config record  2) Env vars (initial defaults only)
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
      };
    }
  } catch (err) {
    console.error("[readConfig] Database error:", err);
  }
  return {
    currentVersion: process.env.APP_CURRENT_VERSION || "1.0.0",
    minimumVersion: process.env.APP_MINIMUM_VERSION || "1.0.0",
    downloadUrl:    process.env.APP_DOWNLOAD_URL    || "https://play.google.com/store/apps/details?id=com.learnxchain.lxc&hl=en_IN",
    whatsNew:       process.env.APP_WHATS_NEW       || "Bug fixes and performance improvements.",
  };
}

// Compares "1.2.3" style versions: 1 = a > b, -1 = a < b, 0 = equal
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { currentVersion, minimumVersion, downloadUrl, whatsNew } = await readConfig();

  const clientVersion = (req.query.version as string) || "0.0.0";
  const platform      = (req.query.platform as string) || "android";

  const isForceUpdate    = compareVersions(clientVersion, minimumVersion) < 0;
  const isUpdateOptional = !isForceUpdate && compareVersions(clientVersion, currentVersion) < 0;

  // Cache for 5 min so repeated cold starts don't hit disk every request
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json({
    currentVersion,
    minimumVersion,
    clientVersion,
    platform,
    isForceUpdate,
    isUpdateOptional,
    updateAvailable: isForceUpdate || isUpdateOptional,
    downloadUrl,
    whatsNew,
  });
}
