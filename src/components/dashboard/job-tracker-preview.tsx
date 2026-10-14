'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/provider';
import { Send, UserCheck, Trophy, XCircle, ArrowRight, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobStats {
  total: number;
  applied: number;
  offersReceived: number;
  accepted: number;
  rejected: number;
  byStatus?: Record<string, number>;
}

const STAT_STYLES = [
  { key: 'applied', icon: Send, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
  { key: 'interview', icon: UserCheck, color: 'text-violet', bg: 'bg-violet/10' },
  { key: 'offer', icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'rejected', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
] as const;

function statValue(key: (typeof STAT_STYLES)[number]['key'], stats: JobStats): number {
  switch (key) {
    case 'applied': return stats.applied;
    case 'interview': return (stats.byStatus?.interview ?? 0) + (stats.byStatus?.final_interview ?? 0);
    case 'offer': return stats.offersReceived + stats.accepted;
    case 'rejected': return stats.rejected;
  }
}

export default function JobTrackerPreview() {
  const t = useTranslations('dashboard.jobTracker');
  const [stats, setStats] = useState<JobStats | null>(null);

  useEffect(() => {
    fetch('/api/job-tracker/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <section aria-label={t('title')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-brand" />
          </div>
          <h2 className="text-lg font-semibold font-heading text-foreground">
            {t('title')}
          </h2>
        </div>
        <Link
          href="/job-tracker"
          className="text-xs font-medium text-brand hover:text-brand/80 font-body transition-colors inline-flex items-center gap-1 group"
        >
          {t('viewAll')}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div
        className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden opacity-0 animate-[slideUpLg_0.5s_ease-out_0.3s_forwards]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/50">
          {STAT_STYLES.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                style={{ animationDelay: `${350 + i * 60}ms`, animationFillMode: 'both' }}
                className="bg-card p-4 opacity-0 animate-[scaleIn_0.3s_ease-out_forwards]"
              >
                <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg mb-2', stat.bg)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {stats ? statValue(stat.key, stats) : <span className="inline-block w-6 h-6 rounded bg-muted animate-pulse align-middle" />}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">{t(stat.key)}</p>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-body">
            {t('totalApplications')}: <span className="font-medium text-foreground">{stats ? stats.total : '–'}</span>
          </p>
          <Link
            href="/job-tracker"
            className="text-xs font-medium text-brand hover:text-brand/80 font-body transition-colors inline-flex items-center gap-1 group"
          >
            Open Tracker
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
