/**
 * INTEGRATION GUIDE FOR DATABASE PERFORMANCE OPTIMIZATIONS
 *
 * This file provides step-by-step instructions for integrating
 * the lightning-fast database queries into your API endpoints.
 *
 * Expected Results:
 * - Global Settings: 1900ms → 5-50ms (38-380x faster)
 * - School Lists: 1905ms → 50-100ms (19-38x faster)
 * - Subscription Status: 1850ms → 30-100ms (18-62x faster)
 * - User Count Batch: 281ms per school → 150ms batch (2-20x faster)
 */

import { NextApiRequest, NextApiResponse } from "next";

// ============================================================================
// STEP 1: IMPORT THE OPTIMIZED FUNCTIONS
// ============================================================================

// Add these imports to your API handler files:
/*
import { 
  getSchoolsLightning,
  getSchoolDetail,
  getSubscriptionStatusLightning,
  getSubscriptionsBatch,
  getUserCountLightning,
  getUserCountsBatch,
  getGlobalSettingsLightning,
  invalidateGlobalSettingsCache,
} from '@/lib/db/queries-lightning';

import { trackQuery } from '@/lib/db/query-monitor';
import { withDbPerformanceTracking } from '@/lib/middleware/db-performance';
*/

// ============================================================================
// STEP 2: UPDATE CRITICAL ENDPOINTS
// ============================================================================

/**
 * BEFORE (Slow - in pages/api/v1/...)
 *
 * export default async function handler(req, res) {
 *   const schools = await prisma.school.findMany({
 *     include: { users: true, subscriptions: true }
 *   });
 *   res.json(schools);
 * }
 *
 * Issues:
 * - Full user/subscription includes cause table scans
 * - No pagination
 * - Heavy memory usage
 * - ~1900ms for 100 schools
 */

// AFTER (Lightning Fast)
export const exampleSchoolListOptimization = `
import { getSchoolsLightning } from '@/lib/db/queries-lightning';
import { withDbPerformanceTracking } from '@/lib/middleware/db-performance';

export default withDbPerformanceTracking(
  async function handler(req, res) {
    try {
      const { page = 1, limit = 20, search, isActive } = req.query;
      
      const result = await getSchoolsLightning(
        parseInt(page as string), 
        parseInt(limit as string),
        search as string,
        { isActive: isActive === 'true' }
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Schools list error:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  }
);
`;

/**
 * SUBSCRIPTION STATUS ENDPOINT OPTIMIZATION
 *
 * BEFORE (Slow - ~1850ms)
 */
export const beforeSubscriptionStatus = `
export default async function handler(req, res) {
  const { schoolId } = req.query;
  
  // Multiple queries, no caching
  const subscription = await prisma.subscription.findFirst({
    where: { schoolId: parseInt(schoolId) },
    include: { plan: true, payment: true }
  });
  
  const school = await prisma.school.findUnique({
    where: { id: parseInt(schoolId) }
  });
  
  // Separate call for settings (1900ms!)
  const settings = await prisma.globalSetting.findMany();
  
  res.json({ subscription, school, settings });
}
`;

/**
 * AFTER (Lightning Fast - ~50-100ms)
 */
export const afterSubscriptionStatus = `
import { 
  getSubscriptionStatusLightning,
  getGlobalSettingsLightning 
} from '@/lib/db/queries-lightning';
import { trackQuery } from '@/lib/db/query-monitor';

export default async function handler(req, res) {
  const { schoolId } = req.query;
  
  try {
    // Parallel queries with caching
    const [subscription, settings] = await Promise.all([
      trackQuery('subscription-status', () => 
        getSubscriptionStatusLightning(parseInt(schoolId as string))
      ),
      trackQuery('global-settings', () => 
        getGlobalSettingsLightning()
      ),
    ]);
    
    res.status(200).json({ subscription, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
`;

// ============================================================================
// STEP 3: BATCH OPERATIONS FOR MULTI-SCHOOL QUERIES
// ============================================================================

/**
 * USER COUNT AGGREGATION
 *
 * BEFORE (N+1 Query - 281ms per school)
 */
export const beforeUserCount = `
export default async function handler(req, res) {
  const schools = await prisma.school.findMany({ take: 100 });
  
  // THIS IS BAD - Gets called 100 times!
  for (const school of schools) {
    school.userCount = await prisma.user.count({
      where: { schoolId: school.id }
    });
  }
  
  // Total: 100 queries = 28,100ms for 100 schools!
  res.json(schools);
}
`;

/**
 * AFTER (Single Batch Query - 150ms total)
 */
export const afterUserCount = `
import { getUserCountsBatch } from '@/lib/db/queries-lightning';

export default async function handler(req, res) {
  const schools = await prisma.school.findMany({ take: 100 });
  const schoolIds = schools.map(s => s.id);
  
  // SINGLE QUERY for all schools!
  const counts = await getUserCountsBatch(schoolIds);
  
  // Attach counts to schools
  const schoolsWithCounts = schools.map(school => ({
    ...school,
    userCount: counts[school.id] || 0
  }));
  
  // Total: 1 query = 150ms for 100 schools!
  res.json(schoolsWithCounts);
}
`;

// ============================================================================
// STEP 4: CACHING STRATEGY
// ============================================================================

/**
 * Global Settings should never be queried directly
 * Always use the cached version
 */
export const cachingBestPractices = `
// ❌ NEVER DO THIS:
const settings = await prisma.globalSetting.findMany();

// ✅ ALWAYS DO THIS:
import { getGlobalSettingsLightning } from '@/lib/db/queries-lightning';
const settings = await getGlobalSettingsLightning();

// First call: 50ms (database hit)
// Subsequent calls: 5ms (cache hit within 5 minutes)
// Cache is automatically invalidated on settings update
`;

