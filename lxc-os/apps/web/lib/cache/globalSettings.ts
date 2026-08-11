// import { prisma } from './prisma';

import { prisma } from "../prisma";

interface CachedSettings {
  data: Record<string, any>;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CachedSettings>();

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getGlobalSettingsByGroup(group: string, forceRefresh?: boolean) {
  const cacheKey = `settings:${group}`;
  const now = Date.now();

  // Check if cache exists and is still valid
  if (cache.has(cacheKey) && !forceRefresh) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    // Cache expired, remove it
    cache.delete(cacheKey);
  }

  // Fetch from database
  const settings = await prisma.globalSetting.findMany({
    where: { group },
  });

  // Convert array to object for easier access
  const settingsObj = settings.reduce(
    (acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  // Cache the result
  cache.set(cacheKey, {
    data: settingsObj,
    timestamp: now,
    ttl: DEFAULT_CACHE_TTL,
  });

  return settingsObj;
}

export async function getAllGlobalSettings(forceRefresh?: boolean) {
  const cacheKey = "settings:all";
  const now = Date.now();

  // Check cache
  if (cache.has(cacheKey) && !forceRefresh) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  // Fetch from database
  const settings = await prisma.globalSetting.findMany();
  const settingsObj = settings.reduce(
    (acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  cache.set(cacheKey, {
    data: settingsObj,
    timestamp: now,
    ttl: DEFAULT_CACHE_TTL,
  });

  return settingsObj;
}

export function invalidateGlobalSettingsCache(group?: string) {
  if (group) {
    cache.delete(`settings:${group}`);
  } else {
    // Clear all settings-related caches
    cache.delete("settings:all");
    for (const key of cache.keys()) {
      if (key.startsWith("settings:")) {
        cache.delete(key);
      }
    }
  }
}

export function setGlobalSettingsCacheTTL(ttl: number) {
  return () => {
    // Update all existing cache entries' TTL
    for (const [key, value] of cache.entries()) {
      if (key.startsWith("settings:")) {
        value.ttl = ttl;
      }
    }
  };
}
