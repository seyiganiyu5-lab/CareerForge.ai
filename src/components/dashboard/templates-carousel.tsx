'use client';

import { useRef } from 'react';
import { useTranslations } from '@/i18n/provider';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  { key: 'professional', accent: 'bg-teal-500' },
  { key: 'modern', accent: 'bg-violet' },
  { key: 'executive', accent: 'bg-amber-500' },
  { key: 'minimal', accent: 'bg-slate-500' },
  { key: 'creative', accent: 'bg-pink-500' },
  { key: 'atsFriendly', accent: 'bg-emerald-500' },
];

export default function TemplatesCarousel() {
  const t = useTranslations('dashboard.templates');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section aria-label={t('title')}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-foreground">
          {t('title')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => scroll('left')}
            aria-label="Previous templates"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => scroll('right')}
            aria-label="Next templates"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        className="relative opacity-0 animate-[slideUpLg_0.5s_ease-out_0.45s_forwards]"
      >
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TEMPLATES.map((template, i) => (
            <div
              key={template.key}
              style={{ animationDelay: `${500 + i * 60}ms`, animationFillMode: 'both' }}
              className="flex-none w-[180px] snap-start opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
            >
              <div className="group rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                {/* Template thumbnail mockup */}
                <div className="relative h-[120px] bg-muted/50 overflow-hidden">
                  <div className={cn('absolute top-0 left-0 right-0 h-1', template.accent)} />
                  <div className="p-4 space-y-2 opacity-60">
                    <div className="h-2 w-16 bg-foreground/20 rounded" />
                    <div className="h-1.5 w-full bg-foreground/10 rounded" />
                    <div className="h-1.5 w-3/4 bg-foreground/10 rounded" />
                    <div className="h-1.5 w-5/6 bg-foreground/10 rounded" />
                    <div className="h-1.5 w-2/3 bg-foreground/10 rounded" />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-background/90 rounded-lg px-3 py-1.5 shadow-sm font-body">
                      <Eye className="w-3.5 h-3.5" />
                      {t('preview')}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium font-body text-foreground">
                    {t(template.key)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}