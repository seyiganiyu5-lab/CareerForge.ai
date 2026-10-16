import { NextRequest, NextResponse } from 'next/server';
import { getPlans } from '@/lib/subscription/service';
import { enabledCurrencies, pickCurrency, requestCountry } from '@/lib/billing/currency';
import { priceFor } from '@/lib/billing/prices';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/plans?currency=NGN
 * Plans with their prices in the requested currency, or the visitor's local
 * currency (from their country), among the currencies payments are set up for.
 */
export async function GET(request: NextRequest) {
  try {
    const currency = pickCurrency(request.nextUrl.searchParams.get('currency'), requestCountry(request.headers));
    const plans = await getPlans();
    const formatted = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      display_name: plan.display_name,
      price_monthly: priceFor(plan, currency, 'monthly') ?? 0,
      price_yearly: priceFor(plan, currency, 'yearly') ?? 0,
      currency,
      description: plan.description,
      sort_order: plan.sort_order,
      features: plan.plan_features.map(f => ({
        key: f.feature_key,
        enabled: f.enabled,
        limit: f.limit_value,
      })),
    }));

    return NextResponse.json({ success: true, plans: formatted, currency, currencies: enabledCurrencies() });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
