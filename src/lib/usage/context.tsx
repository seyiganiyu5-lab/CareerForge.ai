'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import type { FeatureKey } from '@/lib/subscription/features';

interface UsageData {
  isPremium: boolean;
  planName: string;
  subscriptionStatus: string;
  usage: Record<string, { limit: number; used: number; enabled: boolean }>;
  raw: {
    resume_count: number;
    cover_letter_count: number;
    ai_requests: number;
    resume_reviews: number;
    exports_count: number;
    ats_checks: number;
    job_applications_count: number;
  };
}

interface UsageContextType {
  data: UsageData | null;
  isLoading: boolean;
  /** Check if user can access a feature. Uses cached data — no network request. */
  canAccess: (featureKey: FeatureKey) => boolean;
  /** Force refetch usage data from server */
  refetch: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType>({
  data: null,
  isLoading: true,
  canAccess: () => false,
  refetch: async () => {},
});

export function useUsage() {
  return useContext(UsageContext);
}

// Cache TTL: refreshed at most this often when moving between pages or
// coming back to the tab, so a plan change shows up quickly everywhere
const CACHE_TTL = 30 * 1000;

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchRef = useRef(0);
  const dataRef = useRef(data);

  // Keep ref in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const fetchUsage = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && dataRef.current && (now - lastFetchRef.current) < CACHE_TTL) {
      return;
    }

    try {
      // Only show loading the first time; later refreshes happen quietly
      if (!dataRef.current) setIsLoading(true);
      lastFetchRef.current = now;
      const res = await fetch('/api/usage/me', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();

      const newData: UsageData = {
        isPremium: !!json.isPremium,
        planName: json.plan?.name ?? 'free',
        subscriptionStatus: json.subscription?.status ?? 'active',
        usage: json.usage ?? {},
        raw: json.raw ?? {
          resume_count: 0,
          cover_letter_count: 0,
          ai_requests: 0,
          resume_reviews: 0,
          exports_count: 0,
          ats_checks: 0,
          job_applications_count: 0,
        },
      };
      setData(newData);
      dataRef.current = newData;
    } catch {
      // Silent fail — keep existing data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // Signed out (or a different account next time): forget the old plan
      setData(null);
      dataRef.current = null;
      setIsLoading(false);
      return;
    }
    fetchUsage();
  }, [fetchUsage, pathname, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const onVisible = () => { if (document.visibilityState === 'visible') fetchUsage(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchUsage, isAuthenticated]);

  const refetch = useCallback(() => fetchUsage(true), [fetchUsage]);

  const canAccess = useCallback((featureKey: FeatureKey): boolean => {
    const d = dataRef.current;
    if (!d) return false;
    const feature = d.usage[featureKey];
    if (!feature || !feature.enabled) return false;
    if (feature.limit === -1) return true; // unlimited
    return feature.used < feature.limit;
  }, []);

  return (
    <UsageContext.Provider value={{ data, isLoading, canAccess, refetch }}>
      {children}
    </UsageContext.Provider>
  );
}
