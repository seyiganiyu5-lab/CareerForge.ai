import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { getUserPlan, upgradeSubscription } from '@/lib/subscription/service';
import { initializePayment, isPaymentsConfigured } from '@/lib/billing/paystack';
import { pickCurrency, requestCountry } from '@/lib/billing/currency';
import { priceFor } from '@/lib/billing/prices';
import { getSiteUrl } from '@/lib/auth/profile';

/**
 * POST /api/billing/subscribe  { planId, billingCycle, currency }
 * Start buying (or renewing) a paid plan.
 * - Paystack configured: returns the Paystack checkout page to send the user to.
 * - Not configured, running `npm run dev`: upgrades directly so paid features can be tested.
 * - Not configured, live site: refuses, so nobody gets a paid plan for free.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { planId, billingCycle = 'monthly' } = body as { planId?: string; billingCycle?: string; currency?: string };

    if (!planId) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
    }
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return NextResponse.json({ success: false, error: 'Invalid billing cycle' }, { status: 400 });
    }

    const plan = await db.plan.findUnique({ where: { id: planId }, include: { prices: true } });
    if (!plan || !plan.is_active) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    // Free is reached by cancelling; plans without a price (Enterprise) are sold by contact
    const currency = pickCurrency(body.currency, requestCountry(request.headers));
    const amount = priceFor(plan, currency, billingCycle);
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'This plan cannot be bought online. Please contact us.' },
        { status: 400 }
      );
    }

    // Also drops an ended paid period back to Free. Paying again for the
    // current plan is allowed: it adds a period on top (renewal).
    const currentSub = await getUserPlan(auth.userId);
    if (currentSub.organization) {
      return NextResponse.json(
        { success: false, error: 'org_plan', message: 'Your plan is provided by your organisation.' },
        { status: 400 }
      );
    }
    if (currentSub.plan.name !== 'free' && currentSub.plan_id !== planId) {
      return NextResponse.json(
        { success: false, error: 'Please wait for your current plan to end, or contact us to switch plans.' },
        { status: 400 }
      );
    }

    if (!isPaymentsConfigured() && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Payments are not available yet. Please try again later.' },
        { status: 503 }
      );
    }

    // ── Local development only: upgrade without a payment gateway ──
    if (!isPaymentsConfigured()) {
      console.log(`[billing] Dev-mode upgrade (no payment) for ${auth.email} → ${plan.name}`);
      const updated = await upgradeSubscription(auth.userId, planId, billingCycle);
      return NextResponse.json({
        success: true,
        direct_upgrade: true,
        message: `Upgraded to ${plan.display_name} (test mode, no payment taken)`,
        subscription: {
          id: updated.id,
          plan: { id: updated.plan.id, name: updated.plan.name, display_name: updated.plan.display_name },
          status: updated.status,
          billing_cycle: updated.billing_cycle,
          current_period_end: updated.current_period_end,
        },
      });
    }

    // ── Paystack checkout ──
    const result = await initializePayment({
      email: auth.email,
      amount,
      currency,
      reference: `cf_${Date.now()}_${randomBytes(6).toString('hex')}`,
      // Paystack adds ?trxref=...&reference=... when sending the user back
      callbackUrl: `${getSiteUrl(request)}/billing`,
      metadata: { user_id: auth.userId, plan_id: planId, billing_cycle: billingCycle, plan_name: plan.display_name },
    });

    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error === 'currency_unavailable' ? 'currency_unavailable' : 'Failed to create payment', currency },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, payment_link: result.payment.authorization_url, reference: result.payment.reference });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process subscription' }, { status: 500 });
  }
}
