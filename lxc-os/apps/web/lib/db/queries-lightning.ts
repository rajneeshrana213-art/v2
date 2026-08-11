/**
 * COMPREHENSIVE DATABASE QUERY OPTIMIZATION
 *
 * This file contains ultra-optimized database operations pool
 * Replaces slow queries with lightning-fast alternatives
 * Uses batching, caching, and query optimization
 *
 * Target: Sub-100ms response times for all queries
 */

import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { Role } from "@prisma/client";

// Initialize Redis for distributed caching (optional but recommended)
const redis = process.env.REDIS_URL
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    })
  : null;

const CACHE_KEYS = {
  SCHOOL: (id: string) => `school:${id}`,
  SCHOOLS_ALL: "schools:all",
  SCHOOLS_ACTIVE: "schools:active",
  SUBSCRIPTION: (schoolId: string) => `sub:${schoolId}`,
  USER_COUNT: (schoolId: string) => `users:count:${schoolId}`,
  GLOBAL_SETTINGS: (group: string) => `settings:${group}`,
  PLANS: "plans:all",
  SCHOOL_CONFIG: (schoolId: string) => `config:${schoolId}`,
};

const TTL = {
  SHORT: 300, // 5 minutes - for frequently changing data
  MEDIUM: 1800, // 30 minutes - for moderately changing data
  LONG: 3600, // 1 hour - for stable data
};

// ==================== CACHE UTILITIES ====================

async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return (await redis.get(key)) as T | null;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, value: T, ttl: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Cache failure should not break the application
  }
}

async function invalidateCache(patterns: string[]): Promise<void> {
  if (!redis) return;
  try {
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch {
    // Ignore cache errors
  }
}

// ==================== SCHOOL QUERIES ====================

/**
 * Ultra-fast school list with pagination
 * Optimizations:
 * - Select only needed fields
 * - Use indexed columns for filtering
 * - Batch user count queries
 * - Cache results
 */
export async function getSchoolsLightning(
  page: number = 1,
  limit: number = 20,
  search?: string,
  filters?: { isActive?: boolean; isDeleted?: boolean },
) {
  const cacheKey = `schools:page:${page}:${limit}:${search || "all"}:${JSON.stringify(filters || {})}`;

  // Check cache first
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  // Build where clause efficiently
  const where: any = {
    isDeleted: filters?.isDeleted ?? false,
    isActive: filters?.isActive ?? true,
  };

  if (search) {
    where.OR = [
      { schoolName: { contains: search, mode: "insensitive" } },
      { schoolCode: { contains: search, mode: "insensitive" } },
    ];
  }

  // Single optimized query with select
  const [schools, total] = await Promise.all([
    prisma.school.findMany({
      where,
      select: {
        id: true,
        schoolName: true,
        schoolCode: true,
        schoolLogo: true,
        isActive: true,
        userId: true,
        subscriptionConfig: {
          select: {
            allowedUsers: true,
            bonusUsers: true,
            planModel: true,
            gracePeriodDays: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.school.count({ where }),
  ]);

  // Batch fetch all user counts in ONE query
  const schoolIds = schools.map((s) => s.id);
  const userCounts = await prisma.user.groupBy({
    by: ["schoolId"],
    where: {
      schoolId: { in: schoolIds },
      isDeleted: false,
      role: {
        in: [
          "student",
          "teacher",
          "driver",
          "parent",
          "admin",
          "account",
          "hostel",
          "transport",
          "staff",
          "academics",
        ] as Role[],
      },
    },
    _count: { id: true },
  });

  const countMap = new Map(userCounts.map((r) => [r.schoolId, r._count.id]));

  const result = {
    data: schools.map((s) => ({
      ...s,
      currentUsers: countMap.get(s.id) || 0,
    })),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };

  // Cache for 5 minutes
  await setCache(cacheKey, result, TTL.SHORT);
  return result;
}

/**
 * Get single school with all related data (optimized)
 */
export async function getSchoolDetail(schoolId: string) {
  const cacheKey = CACHE_KEYS.SCHOOL(schoolId);
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const [
    school,
    userCount,
    subscriptionConfig,
    activeSubscription,
    userCountByRole,
  ] = await Promise.all([
    prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        schoolName: true,
        schoolCode: true,
        schoolLogo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    // Get total user count
    prisma.user.count({
      where: {
        schoolId,
        isDeleted: false,
        role: {
          in: [
            "student",
            "teacher",
            "driver",
            "parent",
            "admin",
            "account",
            "hostel",
            "transport",
            "staff",
            "academics",
          ] as Role[],
        },
      },
    }),
    prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
      select: {
        allowedUsers: true,
        bonusUsers: true,
        planModel: true,
        gracePeriodDays: true,
        extraUserPrice: true,
      },
    }),
    prisma.subscription.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { endDate: "desc" },
      select: {
        id: true,
        status: true,
        endDate: true,
        startDate: true,
        planId: true,
      },
    }),
    // Get user count by role in one query
    prisma.user.groupBy({
      by: ["role"],
      where: {
        schoolId,
        isDeleted: false,
      },
      _count: { id: true },
    }),
  ]);

  if (!school) throw new Error("School not found");

  const result = {
    ...school,
    stats: {
      totalUsers: userCount,
      allowedUsers: subscriptionConfig?.allowedUsers || 0,
      bonusUsers: subscriptionConfig?.bonusUsers || 0,
      overageUsers: Math.max(
        0,
        userCount - (subscriptionConfig?.allowedUsers || 0),
      ),
      usersByRole: Object.fromEntries(
        userCountByRole.map((r) => [r.role, r._count.id]),
      ),
    },
    subscription: activeSubscription,
    config: subscriptionConfig,
  };

  await setCache(cacheKey, result, TTL.MEDIUM);
  return result;
}

// ==================== SUBSCRIPTION QUERIES ====================

/**
 * Get subscription status lightning-fast
 * Single batched query
 */
export async function getSubscriptionStatusLightning(schoolId: string) {
  const cacheKey = CACHE_KEYS.SUBSCRIPTION(schoolId);
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const [subscription, config] = await Promise.all([
    prisma.subscription.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { endDate: "desc" },
      select: {
        id: true,
        status: true,
        endDate: true,
        startDate: true,
        planId: true,
        plan: { select: { name: true, price: true } },
      },
    }),
    prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    }),
  ]);

  const result = {
    hasActiveSubscription: !!subscription && subscription.status === "ACTIVE",
    subscription,
    config,
  };

  await setCache(cacheKey, result, TTL.SHORT);
  return result;
}

