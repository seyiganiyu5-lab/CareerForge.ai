'use client';

import { useTranslations } from '@/i18n/provider';
import { FilePlus, Mail, Download, Pencil, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIVITIES = [
  { key: 'createdResume', icon: FilePlus, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', time: '2 hours ago', values: { name: 'Software Engineer Resume' } },
  { key: 'generatedCoverLetter', icon: Mail, color: 'bg-violet/10 text-violet', time: '1 day ago', values: { company: 'Google' } },
  { key: 'downloadedPdf', icon: Download, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', time: '3 days ago', values: { name: 'Product Manager CV' } },
  { key: 'updatedResume', icon: Pencil, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', time: '5 days ago', values: { name: 'Data Analyst CV' } },
  { key: 'submittedApplication', icon: Send, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', time: '1 week ago', values: { company: 'Meta' } },
];

export default function ActivityTimeline() {
  const t = useTranslations('dashboard.activity');

  return (
    <section aria-label={t('title')}>
      <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
        {t('title')}
      </h2>
      <div
        className="rounded-xl border border-border/50 bg-card shadow-sm p-5 space-y-0 opacity-0 animate-[slideUpLg_0.5s_ease-out_0.3s_forwards]"
      >
        {ACTIVITIES.map((activity, i) => {
          const Icon = activity.icon;
          const isLast = i === ACTIVITIES.length - 1;
          return (
            <div key={activity.key + i} className="flex gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0', activity.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-border/50 my-1.5 min-h-[16px]" />
                )}
              </div>
              {/* Content */}
              <div className={cn('pb-4', isLast && 'pb-0')}>
                <p className="text-sm font-body text-foreground leading-snug">
                  {t(activity.key, activity.values)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-body">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}