import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { applySuccessfulPayment, fetchTransaction, isPaymentsConfigured } from '@/lib/billing/flutterwave';

/**
 * POST /api/payments/verify
 * Called by the billing page when the user returns from Flutterwave checkout.
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

    const { tx_ref, transaction_id } = await request.json();
    if (!tx_ref && !transaction_id) {
      return NextResponse.json({ success: false, error: 'Transaction reference is required' }, { status: 400 });
    }

    const tx = await fetchTransaction(transaction_id ? { id: transaction_id } : { txRef: tx_ref });
    if (!tx || (tx_ref && tx.tx_ref !== tx_ref)) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }
    if (tx.meta?.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'This payment belongs to another account' }, { status: 403 });
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
