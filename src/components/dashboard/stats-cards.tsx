'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/i18n/provider';
import { FileText, Mail, ShieldCheck, Briefcase, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATS = [
  { key: 'totalResumes', value: 12, icon: FileText, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  { key: 'coverLetters', value: 8, icon: Mail, color: 'text-violet', bg: 'bg-violet/10' },
  { key: 'avgAtsScore', value: 87, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', suffix: '%' },
  { key: 'applicationsTracked', value: 24, icon: Briefcase, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'downloads', value: 15, icon: Download, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
] as const;

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const observedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || observedRef.current) return;
    observedRef.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let start = 0;
        const duration = 1200;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.floor(eased * value));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(value);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { once: true }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsCards() {
  const t = useTranslations('dashboard.stats');

  return (
    <section aria-label={t('title')}>
      <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
        {t('title')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              className="rounded-xl border border-border/50 bg-card p-5 shadow-sm opacity-0 animate-[slideUp_0.4s_ease-out_forwards]"
            >
              <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg mb-3', stat.bg)}>
                <Icon className={cn('w-4.5 h-4.5', stat.color)} />
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-body">
                {t(stat.key)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}