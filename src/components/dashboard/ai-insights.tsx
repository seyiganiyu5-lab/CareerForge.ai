'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/provider';
import { useUsage } from '@/lib/usage/context';
import { Sparkles, ArrowRight } from 'lucide-react';

type Tip = { key: string; href: string };

const GENERAL_TIPS: Tip[] = [
  { key: 'tipAchievements', href: '/resume-builder' },
  { key: 'tipKeywords', href: '/ats-checker' },
  { key: 'tipTailor', href: '/cover-letters' },
];

/** Tips based on what the user has done so far, then general advice. */
export default function AIInsights() {
  const t = useTranslations('dashboard.aiInsights');
  const { data } = useUsage();
  const [index, setIndex] = useState(0);

  const tips = useMemo(() => {
    const raw = data?.raw;
    const personal: Tip[] = [];
    if (raw && raw.resume_count === 0) personal.push({ key: 'tipFirstResume', href: '/resume-builder' });
    if (raw && raw.cover_letter_count === 0) personal.push({ key: 'tipFirstCoverLetter', href: '/cover-letters' });
    if (raw && raw.ats_checks === 0) personal.push({ key: 'tipFirstAtsCheck', href: '/ats-checker' });
    return [...personal, ...GENERAL_TIPS];
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const tip = tips[index % tips.length];

  return (
    <section
      className="rounded-xl border border-border/50 border-l-4 border-l-brand bg-card shadow-sm p-5 md:p-6 opacity-0 animate-[slideUpLg_0.5s_ease-out_0.35s_forwards]"
      aria-label={t('title')}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold font-heading text-foreground mb-2">
            {t('title')}
          </h2>
          <p
            key={index}
            className="text-sm text-muted-foreground font-body leading-relaxed mb-4 animate-[slideInRight_0.4s_ease-out_forwards]"
          >
            {t(tip.key)}
          </p>
          <div className="flex items-center justify-between">
            {/* Dots indicator */}
            <div className="flex items-center gap-1.5">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === index % tips.length ? 'bg-brand w-4' : 'bg-border'
                  }`}
                  aria-label={`Tip ${i + 1}`}
                />
              ))}
            </div>
            <Link
              href={tip.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80 font-body transition-colors group"
            >
              {t('improveNow')}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}