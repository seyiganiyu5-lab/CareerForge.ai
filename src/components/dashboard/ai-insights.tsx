'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/provider';
import { Sparkles, ArrowRight } from 'lucide-react';

const INSIGHT_KEYS = ['insight1', 'insight2', 'insight3'] as const;

export default function AIInsights() {
  const t = useTranslations('dashboard.aiInsights');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % INSIGHT_KEYS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
            {t(INSIGHT_KEYS[index])}
          </p>
          <div className="flex items-center justify-between">
            {/* Dots indicator */}
            <div className="flex items-center gap-1.5">
              {INSIGHT_KEYS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === index ? 'bg-brand w-4' : 'bg-border'
                  }`}
                  aria-label={`Insight ${i + 1}`}
                />
              ))}
            </div>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80 font-body transition-colors group">
              {t('improveNow')}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}