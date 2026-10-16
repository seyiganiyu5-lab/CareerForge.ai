import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { applySuccessfulPayment, isPaymentsConfigured, paymentMetadata, verifyPayment } from '@/lib/billing/paystack';

/**
 * POST /api/payments/verify  { reference }
 * Called by the billing page when the user comes back from Paystack checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isPaymentsConfigured()) {
      return NextResponse.json({ success: false, error: 'Payments are not set up yet' }, { status: 503 });
    }

    const { reference } = await request.json().catch(() => ({}));
    if (typeof reference !== 'string' || !reference) {
      return NextResponse.json({ success: false, error: 'Transaction reference is required' }, { status: 400 });
    }

    const tx = await verifyPayment(reference);
    if (!tx || tx.reference !== reference) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }
    if (paymentMetadata(tx).user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'This payment belongs to another account' }, { status: 403 });
    }
    if (tx.status !== 'success') {
      // abandoned / failed: the customer left or the payment was declined
      return NextResponse.json({ success: false, error: 'payment_not_completed', status: tx.status }, { status: 400 });
    }

    const result = await applySuccessfulPayment(tx);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ success: true, already_processed: result.alreadyProcessed });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
