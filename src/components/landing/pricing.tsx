'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { ArrowRight } from 'lucide-react';
import { PlanFeatureList, PlanIcon, PlanPrice, usePlanText, yearlySaving, type PlanCardPlan } from '@/components/billing/plan-card-parts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Pricing() {
  const t = useTranslations('pricing');
  const tA = useTranslations('a11y');
  const [isYearly, setIsYearly] = useState(false);
  // The same plans, prices and limits as the Billing page, straight from the
  // database (no hard-coded copies that can drift or show another currency)
  const [plans, setPlans] = useState<PlanCardPlan[] | null>(null);
  const [failed, setFailed] = useState(false);
  const planText = usePlanText();
  useEffect(() => {
    fetch('/api/billing/plans')
      .then(r => r.json())
      .then(data => (Array.isArray(data?.plans) && data.plans.length ? setPlans(data.plans) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);
  const yearlySavingPct = yearlySaving(plans?.find(p => p.name === 'pro'));
  const ctaKey = (name: string) => (['free', 'pro', 'enterprise'].includes(name) ? name : 'pro');

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
              aria-label={tA('toggleBilling')}
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
            {yearlySavingPct !== null && yearlySavingPct > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald font-body">
                {t('yearlyDiscount', { pct: yearlySavingPct })}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {!plans && !failed && [0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4" aria-hidden="true">
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
              <div className="h-10 w-40 rounded bg-muted animate-pulse" />
              {[0, 1, 2, 3, 4].map(j => <div key={j} className="h-4 w-full rounded bg-muted animate-pulse" />)}
            </div>
          ))}
          {failed && (
            <p className="md:col-span-2 lg:col-span-3 text-center text-sm text-muted-foreground font-body">{t('unavailable')}</p>
          )}
          {plans?.map((plan) => {
            const name = plan.name.toLowerCase();
            const isPro = name === 'pro';
            const isEnterprise = plan.price_monthly <= 0 && name !== 'free';

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className={`relative rounded-2xl border bg-card p-6 md:p-8 flex flex-col ${
                  isPro
                    ? 'border-brand shadow-lg lg:scale-105'
                    : 'border-border'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-medium px-3 py-1 rounded-full font-body">
                    {t('plans.pro.popular')}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <PlanIcon name={plan.name} />
                  <h3 className="font-heading font-bold text-xl text-foreground">{planText.name(plan)}</h3>
                </div>
                <p className="text-muted-foreground text-sm mt-1 font-body">{planText.description(plan)}</p>

                <PlanPrice plan={plan} isYearly={isYearly} />

                <div className="border-t border-border my-6" />

                <PlanFeatureList features={plan.features} />

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
                    <Link href={isEnterprise ? '/help' : '/signup'}>
                      {t(`plans.${ctaKey(name)}.cta`)}
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