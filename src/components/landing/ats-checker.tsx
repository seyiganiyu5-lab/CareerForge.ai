'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import {
  Lightbulb,
  ArrowRight,
  FileText,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function ScoreCircleWithT({ score, t }: { score: number; t: (key: string) => string }) {
  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
        />
        {/* Progress circle */}
        <motion.circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="url(#atsScoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="atsScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-heading text-4xl md:text-5xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-body mt-0.5">
          {t('atsScore')}
        </span>
        <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-semibold font-body">
          {t('excellent')}
        </span>
      </div>
    </div>
  );
}

const tipsKeys = ['tip1', 'tip2', 'tip3', 'tip4'] as const;

export default function AtsChecker() {
  const t = useTranslations('atsChecker');
  const tm = useTranslations('atsChecker.metrics');

  const metrics = [
    {
      icon: FileText,
      label: tm('formatting'),
      status: tm('excellent'),
      statusColor: 'text-emerald',
      dotColor: 'bg-emerald',
      progress: 95,
      progressColor: 'bg-emerald',
    },
    {
      icon: Search,
      label: tm('keywordMatch'),
      status: tm('good'),
      statusColor: 'text-brand',
      dotColor: 'bg-brand',
      progress: 78,
      progressColor: 'bg-brand',
    },
    {
      icon: AlertTriangle,
      label: tm('missingSkills'),
      status: tm('needsWork'),
      statusColor: 'text-amber-500',
      dotColor: 'bg-amber-500',
      indicator: '3 missing',
    },
  ];

  return (
    <section id="ats-checker" className="relative py-20 md:py-28 bg-background grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body shadow-lg shadow-brand/20">
            {t('badge')}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mt-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg leading-relaxed font-body">
            {t('description')}
          </p>
        </motion.div>

        {/* Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl"
        >
          <div className="md:grid md:grid-cols-2 gap-8">
            {/* Left — ATS Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <ScoreCircleWithT score={92} t={tm} />
              <p className="text-center text-sm text-muted-foreground font-body mt-4 max-w-[200px]">
                {t('description')}
              </p>
            </div>

            {/* Right — Metrics */}
            <div className="flex flex-col justify-center space-y-5 mt-8 md:mt-0">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground font-body truncate">
                        {metric.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {metric.indicator ? (
                        <span className="text-xs font-semibold text-amber-500 font-body bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {metric.indicator}
                        </span>
                      ) : (
                        <div className="w-24">
                          <Progress
                            value={metric.progress}
                            className="h-1.5"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${metric.dotColor}`} />
                        <span className={`text-xs font-semibold ${metric.statusColor} font-body`}>
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-8 rounded-xl border border-border bg-secondary/50 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="font-heading font-semibold text-sm text-foreground">
                {tm('suggestions')}
              </h4>
            </div>
            <ul className="space-y-3">
              {tipsKeys.map((key, index) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <ArrowRight className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground font-body leading-relaxed">
                    {tm(key)}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}