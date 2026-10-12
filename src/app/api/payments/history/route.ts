import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

/**
 * GET /api/payments/history
 * Get user's payment history.
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await db.payment.findMany({
      where: { user_id: auth.userId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const formatted = payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      transaction_reference: p.transaction_reference,
      payment_method: p.payment_method,
      paid_at: p.paid_at,
      created_at: p.created_at,
      plan_name: p.subscription?.plan.display_name || 'N/A',
    }));

    return NextResponse.json({ success: true, payments: formatted });
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch payment history' }, { status: 500 });
  }
}