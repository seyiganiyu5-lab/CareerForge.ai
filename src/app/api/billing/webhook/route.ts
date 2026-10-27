import { NextRequest, NextResponse } from 'next/server';
import { applySuccessfulPayment, isValidWebhookSignature, verifyPayment } from '@/lib/billing/paystack';
import { applyInvoicePayment, isInvoicePayment } from '@/lib/enterprise/invoices';

/**
 * POST /api/billing/webhook
 * Paystack calls this when a payment completes (Paystack dashboard →
 * Settings → API Keys & Webhooks → Webhook URL: https://<your site>/api/billing/webhook).
 * It makes sure the plan is given even if the customer closes the page
 * before coming back to the site.
 */
export async function POST(request: NextRequest) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error('[billing] Webhook received but PAYSTACK_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = JSON.parse(raw);
    const reference = body?.data?.reference;
    if (body?.event !== 'charge.success' || typeof reference !== 'string') {
      return NextResponse.json({ received: true });
    }

    // Look the payment up with Paystack rather than trusting the webhook body
    const tx = await verifyPayment(reference);
    if (!tx) {
      return NextResponse.json({ error: 'Could not verify transaction' }, { status: 502 });
    }

    // Enterprise seat payments, or a person's own plan
    const result = isInvoicePayment(tx) ? await applyInvoicePayment(tx) : await applySuccessfulPayment(tx);
    if (!result.ok) {
      console.error(`[billing] Webhook payment ${tx.reference} not applied: ${result.reason}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // A 5xx makes Paystack retry later
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
