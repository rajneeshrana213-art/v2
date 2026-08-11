import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import Logger from "@/lib/utils/logger";

const globalForWebVitals = globalThis as unknown as {
  slowWebVitals: any[];
};

export const slowWebVitals: any[] = globalForWebVitals.slowWebVitals || [];
globalForWebVitals.slowWebVitals = slowWebVitals;

const MAX_WEB_VITALS = 50;

// Thresholds based on Google's Core Web Vitals "needs improvement" values
const WEB_VITALS_THRESHOLDS: Record<string, number> = {
  FCP: 3000, // First Contentful Paint > 3s
  LCP: 4000, // Largest Contentful Paint > 4s
  CLS: 0.25, // Cumulative Layout Shift > 0.25
  FID: 300, // First Input Delay > 300ms
  INP: 500, // Interaction to Next Paint > 500ms
  TTFB: 1800, // Time to First Byte > 1800ms
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Reporting web vitals is allowed for all users (including unauthenticated visitors)
    // to ensure comprehensive performance monitoring.

    const { name, value, page } = req.body;

    if (!name || value === undefined) {
      res.status(400).json({ message: "Missing name or value" });
      return;
    }

    const threshold = WEB_VITALS_THRESHOLDS[name];
    if (threshold !== undefined && value > threshold) {
      const entry = {
        id: `wv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        value: Math.round(name === "CLS" ? value * 1000 : value),
        unit: name === "CLS" ? "score×1000" : "ms",
        page: page || "unknown",
        timestamp: new Date().toISOString(),
      };
      slowWebVitals.unshift(entry);
      if (slowWebVitals.length > MAX_WEB_VITALS) {
        slowWebVitals.pop();
      }
      Logger.warn(`[SLOW WEB VITAL] ${name}=${value} on ${page || "unknown"}`);
    }

    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    const authUser = await verifyAuth(req, res);
    if (!authUser || authUser.role !== "superadmin") {
      res
        .status(403)
        .json({ message: "Forbidden: Super Admin access required" });
      return;
    }

    res.status(200).json({
      slowWebVitals,
      thresholds: WEB_VITALS_THRESHOLDS,
      total: slowWebVitals.length,
    });
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
