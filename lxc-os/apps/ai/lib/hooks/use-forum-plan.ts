'use client';

import { useEffect, useState, useCallback } from 'react';
import { type PlanKey, planIncludes, MODULE_MIN_PLAN } from '@/lib/lxc/module-access';
import { lxcWebUrl } from '@/lib/lxc-api-base';

const CACHE_KEY = 'lxc_forum_plan_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
type EducationLevel = 'school' | 'college' | 'competitive';

interface PlanCache {
  planKey: PlanKey;
  endDate: string | null;
  billingCycle: string | null;
  educationLevel: EducationLevel | null;
  recommendedPlanKey: PlanKey;
  isAutoRenew: boolean;
  fetchedAt: number;
}

export interface ForumPlanState {
  planKey: PlanKey;
  isLoading: boolean;
  isActive: boolean;
  endDate: Date | null;
  billingCycle: string | null;
  planName: string | null;
  educationLevel: EducationLevel | null;
  recommendedPlanKey: PlanKey;
  isAutoRenew: boolean;
  billingHistory: any[];
  /** Check if a module is accessible under the current plan */
  hasAccess: (moduleKey: string) => boolean;
  /** Force a refresh (e.g. after payment) */
  refresh: () => Promise<void>;
}

/**
 * useForumPlan
 *
 * Fetches and caches the logged-in forum user's current plan from the DB.
 * - Caches in localStorage for 5 minutes to avoid excessive API calls
 * - Re-fetches on window focus (to detect cross-tab payments)
 * - Exposes `hasAccess(moduleKey)` for module-level gating
 */
export function useForumPlan(): ForumPlanState {
  const [planKey, setPlanKey] = useState<PlanKey>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [billingCycle, setBillingCycle] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);
  const [recommendedPlanKey, setRecommendedPlanKey] = useState<PlanKey>('ignite');
  const [isAutoRenew, setIsAutoRenew] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  const fetchPlan = useCallback(async (force = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('@lxc_ai_token') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: PlanCache = JSON.parse(cached);
          if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
            setPlanKey(parsed.planKey);
            setEndDate(parsed.endDate ? new Date(parsed.endDate) : null);
            setBillingCycle(parsed.billingCycle);
            setEducationLevel(parsed.educationLevel);
            setRecommendedPlanKey(parsed.recommendedPlanKey);
            setIsAutoRenew(parsed.isAutoRenew);
            setIsActive(parsed.planKey === 'lifetime' || (!!parsed.endDate && new Date(parsed.endDate) > new Date()));
            setIsLoading(false);
            return;
          }
        }
      } catch {/* ignore cache errors */}
    }

    try {
      const res = await fetch(lxcWebUrl('/api/v1/forum/subscription/plan'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const key = (data.planKey || 'free') as PlanKey;
      const end = data.endDate ? new Date(data.endDate) : null;
      const nextEducationLevel = (data.educationLevel ?? null) as EducationLevel | null;
      const nextRecommendedPlan = (data.recommendedPlanKey || 'ignite') as PlanKey;
      const nextIsAutoRenew = Boolean(data.isAutoRenew);

      // Lifetime plan is always active; show endDate as null (never expires)
      const isLifetime = key === 'lifetime';
      const active = isLifetime ? true : (data.isActive && end ? end > new Date() : false);
      const displayEnd = isLifetime ? null : end; // Don't show the 100-year date

      setPlanKey(key);
      setIsActive(active);
      setEndDate(displayEnd);
      setBillingCycle(isLifetime ? 'lifetime' : (data.billingCycle ?? null));
      setPlanName(data.planName ?? null);
      setEducationLevel(nextEducationLevel);
      setRecommendedPlanKey(nextRecommendedPlan);
      setIsAutoRenew(nextIsAutoRenew);
      setBillingHistory(data.billingHistory ?? []);

      // Cache the result
      try {
        const cache: PlanCache = {
          planKey: key,
          endDate: end?.toISOString() ?? null,
          billingCycle: data.billingCycle ?? null,
          educationLevel: nextEducationLevel,
          recommendedPlanKey: nextRecommendedPlan,
          isAutoRenew: nextIsAutoRenew,
          fetchedAt: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {/* ignore */}
    } catch {
      // Network error — keep previous state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Re-fetch on tab focus (detect cross-tab payment completion)
  useEffect(() => {
    const onFocus = () => fetchPlan(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchPlan]);

  const hasAccess = useCallback(
    (moduleKey: string): boolean => {
      const required = MODULE_MIN_PLAN[moduleKey] ?? 'apex';
      return planIncludes(planKey, required);
    },
    [planKey]
  );

  const refresh = useCallback(async () => {
    // Clear cache so next fetch goes to server
    try { localStorage.removeItem(CACHE_KEY); } catch {/* */}
    await fetchPlan(true);
  }, [fetchPlan]);

  return {
    planKey,
    isLoading,
    isActive,
    endDate,
    billingCycle,
    planName,
    educationLevel,
    recommendedPlanKey,
    isAutoRenew,
    billingHistory,
    hasAccess,
    refresh,
  };
}
