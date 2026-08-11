/**
 * Redis-backed cache utility
 */
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

class RedisCache {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    this.redis.on("error", (err) => {
      console.error("[PERF][CACHE] Redis error:", err);
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[PERF][CACHE] Get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (time to live) in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redis.set(key, data, "EX", ttlSeconds);
    } catch (error) {
      console.error(`[PERF][CACHE] Set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`[PERF][CACHE] Delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error("[PERF][CACHE] Clear error:", error);
    }
  }
}

// Singleton instance
export const cache = new RedisCache();
