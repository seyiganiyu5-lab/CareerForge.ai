'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';

/**
 * Shown on Free when some documents were created on Pro: they are kept,
 * just hidden until the user upgrades again.
 */
export function HiddenDocsNotice({ count, kind }: { count: number; kind: 'resumes' | 'coverLetters' }) {
  const t = useTranslations('app.billingUi');
  if (count <= 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-body">
      <Lock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <p className="text-muted-foreground">
        {t(kind === 'resumes' ? 'hiddenResumes' : 'hiddenCoverLetters', { count })}{' '}
        <Link href="/billing" className="font-medium text-brand hover:underline">
          {t('hiddenDocsUpgrade')}
        </Link>
      </p>
    </div>
  );
}
