/**
 * DATABASE PERFORMANCE MONITORING & QUERY LOGGER
 *
 * Ultra-fast query execution tracking
 * Identifies bottlenecks in real-time
 * Automatic performance warnings
 */

interface QueryMetrics {
  name: string;
  duration: number;
  timestamp: Date;
  status: "FAST" | "SLOW" | "VERY_SLOW";
  query?: string;
}

const THRESHOLDS = {
  FAST: 50, // Under 50ms is excellent
  SLOW: 100, // 50-100ms is acceptable
  VERY_SLOW: 200, // Over 200ms needs optimization
};

const metrics: QueryMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Track query execution time
 */
export async function trackQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
  threshold: number = THRESHOLDS.SLOW,
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    let status: "FAST" | "SLOW" | "VERY_SLOW" = "FAST";
    if (duration > THRESHOLDS.VERY_SLOW) status = "VERY_SLOW";
    else if (duration > threshold) status = "SLOW";

    const metric: QueryMetrics = {
      name,
      duration,
      timestamp: new Date(),
      status,
    };

    metrics.push(metric);
    if (metrics.length > MAX_METRICS) metrics.shift();

    // Log slow queries
    if (status !== "FAST") {
      const emoji = status === "VERY_SLOW" ? "🔴" : "🟡";
      console.warn(`${emoji} [DB] ${name}: ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ [DB] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ [DB] ${name}: ${duration.toFixed(2)}ms - ERROR`, error);
    throw error;
  }
}

/**
 * Get performance metrics
 */
export function getMetrics() {
  const summary = {
    total: metrics.length,
    fast: metrics.filter((m) => m.status === "FAST").length,
    slow: metrics.filter((m) => m.status === "SLOW").length,
    verySlow: metrics.filter((m) => m.status === "VERY_SLOW").length,
    avgDuration:
      metrics.reduce((a, b) => a + b.duration, 0) / metrics.length || 0,
    maxDuration: Math.max(...metrics.map((m) => m.duration), 0),
    minDuration: Math.min(...metrics.map((m) => m.duration), Infinity),
    recentQueries: metrics.slice(-20),
  };

  return summary;
}

/**
 * Get slow queries report
 */
export function getSlowQueriesReport() {
  return metrics
    .filter((m) => m.status === "VERY_SLOW")
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 50);
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  metrics.length = 0;
}

/**
 * Export metrics for analysis
 */
export function exportMetrics() {
  return {
    timestamp: new Date().toISOString(),
    metrics: [...metrics],
    summary: getMetrics(),
  };
}
