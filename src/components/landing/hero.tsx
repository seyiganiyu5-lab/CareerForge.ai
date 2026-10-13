'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, CheckCircle2, Mail, ListChecks, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.4 + i * 0.1,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

interface DashboardCard {
  translationKey: string;
  score?: string;
  icon: typeof FileText;
  colorClass: string;
  floatClass: string;
  size: string;
}

const dashboardCards: DashboardCard[] = [
  {
    translationKey: 'resumePreview',
    icon: FileText,
    colorClass: 'bg-brand-light text-brand border-brand/20',
    floatClass: 'animate-float',
    size: 'col-span-2 row-span-1',
  },
  {
    translationKey: 'aiScore',
    score: '95',
    icon: Sparkles,
    colorClass: 'bg-emerald-light text-emerald border-emerald/20',
    floatClass: 'animate-float-delayed',
    size: 'col-span-1 row-span-1',
  },
  {
    translationKey: 'atsScore',
    score: '92',
    icon: CheckCircle2,
    colorClass: 'bg-violet-light text-violet border-violet/20',
    floatClass: 'animate-float-slow',
    size: 'col-span-1 row-span-1',
  },
  {
    translationKey: 'coverLetter',
    icon: Mail,
    colorClass: 'bg-brand-light text-brand border-brand/20',
    floatClass: 'animate-float-slow',
    size: 'col-span-1 row-span-1',
  },
  {
    translationKey: 'jobTracker',
    icon: ListChecks,
    colorClass: 'bg-emerald-light text-emerald border-emerald/20',
    floatClass: 'animate-float-delayed',
    size: 'col-span-1 row-span-1',
  },
  {
    translationKey: 'pdfExport',
    icon: Download,
    colorClass: 'bg-violet-light text-violet border-violet/20',
    floatClass: 'animate-float',
    size: 'col-span-2 row-span-1',
  },
];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 md:pt-24 hero-gradient grid-pattern overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body shadow-lg shadow-brand/20">
                <Sparkles className="w-3.5 h-3.5" />
                {t('badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold leading-tight tracking-tight"
            >
              <span className="gradient-text">{t('title')}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed font-body"
            >
              {t('description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gap-2 bg-brand hover:bg-brand/90 text-white rounded-xl px-6 h-12 text-base font-semibold shadow-lg shadow-brand/25 font-body"
                asChild
              >
                <Link href="/signup">
                  {t('primaryCta')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

            </motion.div>
          </motion.div>

          {/* Right — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            {/* Glow behind the cards */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-violet/10 to-emerald/10 rounded-3xl blur-2xl" />

            {/* Card grid */}
            <div className="relative grid grid-cols-3 gap-3 p-2">
              {dashboardCards.map((card, index) => {
                const Icon = card.icon;
                const isWide = card.translationKey === 'resumePreview' || card.translationKey === 'pdfExport';
                return (
                  <motion.div
                    key={card.translationKey}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`
                      ${card.floatClass}
                      ${isWide ? 'col-span-2' : 'col-span-1'}
                      rounded-2xl p-4
                      backdrop-blur-xl
                      bg-white/70 dark:bg-slate-800/70
                      border border-white/20 dark:border-white/10
                      shadow-lg
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          flex items-center justify-center
                          w-9 h-9 rounded-xl shrink-0
                          ${card.colorClass}
                        `}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground truncate font-body">
                          {t(`dashboard.${card.translationKey}`)}
                        </p>
                        {card.score ? (
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl font-bold text-foreground font-heading">
                              {card.score}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body">
                              {t('dashboard.score')}
                            </span>
                          </div>
                        ) : card.translationKey === 'jobTracker' ? (
                          <p className="text-xs text-muted-foreground mt-0.5 font-body">
                            24 {t('dashboard.applications')}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Mini progress bar for score cards */}
                    {card.score && (
                      <div className="mt-3 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Number(card.score)}%` }}
                          transition={{ duration: 1, delay: 1 + index * 0.15, ease: 'easeOut' }}
                          className={`
                            h-full rounded-full
                            ${card.translationKey === 'aiScore'
                              ? 'bg-gradient-to-r from-emerald to-emerald/70'
                              : 'bg-gradient-to-r from-violet to-violet/70'
                            }
                          `}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}