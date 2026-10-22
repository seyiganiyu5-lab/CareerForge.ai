'use client';

import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Crown, Building2, CreditCard } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { FEATURE_DISPLAY_INFO } from '@/lib/subscription/features';

/**
 * Pieces of a plan card shared by the landing page and the Billing page, so
 * both always show the same names, descriptions, prices and feature limits
 * (straight from the plans in the database).
 */

export interface PlanCardFeature {
  key: string;
  enabled: boolean;
  limit: number | null;
}

export interface PlanCardPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  description: string;
  features: PlanCardFeature[];
}

const KNOWN_PLANS = ['free', 'pro', 'enterprise'];

export function PlanIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const n = name.toLowerCase();
  const color = n === 'pro' ? 'text-brand' : n === 'enterprise' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground';
  const Icon = n === 'free' ? Sparkles : n === 'pro' ? Crown : n === 'enterprise' ? Building2 : CreditCard;
  return <Icon className={`${className} ${color}`} />;
}

/** Translated plan name and description */
export function usePlanText() {
  const t = useTranslations('app.billing');
  return {
    name: (plan: { name: string; display_name: string }) =>
      KNOWN_PLANS.includes(plan.name.toLowerCase()) ? t(`planName_${plan.name.toLowerCase()}`) : plan.display_name,
    description: (plan: { name: string; description: string }) =>
      KNOWN_PLANS.includes(plan.name.toLowerCase()) ? t(`planDesc_${plan.name.toLowerCase()}`) : plan.description,
  };
}

/** Money in the plan's currency: ₦7,900 · 4 900 F CFA · $7.99 (amounts are x100) */
export function usePlanMoney() {
  const { locale } = useLocale();
  return (subunits: number, currency: string) => {
    const amount = subunits / 100;
    const digits = Number.isInteger(amount) ? 0 : 2;
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  };
}

/** Yearly saving of a plan in percent, or null when it has no yearly price */
export function yearlySaving(plan: PlanCardPlan | undefined): number | null {
  if (!plan || plan.price_monthly <= 0 || plan.price_yearly <= 0) return null;
  const pct = Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100);
  return pct > 0 ? pct : null;
}

/** "Free", "Custom", or the price with its period and the monthly/yearly note */
export function PlanPrice({ plan, isYearly }: { plan: PlanCardPlan; isYearly: boolean }) {
  const t = useTranslations('app.billing');
  const money = usePlanMoney();
  const name = plan.name.toLowerCase();
  const price = isYearly ? plan.price_yearly : plan.price_monthly;
  const isFree = name === 'free';
  const isCustom = !isFree && price <= 0;
  const text = isFree ? t('free') : isCustom ? t('custom') : money(price, plan.currency);
  const size = text.length > 9 ? 'text-3xl' : 'text-4xl';

  return (
    <>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
        <span className={`${size} whitespace-nowrap font-bold font-heading text-foreground`}>{text}</span>
        {!isFree && !isCustom && (
          <span className="text-muted-foreground text-sm font-body">{isYearly ? t('perYear') : t('perMonth')}</span>
        )}
      </div>
      {!isFree && !isCustom && (
        <p className="text-xs text-muted-foreground font-body mt-1">
          {isYearly
            ? t('billedAnnually', { price: money(Math.round(plan.price_yearly / 12), plan.currency) })
            : t('orYearly', {
              price: money(plan.price_yearly, plan.currency),
              savings: money(plan.price_monthly * 12 - plan.price_yearly, plan.currency),
            })}
        </p>
      )}
    </>
  );
}

/** Every feature with its real limit; features the plan doesn't include are crossed out */
export function PlanFeatureList({ features }: { features: PlanCardFeature[] }) {
  const t = useTranslations('app.billing');
  const tf = useTranslations('app.features');

  return (
    <ul className="space-y-3">
      {features
        .filter((f) => FEATURE_DISPLAY_INFO[f.key])
        .map((feature) => {
          const unlimited = feature.limit === null || feature.limit === -1 || feature.limit === 0;
          return (
            <li key={feature.key} className="flex items-start gap-2.5">
              {feature.enabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
              )}
              <span
                className={`text-sm font-body ${feature.enabled ? 'text-foreground/90' : 'text-muted-foreground/50 line-through'}`}
              >
                {tf(feature.key)}
                {feature.enabled && !unlimited && <span className="text-muted-foreground ml-1">({feature.limit})</span>}
                {feature.enabled && unlimited && <span className="text-emerald ml-1 text-xs">({t('unlimited')})</span>}
              </span>
            </li>
          );
        })}
    </ul>
  );
}
