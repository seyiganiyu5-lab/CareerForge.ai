import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { upgradeSubscription, getUserPlan } from '@/lib/subscription/service';

/**
 * POST /api/payments/verify
 * Verify a payment by transaction reference (used after Flutterwave redirect).
 */
export async function POST(request: NextRequest) {
  try {
    const { tx_ref } = await request.json();

    if (!tx_ref) {
      return NextResponse.json({ success: false, error: 'Transaction reference is required' }, { status: 400 });
    }

    // Verify with Flutterwave
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (secretKey) {
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`,
        {
          headers: { 'Authorization': `Bearer ${secretKey}` },
        }
      );

      const data = await response.json();

      if (data.status === 'success' && data.data.status === 'successful') {
        const { meta } = data.data;

        // Check if already processed
        const existing = await db.payment.findFirst({
          where: { transaction_reference: tx_ref },
        });

        if (existing) {
          return NextResponse.json({ success: true, already_processed: true });
        }

        // Upgrade subscription
        const subscription = await upgradeSubscription(
          meta.user_id,
          meta.plan_id,
          meta.billing_cycle || 'monthly'
        );

        // Record payment
        await db.payment.create({
          data: {
            user_id: meta.user_id,
            subscription_id: subscription.id,
            amount: Math.round(data.data.amount * 100),
            currency: data.data.currency,
            status: 'successful',
            transaction_reference: tx_ref,
            flutterwave_transaction_id: String(data.data.id),
            payment_method: data.data.payment_type || 'card',
            paid_at: new Date(data.data.created_at),
          },
        });

        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ success: false, error: 'Payment not successful' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Payment verification not configured' }, { status: 503 });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}