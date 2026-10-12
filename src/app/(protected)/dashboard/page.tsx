'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import {
  FileText,
  Mail,
  ShieldCheck,
  ListChecks,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const featureCards = [
  {
    key: 'resumeBuilder' as const,
    icon: FileText,
    gradient: 'from-brand/10 to-brand/5',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    borderColor: 'border-brand/20',
    accentColor: 'bg-brand',
  },
  {
    key: 'coverLetter' as const,
    icon: Mail,
    gradient: 'from-violet/10 to-violet/5',
    iconBg: 'bg-violet/10',
    iconColor: 'text-violet',
    borderColor: 'border-violet/20',
    accentColor: 'bg-violet',
  },
  {
    key: 'atsChecker' as const,
    icon: ShieldCheck,
    gradient: 'from-emerald/10 to-emerald/5',
    iconBg: 'bg-emerald/10',
    iconColor: 'text-emerald',
    borderColor: 'border-emerald/20',
    accentColor: 'bg-emerald',
  },
  {
    key: 'jobTracker' as const,
    icon: ListChecks,
    gradient: 'from-amber-500/10 to-amber-500/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500/20',
    accentColor: 'bg-amber-500',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const statsVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute top-60 -left-40 h-80 w-80 rounded-full bg-violet/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <motion.div
                className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.4 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <span className="text-xs font-medium text-brand font-[family-name:var(--font-inter)]">
                  {t('quickActions')}
                </span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-foreground tracking-tight">
                {t('welcomeBack', { name: firstName })}
              </h1>
              <p className="mt-2 text-base text-muted-foreground font-[family-name:var(--font-inter)] max-w-lg">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10"
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Resumes', value: '0' },
            { label: 'Cover Letters', value: '0' },
            { label: 'ATS Checks', value: '0' },
            { label: 'Applications', value: '0' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statsVariants}
              className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-2xl font-bold font-[family-name:var(--font-poppins)] text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-[family-name:var(--font-inter)] mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={itemVariants}>
                <Card
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border transition-all duration-300',
                    'hover:shadow-lg hover:-translate-y-0.5',
                    'cursor-pointer',
                    card.borderColor,
                    'bg-card'
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                      card.gradient
                    )}
                  />

                  {/* Top accent line */}
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-300 opacity-40 group-hover:opacity-100',
                      card.accentColor
                    )}
                  />

                  <CardContent className="relative p-6">
                    <div className="flex items-start justify-between">
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110',
                          card.iconBg
                        )}
                      >
                        <Icon className={cn('w-6 h-6', card.iconColor)} strokeWidth={1.8} />
                      </div>

                      {/* Coming Soon Badge */}
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-muted text-muted-foreground"
                      >
                        {t('comingSoon')}
                      </Badge>
                    </div>

                    {/* Text Content */}
                    <div className="mt-5">
                      <h3 className="text-lg font-semibold text-foreground font-[family-name:var(--font-poppins)]">
                        {t(`features.${card.key}.title`)}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground font-[family-name:var(--font-inter)] leading-relaxed">
                        {t(`features.${card.key}.description`)}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground font-[family-name:var(--font-inter)]">
                      <span>{t('getStarted')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-foreground font-[family-name:var(--font-poppins)] mb-3">
                {t('recentActivity')}
              </h3>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground font-[family-name:var(--font-inter)] max-w-xs">
                  {t('noActivity')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}