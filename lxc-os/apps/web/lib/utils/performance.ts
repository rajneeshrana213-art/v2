/**
 * Performance Utilities
 * Helper functions for optimizing database queries and reducing costs
 */

import { cache } from "./cache";
import logger from "./logger";

/**
 * Get pagination params from request
 */
export function getPaginationParams(req: any, defaultPageSize: number = 50, maxPageSize: number = 100) {
  const page = Math.max(1, parseInt(req.query?.page as string) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(req.query?.pageSize as string) || defaultPageSize));
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

/**
 * Get cached data or fetch and cache
 */
export async function getCachedOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const data = await fetchFn();
  cache.set(cacheKey, data, ttlSeconds);
  return data;
}

/**
 * Optimize select fields - only return what's needed
 */
export const commonSelects = {
  userBasic: {
    id: true,
    name: true,
    email: true,
    phone: true,
    profilePic: true,
    role: true,
  },
  userMinimal: {
    id: true,
    name: true,
    email: true,
    phone: true,
  },
  schoolBasic: {
    id: true,
    schoolName: true,
    schoolLogo: true,
  },
};

/**
 * Safe error logging (replaces console.error)
 */
export function logError(message: string, error: any, context?: Record<string, any>) {
  logger.error(message, { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context 
  });
}

/**
 * Safe info logging (replaces console.log)
 */
export function logInfo(message: string, data?: any) {
  logger.info(message, data);
}
