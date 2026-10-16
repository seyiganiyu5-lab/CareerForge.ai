import type { Currency } from './currency';

interface PricedPlan {
  name: string;
  currency: string;
  price_monthly: number;
  price_yearly: number;
  prices?: { currency: string; price_monthly: number; price_yearly: number }[];
}

/**
 * A plan's price in a currency, in the currency's subunit (x100), or null when
 * the plan has no price in that currency (or can't be bought online).
 */
export function priceFor(plan: PricedPlan, currency: Currency, cycle: 'monthly' | 'yearly'): number | null {
  if (plan.name === 'free') return null;
  const row = plan.prices?.find((p) => p.currency === currency)
    ?? (plan.currency === currency ? plan : undefined);
  if (!row) return null;
  const price = cycle === 'yearly' ? row.price_yearly : row.price_monthly;
  return price > 0 ? price : null;
}
