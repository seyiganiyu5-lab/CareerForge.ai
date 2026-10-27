import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSiteUrl } from '@/lib/auth/profile';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { initializePayment, isPaymentsConfigured } from '@/lib/billing/paystack';
import { logoUrl } from '@/lib/enterprise/branding';
import { INVOICE_KIND, applyInvoicePayment } from '@/lib/enterprise/invoices';

type Params = { params: Promise<{ token: string }> };

function findInvoice(token: string) {
  if (!token || token.length > 64) return null;
  return db.organizationInvoice.findUnique({
    where: { token },
    include: { organization: { select: { id: true, logo_updated_at: true } } },
  });
}

/**
 * GET /api/pay/:token — a payment request, for whoever has the link (the
 * organisation's owner or their finance team; no account needed)
 */
export async function GET(request: NextRequest, { params }: Params) {
  if (!rateLimit(`pay:${getClientIp(request)}`, { maxRequests: 30, windowMs: 60_000 }).success) {
    return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
  }
  const invoice = await findInvoice((await params).token);
  if (!invoice) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    invoice: {
      organization: invoice.organization_name,
      logo_url: invoice.organization ? logoUrl(invoice.organization) : null,
      seats: invoice.seats,
      months: invoice.months,
      unit_price: invoice.unit_price,
      amount: invoice.amount,
      currency: invoice.currency,
      note: invoice.note,
      status: invoice.organization ? invoice.status : 'cancelled',
      paid_at: invoice.paid_at,
      access_until: invoice.access_until,
    },
  });
}

const paySchema = z.object({ email: z.email().max(200) });

/** POST /api/pay/:token { email } — start the Paystack payment; returns its checkout page */
export async function POST(request: NextRequest, { params }: Params) {
  if (!rateLimit(`pay-start:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 }).success) {
    return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
  }
  const { token } = await params;
  const invoice = await findInvoice(token);
  if (!invoice || !invoice.organization) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  if (invoice.status !== 'open') return NextResponse.json({ success: false, error: `invoice_${invoice.status}` }, { status: 409 });

  const parsed = paySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'invalid_email' }, { status: 400 });

  const reference = `org_${invoice.id}_${randomBytes(6).toString('hex')}`;

  // ── Local development only: mark it paid without a payment gateway ──
  if (!isPaymentsConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'payments_unavailable' }, { status: 503 });
    }
    console.log(`[billing] Dev-mode organisation payment (no money taken) for invoice ${invoice.id}`);
    await applyInvoicePayment({
      id: 0, reference, status: 'success', amount: invoice.amount, currency: invoice.currency,
      channel: 'test', paid_at: new Date().toISOString(), metadata: { kind: INVOICE_KIND, invoice_id: invoice.id },
    });
    await db.organizationInvoice.update({ where: { id: invoice.id }, data: { payer_email: parsed.data.email } });
    return NextResponse.json({ success: true, paid: true });
  }

  const result = await initializePayment({
    email: parsed.data.email,
    amount: invoice.amount,
    currency: invoice.currency,
    reference,
    // Paystack adds ?trxref=...&reference=... when sending the payer back
    callbackUrl: `${getSiteUrl(request)}/pay/${token}`,
    metadata: { kind: INVOICE_KIND, invoice_id: invoice.id, organization: invoice.organization_name },
  });
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: 502 });

  await db.organizationInvoice.update({ where: { id: invoice.id }, data: { payer_email: parsed.data.email } });
  return NextResponse.json({ success: true, payment_link: result.payment.authorization_url });
}
