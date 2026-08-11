/**
 * DATABASE PERFORMANCE MIDDLEWARE
 *
 * Tracks query execution time
 * Logs slow queries automatically
 * Provides performance metrics
 */

import { NextApiRequest, NextApiResponse } from "next";
import { trackQuery, getMetrics } from "@/lib/db/query-monitor";

declare global {
  var dbMetrics: any;
}

globalThis.dbMetrics = {
  queryCount: 0,
  totalTime: 0,
  slowQueryCount: 0,
};

/**
 * Middleware to track database performance
 */
export function withDbPerformanceTracking(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = performance.now();
    const originalStatus = res.status;

    // Override status to track response
    res.status = function (code: number) {
      const duration = performance.now() - startTime;

      // Log performance
      globalThis.dbMetrics.queryCount++;
      globalThis.dbMetrics.totalTime += duration;

      if (duration > 200) {
        globalThis.dbMetrics.slowQueryCount++;
        console.warn(
          `🟡 [PERF] ${req.method} ${req.url} took ${duration.toFixed(2)}ms`,
        );
      } else if (duration > 100) {
        console.log(
          `⚠️  [PERF] ${req.method} ${req.url} took ${duration.toFixed(2)}ms`,
        );
      }

      return originalStatus.call(this, code);
    };

    return handler(req, res);
  };
}

/**
 * Get global performance metrics
 */
export function getPerformanceMetrics() {
  const avgTime =
    globalThis.dbMetrics.queryCount > 0
      ? globalThis.dbMetrics.totalTime / globalThis.dbMetrics.queryCount
      : 0;

  return {
    ...globalThis.dbMetrics,
    averageTime: avgTime.toFixed(2) + "ms",
    slowQueryPercentage:
      (
        (globalThis.dbMetrics.slowQueryCount /
          globalThis.dbMetrics.queryCount) *
        100
      ).toFixed(2) + "%",
  };
}

/**
 * Reset metrics
 */
export function resetPerformanceMetrics() {
  globalThis.dbMetrics = {
    queryCount: 0,
    totalTime: 0,
    slowQueryCount: 0,
  };
}
