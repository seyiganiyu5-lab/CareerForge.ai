'use client';

import { useTranslations } from '@/i18n/provider';
import { Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TIPS = ['tip1', 'tip2', 'tip3'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Resume Tips': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Cover Letter': 'bg-violet/10 text-violet',
  'Interview': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Conseils CV': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Lettre de Motivation': 'bg-violet/10 text-violet',
  'Entretien': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function CareerTips() {
  const t = useTranslations('dashboard.careerTips');

  return (
    <section aria-label={t('title')}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-foreground">
          {t('title')}
        </h2>
        <button className="text-xs font-medium text-brand hover:text-brand/80 font-body transition-colors inline-flex items-center gap-1 group">
          {t('viewAll')}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIPS.map((tip, i) => {
          const category = t(`${tip}.category`);
          const readingTime = t(`${tip}.readingTime`);
          return (
            <article
              key={tip}
              style={{ animationDelay: `${600 + i * 80}ms`, animationFillMode: 'both' }}
              className="group rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-0 animate-[slideUp_0.4s_ease-out_forwards]"
            >
              {/* Image placeholder */}
              <div className="h-32 bg-gradient-to-br from-muted to-muted/50 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              </div>
              <div className="p-4">
                <Badge variant="secondary" className={CATEGORY_COLORS[category] || 'bg-muted text-muted-foreground text-[11px] font-medium font-body border-0 mb-2'}>
                  {category}
                </Badge>
                <h3 className="text-sm font-semibold font-heading text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                  {t(`${tip}.title`)}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                    <Clock className="w-3 h-3" />
                    {readingTime} {t('minRead')}
                  </span>
                  <span className="text-xs font-medium text-brand font-body group-hover:underline">
                    {t('readMore')}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}