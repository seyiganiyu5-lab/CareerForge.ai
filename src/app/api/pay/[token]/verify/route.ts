import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayment } from '@/lib/billing/paystack';
import { applyInvoicePayment, isInvoicePayment } from '@/lib/enterprise/invoices';

/**
 * POST /api/pay/:token/verify { reference } — after Paystack sends the payer
 * back: look the payment up with Paystack and apply it. The webhook does the
 * same, in case the payer closes the page first.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { reference } = await request.json().catch(() => ({}));
  if (typeof reference !== 'string' || !reference.startsWith('org_') || reference.length > 100) {
    return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });
  }

  const invoice = await db.organizationInvoice.findUnique({ where: { token }, select: { id: true } });
  if (!invoice) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

  const tx = await verifyPayment(reference);
  // The payment must be for this invoice
  if (!tx || isInvoicePayment(tx) !== invoice.id) return NextResponse.json({ success: false, error: 'not_verified' }, { status: 400 });
  if (tx.status !== 'success') return NextResponse.json({ success: false, error: 'payment_not_completed', status: tx.status }, { status: 400 });

  const result = await applyInvoicePayment(tx);
  if (!result.ok) {
    console.error(`[billing] Organisation payment ${tx.reference} not applied: ${result.reason}`);
    return NextResponse.json({ success: false, error: 'not_applied' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
