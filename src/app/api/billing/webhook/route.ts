import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { applySuccessfulPayment, fetchTransaction } from '@/lib/billing/flutterwave';

function isValidSignature(signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/billing/webhook
 * Flutterwave calls this when a payment completes.
 */
export async function POST(request: NextRequest) {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secretHash) {
    console.error('[billing] Webhook received but FLUTTERWAVE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!isValidSignature(request.headers.get('verif-hash'), secretHash)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body?.event !== 'charge.completed' || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    // Look the payment up with Flutterwave rather than trusting the webhook body
    const tx = await fetchTransaction({ id: body.data.id });
    if (!tx) {
      return NextResponse.json({ error: 'Could not verify transaction' }, { status: 502 });
    }

    const result = await applySuccessfulPayment(tx);
    if (!result.ok) {
      console.error(`[billing] Webhook payment ${tx.id} not applied: ${result.reason}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
