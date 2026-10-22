import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { getUserPlan } from '@/lib/subscription/service';
import { pickCurrency, requestCountry } from '@/lib/billing/currency';
import { priceFor } from '@/lib/billing/prices';

/**
 * GET /api/subscriptions/me
 * Get the current user's subscription info.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getUserPlan(auth.userId);
    // Prices in the same currency as the rest of the site
    const currency = pickCurrency(request.nextUrl.searchParams.get('currency'), requestCountry(request.headers));

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          display_name: subscription.plan.display_name,
          price_monthly: priceFor(subscription.plan, currency, 'monthly') ?? 0,
          price_yearly: priceFor(subscription.plan, currency, 'yearly') ?? 0,
          currency,
        },
        status: subscription.status,
        billing_cycle: subscription.billing_cycle,
        started_at: subscription.started_at,
        expires_at: subscription.expires_at,
        current_period_end: subscription.current_period_end,
        cancelled_at: subscription.cancelled_at,
      },
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch subscription' }, { status: 500 });
  }
}