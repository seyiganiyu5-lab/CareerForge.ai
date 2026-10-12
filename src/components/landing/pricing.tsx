'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const planKeys = ['free', 'pro', 'enterprise'] as const;

const featureCounts: Record<string, number> = {
  free: 5,
  pro: 7,
  enterprise: 7,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Pricing() {
  const t = useTranslations('pricing');
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body">
            {t('badge')}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-6">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 font-body">
            {t('description')}
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium font-body transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('monthly')}
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-12 items-center rounded-full border border-border bg-muted p-0.5 transition-colors"
              aria-label="Toggle billing period"
            >
              <motion.span
                layoutId="pricing-toggle-indicator"
                className="block h-6 w-6 rounded-full bg-brand shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{ marginLeft: isYearly ? 'auto' : 0 }}
              />
            </button>
            <span className={`text-sm font-medium font-body transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('yearly')}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald font-body">
              {t('yearlyDiscount')}
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {planKeys.map((planKey) => {
            const isPro = planKey === 'pro';
            const isEnterprise = planKey === 'enterprise';
            const hasPrice = planKey === 'free' || planKey === 'pro';
            const featureCount = featureCounts[planKey];

            return (
              <motion.div
                key={planKey}
                variants={cardVariants}
                className={`relative rounded-2xl border bg-card p-6 md:p-8 flex flex-col ${
                  isPro
                    ? 'border-brand shadow-lg lg:scale-105'
                    : 'border-border'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-medium px-3 py-1 rounded-full font-body">
                    {t(`plans.pro.popular`)}
                  </span>
                )}

                <h3 className="font-heading font-bold text-xl text-foreground">
                  {t(`plans.${planKey}.name`)}
                </h3>

                {hasPrice ? (
                <div className="mt-4 flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly && planKey !== 'free' ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl md:text-5xl font-bold font-heading text-foreground"
                    >
                      {planKey !== 'free' && isYearly
                        ? t(`plans.${planKey}.priceYearly`)
                        : t(`plans.${planKey}.price`)
                      }
                    </motion.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly && planKey !== 'free' ? 'yearly-period' : 'monthly-period'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground text-sm font-body"
                    >
                      {planKey !== 'free' && isYearly
                        ? t(`plans.${planKey}.periodYearly`)
                        : t(`plans.${planKey}.period`)
                      }
                    </motion.span>
                  </AnimatePresence>
                </div>
                ) : (
                <p className="mt-4 text-muted-foreground text-sm font-body">
                  Custom pricing based on your needs
                </p>
                )}

                <p className="text-muted-foreground text-sm mt-2 font-body">
                  {t(`plans.${planKey}.description`)}
                </p>

                <div className="border-t border-border my-6" />

                <ul className="space-y-3">
                  {Array.from({ length: featureCount }).map((_, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80 font-body">
                        {t(`plans.${planKey}.features.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button
                    variant={isPro ? 'default' : 'outline'}
                    className={`w-full font-body rounded-xl ${
                      isPro
                        ? 'bg-brand text-white hover:bg-brand/90'
                        : ''
                    }`}
                    asChild
                  >
                    <Link href={isEnterprise ? '/#pricing' : '/signup'}>
                      {t(`plans.${planKey}.cta`)}
                      {!isEnterprise && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}