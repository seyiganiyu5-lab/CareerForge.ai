import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { upgradeSubscription, getUserPlan } from '@/lib/subscription/service';
import crypto from 'crypto';

/**
 * POST /api/billing/webhook
 * Flutterwave webhook endpoint for payment verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (secretHash) {
      const signature = request.headers.get('verif-hash');
      if (!signature || signature !== secretHash) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    if (body.event === 'charge.completed' && body.data.status === 'successful') {
      const { meta, tx_ref, id: fwTransactionId } = body.data;
      const { user_id, plan_id, billing_cycle } = meta;

      // Verify this transaction hasn't been processed
      const existingPayment = await db.payment.findFirst({
        where: { flutterwave_transaction_id: String(fwTransactionId) },
      });

      if (existingPayment) {
        return NextResponse.json({ received: true });
      }

      // Upgrade subscription
      const subscription = await upgradeSubscription(user_id, plan_id, billing_cycle || 'monthly');

      // Record payment
      const plan = await db.plan.findUnique({ where: { id: plan_id } });
      const price = (billing_cycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly) || 0;

      await db.payment.create({
        data: {
          user_id,
          subscription_id: subscription.id,
          amount: Math.round(body.data.amount * 100),
          currency: body.data.currency,
          status: 'successful',
          transaction_reference: tx_ref,
          flutterwave_transaction_id: String(fwTransactionId),
          payment_method: 'card',
          paid_at: new Date(body.data.created_at),
        },
      });

      // Reset usage for paid upgrades
      if (plan && plan.name !== 'free') {
        await db.userUsage.upsert({
          where: { user_id },
          create: { user_id },
          update: {
            resume_count: 0,
            cover_letter_count: 0,
            ai_requests: 0,
            resume_reviews: 0,
            exports_count: 0,
            ats_checks: 0,
          },
        });
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}