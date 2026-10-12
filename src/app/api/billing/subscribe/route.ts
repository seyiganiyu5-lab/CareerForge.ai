import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { upgradeSubscription } from '@/lib/subscription/service';

/**
 * POST /api/billing/subscribe
 * Initialize a subscription upgrade.
 * - If Flutterwave is configured: creates a payment link for the user to complete.
 * - If Flutterwave is NOT configured (dev/demo): directly upgrades the user.
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

    const { db } = await import('@/lib/db');
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    // Check if user already has this plan
    const currentSub = await db.subscription.findUnique({
      where: { user_id: auth.userId },
      include: { plan: true },
    });

    if (currentSub?.plan_id === planId && currentSub.status === 'active') {
      return NextResponse.json({ success: false, error: 'You are already on this plan' }, { status: 400 });
    }

    // ── Dev / Demo mode: directly upgrade without payment gateway ──
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.log(`[billing] Direct upgrade (no payment gateway) for ${auth.email} → ${plan.name}`);

      const updated = await upgradeSubscription(
        auth.userId,
        planId,
        billingCycle as 'monthly' | 'yearly'
      );

      return NextResponse.json({
        success: true,
        direct_upgrade: true,
        message: `Successfully upgraded to ${plan.display_name} plan!`,
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
        tx_ref: `cf_${auth.userId}_${Date.now()}`,
        amount: (billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly) / 100,
        currency: plan.currency,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/billing?payment=verify`,
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