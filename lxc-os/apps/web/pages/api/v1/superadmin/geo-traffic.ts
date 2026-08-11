import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/** Tailwind colour classes assigned per country (top 4 + Others) */
const COUNTRY_COLORS: Record<string, string> = {
  India: "bg-indigo-500",
  "United States": "bg-blue-400",
  USA: "bg-blue-400",
  "United Kingdom": "bg-purple-400",
  UK: "bg-purple-400",
  UAE: "bg-orange-400",
  "United Arab Emirates": "bg-orange-400",
  Canada: "bg-emerald-400",
  Australia: "bg-yellow-400",
  Germany: "bg-pink-400",
  Singapore: "bg-teal-400",
  Others: "bg-gray-300",
};

const FALLBACK_COLORS = [
  "bg-indigo-500",
  "bg-blue-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-emerald-400",
  "bg-yellow-400",
  "bg-pink-400",
  "bg-teal-400",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin")
    return res.status(403).json({ message: "Forbidden" });

  try {
    // Group users by country field
    const rows = await prisma.user.groupBy({
      by: ["country"],
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
    });

    // Filter out blank / null entries
    const filtered = rows.filter((r) => r.country && r.country.trim() !== "");

    const total = filtered.reduce((sum, r) => sum + r._count.country, 0);

    if (total === 0) {
      return res.status(200).json({ geoTraffic: [] });
    }

    // Top 4 countries + group the rest as "Others"
    const top4 = filtered.slice(0, 4);
    const othersCount = filtered
      .slice(4)
      .reduce((sum, r) => sum + r._count.country, 0);

    const geoTraffic = top4.map((r, idx) => ({
      country: r.country,
      percentage: Math.round((r._count.country / total) * 100),
      color:
        COUNTRY_COLORS[r.country] ||
        FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
    }));

    if (othersCount > 0) {
      geoTraffic.push({
        country: "Others",
        percentage: Math.round((othersCount / total) * 100),
        color: COUNTRY_COLORS["Others"],
      });
    }

    return res.status(200).json({ geoTraffic });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