/**
 * Batch fetch subscriptions for multiple schools
 * Eliminates N+1 queries
 */
export async function getSubscriptionsBatch(schoolIds: string[]) {
  if (schoolIds.length === 0) return [];

  const subscriptions = await prisma.subscription.findMany({
    where: {
      schoolId: { in: schoolIds },
      isActive: true,
      isDeleted: false,
    },
    orderBy: { endDate: "desc" },
    select: {
      schoolId: true,
      id: true,
      status: true,
      endDate: true,
      startDate: true,
      planId: true,
    },
  });

  // Group by schoolId
  const map = new Map<string, (typeof subscriptions)[0]>();
  for (const sub of subscriptions) {
    if (sub.schoolId && !map.has(sub.schoolId)) {
      map.set(sub.schoolId, sub);
    }
  }

  return map;
}

// ==================== USER QUERIES ====================

/**
 * Get user count for school (cached)
 */
export async function getUserCountLightning(schoolId: string) {
  const cacheKey = CACHE_KEYS.USER_COUNT(schoolId);
  const cached = await getCache<number>(cacheKey);
  if (cached !== null) return cached;

  const count = await prisma.user.count({
    where: {
      schoolId,
      isDeleted: false,
      role: {
        in: [
          "student",
          "teacher",
          "driver",
          "parent",
          "admin",
          "account",
          "hostel",
          "transport",
          "staff",
          "academics",
        ] as Role[],
      },
    },
  });

  await setCache(cacheKey, count, TTL.SHORT);
  return count;
}

/**
 * Batch get user counts for multiple schools
 */
export async function getUserCountsBatch(schoolIds: string[]) {
  if (schoolIds.length === 0) return new Map();

  const results = await prisma.user.groupBy({
    by: ["schoolId"],
    where: {
      schoolId: { in: schoolIds },
      isDeleted: false,
      role: {
        in: [
          "student",
          "teacher",
          "driver",
          "parent",
          "admin",
          "account",
          "hostel",
          "transport",
          "staff",
          "academics",
        ] as Role[],
      },
    },
    _count: { id: true },
  });

  return new Map(results.map((r) => [r.schoolId, r._count.id]));
}

// ==================== GLOBAL SETTINGS ====================

/**
 * Get global settings by group (cached)
 */
export async function getGlobalSettingsLightning(group: string) {
  const cacheKey = CACHE_KEYS.GLOBAL_SETTINGS(group);
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const settings = await prisma.globalSetting.findMany({
    where: { group },
    select: { key: true, value: true },
  });

  const result = Object.fromEntries(
    settings.map((s) => [s.key, tryParseJson(s.value)]),
  );

  await setCache(cacheKey, result, TTL.LONG);
  return result;
}

/**
 * Get single setting
 */
export async function getSettingLightning(key: string) {
  return prisma.globalSetting
    .findUnique({
      where: { key },
      select: { value: true },
    })
    .then((s) => (s?.value ? tryParseJson(s.value) : null));
}

// ==================== PLAN QUERIES ====================

/**
 * Get all plans (cached)
 */
export async function getPlanLightning(planId: string) {
  // Check cache for all plans
  let plans = await getCache<any[]>("plans:all:full");

  if (!plans) {
    plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        durationDays: true,
        userLimit: true,
      },
    });
    await setCache("plans:all:full", plans, TTL.LONG);
  }

  return plans.find((p) => p.id === planId);
}

/**
 * Get all plans (cached)
 */
export async function getAllPlansLightning() {
  let plans = await getCache<any[]>("plans:all:full");

  if (!plans) {
    plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        durationDays: true,
        userLimit: true,
      },
    });
    await setCache("plans:all:full", plans, TTL.LONG);
  }

  return plans;
}

// ==================== UTILITY FUNCTIONS ====================

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Invalidate relevant caches when data changes
 */
export async function invalidateSchoolCaches(schoolId?: string) {
  const patterns = [
    "schools:*",
    schoolId ? `school:${schoolId}` : null,
    schoolId ? `config:${schoolId}` : null,
    schoolId ? `sub:${schoolId}` : null,
    schoolId ? `users:count:${schoolId}` : null,
  ].filter(Boolean) as string[];

  await invalidateCache(patterns);
}

export async function invalidateSubscriptionCaches(schoolId?: string) {
  const patterns = ["schools:*", schoolId ? `sub:${schoolId}` : null].filter(
    Boolean,
  ) as string[];

  await invalidateCache(patterns);
}

export async function invalidateSettingsCaches(group?: string) {
  const patterns = [group ? `settings:${group}` : "settings:*"];

  await invalidateCache(patterns);
}

export async function invalidateAllCaches() {
  await invalidateCache(["*"]);
}
