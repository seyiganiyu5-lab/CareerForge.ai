'use client';

import { useCallback } from 'react';
import { useLocale, useTranslations } from '@/i18n/provider';

/** "Just now", "5m ago", "3d ago", or a short date — in the current language. */
export function useRelativeTime() {
  const tc = useTranslations('app.common');
  const { locale } = useLocale();

  return useCallback(
    (dateStr: string) => {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMs / 3600000);
      const days = Math.floor(diffMs / 86400000);
      if (mins < 1) return tc('justNow');
      if (mins < 60) return tc('minutesAgo', { count: mins });
      if (hours < 24) return tc('hoursAgo', { count: hours });
      if (days < 7) return tc('daysAgo', { count: days });
      return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    [tc, locale]
  );
}
