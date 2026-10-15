'use client';

import { useTranslations } from '@/i18n/provider';
import { useUsage } from '@/lib/usage/context';
import { cn } from '@/lib/utils';

/** True when the user's plan doesn't include this feature (false while the plan is loading). */
export function useFeatureLocked(featureKey: string) {
  const { data } = useUsage();
  return data?.usage[featureKey]?.enabled === false;
}

/** Small "Pro" tag shown next to features that need the Pro plan. */
export function ProBadge({ className }: { className?: string }) {
  const tc = useTranslations('app.common');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-brand font-body',
        className,
      )}
    >
      {tc('pro')}
    </span>
  );
}
