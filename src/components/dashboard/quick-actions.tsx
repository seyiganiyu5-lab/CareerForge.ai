'use client';

import { useTranslations } from '@/i18n/provider';
import { FilePlus, MailPlus, Sparkles, PlusCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { key: 'createResume', icon: FilePlus, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', href: '/resume-builder' },
  { key: 'createCoverLetter', icon: MailPlus, color: 'bg-violet/10 text-violet', href: '/cover-letters' },
  { key: 'reviewResume', icon: Sparkles, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', href: '/resume-review' },
  { key: 'trackApplication', icon: PlusCircle, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', href: '/job-tracker' },
] as const;

export default function QuickActions() {
  const t = useTranslations('dashboard.quickActions');

  return (
    <section aria-label={t('title')}>
      <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <a
              key={action.key}
              href={action.href}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-[3px] transition-all duration-200 cursor-pointer opacity-0 animate-[slideUp_0.4s_ease-out_forwards]"
            >
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl shrink-0', action.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold font-heading text-foreground group-hover:text-brand transition-colors">
                  {t(`${action.key}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                  {t(`${action.key}.description`)}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all mt-1 shrink-0" />
            </a>
          );
        })}
      </div>
    </section>
  );
}