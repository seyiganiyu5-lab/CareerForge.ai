'use client';

import { useCallback } from 'react';
import { useTranslations } from '@/i18n/provider';

// Message keys for each status (dashboard.jobTracker.status*)
const STATUS_KEYS: Record<string, string> = {
  wishlist: 'statusWishlist',
  applied: 'statusApplied',
  viewed: 'statusViewed',
  assessment: 'statusAssessment',
  interview: 'statusInterview',
  final_interview: 'statusFinalInterview',
  offer: 'statusOffer',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  withdrawn: 'statusWithdrawn',
};

/** Translated labels for job statuses, work modes and employment types. */
export function useJobLabels() {
  const t = useTranslations('dashboard.jobTracker');

  const status = useCallback(
    (key: string, fallback?: string) => (STATUS_KEYS[key] ? t(STATUS_KEYS[key]) : fallback ?? key),
    [t]
  );

  // Stored values stay in English (e.g. "On-site"); only the label is translated
  const option = useCallback(
    (prefix: 'wm' | 'et', value: string) => {
      const key = `${prefix}_${value.toLowerCase().replace(/[^a-z]/g, '')}`;
      return t.has(key) ? t(key) : value;
    },
    [t]
  );

  return {
    status,
    workMode: (value: string) => option('wm', value),
    employmentType: (value: string) => option('et', value),
  };
}
