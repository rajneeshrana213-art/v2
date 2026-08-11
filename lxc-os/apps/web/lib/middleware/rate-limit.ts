import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — swap for Redis (ioredis) in production for multi-instance safety.
// NOTE: the increment below is not atomic; a Redis INCR is required for true correctness
// under high concurrency across multiple Node.js instances.
const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  limit: 60,
  windowSeconds: 60,
};

/**
 * Returns the client identifier from the request.
 * Prefers forwarded IP (behind proxies/load-balancers) then socket address.
 */
function getClientKey(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Rate-limiting middleware for Next.js API routes.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/middleware/rate-limit';
 *
 *   export default async function handler(req, res) {
 *     if (!rateLimit(req, res)) return;   // 429 already sent
 *     // ... your logic
 *   }
 *
 * Or wrap a handler:
 *   export default withRateLimit(handler, { limit: 30, windowSeconds: 60 });
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions = DEFAULT_OPTIONS
): boolean {
  const { limit, windowSeconds } = options;
  const key = `${getClientKey(req)}|${req.url ?? ''}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
  } else {
    entry.count += 1;
  }

  const remaining = Math.max(0, limit - entry.count);
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

  if (entry.count > limit) {
    res.setHeader('Retry-After', windowSeconds);
    res.status(429).json({ error: 'Too Many Requests — please slow down.' });
    return false;
  }

  return true;
}

/**
 * Higher-order wrapper that applies rate limiting before calling the handler.
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any,
  options: RateLimitOptions = DEFAULT_OPTIONS
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!rateLimit(req, res, options)) return;
    return handler(req, res);
  };
}
