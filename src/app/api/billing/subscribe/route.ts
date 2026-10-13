import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { getUserPlan, upgradeSubscription } from '@/lib/subscription/service';
import { isPaymentsConfigured } from '@/lib/billing/flutterwave';
import { getSiteUrl } from '@/lib/auth/profile';

/**
 * POST /api/billing/subscribe
 * Start a plan upgrade.
 * - If Flutterwave is configured: creates a payment link for the user to complete.
 * - If not, and running `npm run dev`: upgrades directly so paid features can be tested.
 * - If not, on a live site: refuses, so nobody gets a paid plan for free.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle = 'monthly' } = body;

    if (!planId) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
    }
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return NextResponse.json({ success: false, error: 'Invalid billing cycle' }, { status: 400 });
    }

    const { db } = await import('@/lib/db');
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.is_active) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    // Free is reached by cancelling; plans without a price (Enterprise) are sold by contact
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    if (plan.name === 'free' || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'This plan cannot be bought online. Please contact us.' },
        { status: 400 }
      );
    }

    // Check if user already has this plan (getUserPlan also expires ended periods)
    const currentSub = await getUserPlan(auth.userId);

    if (currentSub.plan_id === planId && currentSub.status === 'active') {
      return NextResponse.json({ success: false, error: 'You are already on this plan' }, { status: 400 });
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

      const updated = await upgradeSubscription(
        auth.userId,
        planId,
        billingCycle
      );

      return NextResponse.json({
        success: true,
        direct_upgrade: true,
        message: `Upgraded to ${plan.display_name} (test mode, no payment taken)`,
        subscription: {
          id: updated.id,
          plan: {
            id: updated.plan.id,
            name: updated.plan.name,
            display_name: updated.plan.display_name,
            price_monthly: updated.plan.price_monthly,
            price_yearly: updated.plan.price_yearly,
            currency: updated.plan.currency,
          },
          status: updated.status,
          billing_cycle: updated.billing_cycle,
          started_at: updated.started_at,
          expires_at: updated.expires_at,
          current_period_end: updated.current_period_end,
          cancelled_at: updated.cancelled_at,
        },
      });
    }

    // ── Production: create Flutterwave payment link ──
    const fwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: `cf_${Date.now()}_${randomBytes(6).toString('hex')}`,
        amount: price / 100,
        currency: plan.currency,
        redirect_url: `${getSiteUrl(request)}/billing`,
        customer: {
          email: auth.email,
        },
        customizations: {
          title: `CareerForge AI - ${plan.display_name} Plan`,
          description: `${plan.display_name} plan (${billingCycle}) subscription`,
        },
        meta: {
          user_id: auth.userId,
          plan_id: planId,
          billing_cycle: billingCycle,
        },
      }),
    });

    const fwData = await fwResponse.json();

    if (fwData.status === 'success') {
      return NextResponse.json({
        success: true,
        payment_link: fwData.data.link,
        tx_ref: fwData.data.tx_ref,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}