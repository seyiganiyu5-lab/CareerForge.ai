import { createHmac, timingSafeEqual } from 'crypto';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { upgradeSubscription } from '@/lib/subscription/service';
import { createNotification } from '@/lib/notifications';
import { isCurrency } from './currency';
import { priceFor } from './prices';

const PAYSTACK_API = 'https://api.paystack.co';

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

/** What we put in a payment so we know what it was for. */
export interface PaymentMetadata {
  user_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
}

/** The parts of a Paystack transaction we rely on. */
export interface PaystackTransaction {
  id: number;
  reference: string;
  status: string; // success, failed, abandoned, ...
  amount: number; // in the currency's subunit (x100)
  currency: string;
  channel?: string; // card, bank, ussd, bank_transfer, mobile_money, ...
  paid_at?: string | null;
  created_at?: string;
  // Organisation payments carry kind: 'org_invoice' and invoice_id instead
  metadata?: (Partial<PaymentMetadata> & { kind?: string; invoice_id?: string }) | string | null;
}

async function paystack<T>(path: string, init?: RequestInit): Promise<T | null> {
  const result = await paystackCall<T>(path, init);
  return result.data;
}

async function paystackCall<T>(path: string, init?: RequestInit): Promise<{ data: T | null; message?: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { data: null };
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.status !== true || !body.data) {
    if (body?.message) console.error(`[billing] Paystack ${path}: ${body.message}`);
    return { data: null, message: body?.message };
  }
  return { data: body.data as T };
}

/** Start a payment; returns the Paystack checkout page to send the customer to. */
export async function initializePayment(input: {
  email: string;
  amount: number; // subunit (x100)
  currency: string;
  reference: string;
  callbackUrl: string;
  // What the payment is for, read back when it is confirmed
  metadata: Record<string, unknown>;
}) {
  const result = await paystackCall<{ authorization_url: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
  if (!result.data && /currency/i.test(result.message ?? '')) {
    console.error(`[billing] Your Paystack account does not accept ${input.currency}. Set PAYMENT_CURRENCIES in .env to the currencies it accepts (e.g. "NGN") and restart.`);
    return { error: 'currency_unavailable' as const };
  }
  return result.data ? { payment: result.data } : { error: 'payment_failed' as const };
}

/**
 * Ask Paystack for a transaction's real status. Never trust payment details
 * sent by a browser or webhook body; always look them up here.
 */
export function verifyPayment(reference: string) {
  return paystack<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Paystack signs webhooks with HMAC-SHA512 of the raw body, keyed with the secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) return false;
  const expected = Buffer.from(createHmac('sha512', secretKey).update(rawBody).digest('hex'));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function paymentMetadata(tx: PaystackTransaction): Partial<PaymentMetadata> & { kind?: string; invoice_id?: string } {
  if (!tx.metadata) return {};
  if (typeof tx.metadata === 'string') {
    try {
      return JSON.parse(tx.metadata);
    } catch {
      return {};
    }
  }
  return tx.metadata;
}

export type ApplyPaymentResult =
  | { ok: true; alreadyProcessed: boolean; userId: string }
  | { ok: false; reason: string };

/**
 * Give the customer the plan they paid for, after checking the payment is
 * successful, for a real paid plan, and for the full price in that currency.
 * Safe to call more than once for the same payment (redirect + webhook).
 */
export async function applySuccessfulPayment(tx: PaystackTransaction): Promise<ApplyPaymentResult> {
  if (tx.status !== 'success') return { ok: false, reason: 'Payment not successful' };

  const meta = paymentMetadata(tx);
  const userId = meta.user_id;
  const planId = meta.plan_id;
  const billingCycle = meta.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
  if (!userId || !planId) return { ok: false, reason: 'Payment is missing plan details' };

  const existing = await db.payment.findUnique({ where: { provider_transaction_id: tx.reference } });
  if (existing) return { ok: true, alreadyProcessed: true, userId: existing.user_id };

  const [user, plan] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.plan.findUnique({ where: { id: planId }, include: { prices: true } }),
  ]);
  if (!user) return { ok: false, reason: 'User not found' };
  if (!plan || plan.name === 'free') return { ok: false, reason: 'Plan not found' };

  const expected = isCurrency(tx.currency) ? priceFor(plan, tx.currency, billingCycle) : null;
  if (!expected || tx.amount < expected) {
    console.error(`[billing] Payment ${tx.reference} does not match plan ${plan.name}: paid ${tx.amount} ${tx.currency}, expected ${expected} ${tx.currency}`);
    return { ok: false, reason: 'Payment amount does not match the plan price' };
  }

  // Record the payment first: the unique reference makes sure the redirect
  // check and the webhook can't both apply it
  let paymentId: string;
  try {
    const payment = await db.payment.create({
      data: {
        user_id: userId,
        provider: 'paystack',
        provider_transaction_id: tx.reference,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount: tx.amount,
        currency: tx.currency,
        status: 'successful',
        transaction_reference: tx.reference,
        payment_method: tx.channel || 'card',
        paid_at: new Date(tx.paid_at || tx.created_at || Date.now()),
      },
    });
    paymentId = payment.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: true, alreadyProcessed: true, userId };
    }
    throw error;
  }

  let subscription: Awaited<ReturnType<typeof upgradeSubscription>>;
  try {
    subscription = await upgradeSubscription(userId, planId, billingCycle);
    await db.payment.update({ where: { id: paymentId }, data: { subscription_id: subscription.id } });
  } catch (error) {
    // Undo the record so the next check (webhook retry or page reload) applies it again
    await db.payment.delete({ where: { id: paymentId } }).catch(() => {});
    throw error;
  }

  // Fresh AI and export allowances for the new paid period
  await db.userUsage.upsert({
    where: { user_id: userId },
    create: { user_id: userId },
    update: { ai_requests: 0, resume_reviews: 0, exports_count: 0, ats_checks: 0 },
  });

  await createNotification(userId, {
    type: 'payment_success',
    key: `payment:${tx.reference}`,
    data: {
      plan: plan.display_name,
      amount: tx.amount,
      currency: tx.currency,
      until: subscription.current_period_end?.toISOString() ?? null,
    },
    link: '/billing',
  }).catch((err) => console.error('Payment notification failed:', err));

  return { ok: true, alreadyProcessed: false, userId };
}