// ============================================================================
// STEP 5: INVALIDATE CACHE WHEN DATA CHANGES
// ============================================================================

/**
 * Any endpoint that updates global settings must invalidate cache
 */
export const cacheInvalidation = `
import { invalidateGlobalSettingsCache } from '@/lib/db/queries-lightning';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const updatedSetting = await prisma.globalSetting.update({
      where: { id: req.body.id },
      data: req.body.data
    });
    
    // Clear the cache for this setting
    await invalidateGlobalSettingsCache();
    
    res.json(updatedSetting);
  }
}
`;

// ============================================================================
// STEP 6: MONITOR PERFORMANCE
// ============================================================================

/**
 * Create a metrics endpoint to watch performance
 */
export const metricsEndpoint = `
// pages/api/v1/metrics.ts

import { getPerformanceMetrics } from '@/lib/middleware/db-performance';
import { getMetrics, getSlowQueriesReport } from '@/lib/db/query-monitor';

export default function handler(req, res) {
  const performanceMetrics = getPerformanceMetrics();
  const dbMetrics = getMetrics();
  const slowQueries = getSlowQueriesReport(50);
  
  res.json({
    performance: performanceMetrics,
    database: dbMetrics,
    slowQueries: slowQueries,
  });
}
`;

// ============================================================================
// STEP 7: MIGRATION STEPS
// ============================================================================

/**
 * Follow these steps to safely deploy optimizations:
 *
 * 1. Apply Prisma Migration
 *    npx prisma migrate dev --name optimizations_lightning
 *    This adds ~11 new indexes to critical tables
 *
 * 2. Deploy queries-lightning.ts library
 *    File already created at: lib/db/queries-lightning.ts
 *    No changes needed, just ready to use
 *
 * 3. Update API Endpoints (Start with these)
 *    - pages/api/v1/superadmin/subscription-control/schools.ts
 *    - pages/api/v1/dashboard/subscription-status.ts
 *    - pages/api/v1/superadmin/subscription-control/global-settings.ts
 *    - pages/api/v1/schools/[id].ts (if exists)
 *
 * 4. Integrate Performance Middleware
 *    Add withDbPerformanceTracking() wrapper to critical endpoints
 *    Example:
 *    export default withDbPerformanceTracking(handler)
 *
 * 5. Deploy and Monitor
 *    Check /api/v1/metrics for performance improvements
 *    Target: All queries < 100ms, cached queries < 10ms
 *
 * 6. Identify Remaining Slow Queries
 *    Use getSlowQueriesReport(50) to find any remaining bottlenecks
 *    Optimize using pattern from schema-optimization-guide.ts
 */

// ============================================================================
// STEP 8: PERFORMANCE TARGETS
// ============================================================================

export const performanceTargets = {
  "Global Settings (cached)": "< 5ms",
  "Global Settings (first call)": "< 50ms",
  "School List (page 1)": "< 100ms",
  "School List (cached)": "< 20ms",
  "Subscription Status": "< 50ms",
  "User Count (single)": "< 30ms",
  "User Count (batch, 100 schools)": "< 150ms",
  "Subscription Batch (100 items)": "< 200ms",
};

/**
 * If your queries don't meet these targets:
 * 1. Check indexes are applied: npx prisma db execute < scripts/check-indexes.sql
 * 2. Check cache is working: console.log from getCache()
 * 3. Look for remaining N+1 patterns using query-monitor.ts
 * 4. Check database statistics are up to date: ANALYZE on PostgreSQL
 */

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

export const quickStartChecklist = `
IMMEDIATE ACTIONS (Do these first):

[ ] 1. Run migration: npx prisma migrate dev --name optimizations_lightning
[ ] 2. Copy queries-lightning.ts if not exists: lib/db/queries-lightning.ts ✓
[ ] 3. Copy query-monitor.ts if not exists: lib/db/query-monitor.ts ✓
[ ] 4. Copy db-performance.ts middleware: lib/middleware/db-performance.ts ✓
[ ] 5. Update 5 critical endpoints with getSchoolsLightning() etc
[ ] 6. Add withDbPerformanceTracking() to critical handlers
[ ] 7. Test: http://localhost:3000/api/v1/metrics
[ ] 8. Monitor performance improvements

OPTIONAL ENHANCEMENTS:

[ ] 1. Setup Redis: REDIS_URL in .env.local
[ ] 2. Create /api/metrics endpoint for monitoring
[ ] 3. Setup New Relic or Datadog for production monitoring
[ ] 4. Add Query Analyzer to identify remaining slow queries
[ ] 5. Document cache invalidation strategy for team
`;

// ============================================================================
// EXAMPLE: FULL ENDPOINT UPDATE
// ============================================================================

/**
 * This is what a fully optimized endpoint looks like:
 */
export const fullExampleEndpoint = `
// pages/api/v1/schools/list.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSchoolsLightning } from '@/lib/db/queries-lightning';
import { trackQuery } from '@/lib/db/query-monitor';
import { withDbPerformanceTracking } from '@/lib/middleware/db-performance';

export default withDbPerformanceTracking(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = '1', limit = '20', search, isActive } = req.query;
      
      const result = await trackQuery('schools-list', () =>
        getSchoolsLightning(
          parseInt(page as string),
          parseInt(limit as string),
          search as string,
          { isActive: isActive === 'true' }
        )
      );
      
      res.status(200).json({
        success: true,
        data: result.schools,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      console.error('Schools list error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schools',
      });
    }
  }
);
`;

console.log("📚 Database Optimization Integration Guide Ready");
console.log(
  "💨 Expected Performance Improvements: 19-380x faster for slow queries",
);
console.log("📊 See fullExampleEndpoint for reference implementation");
