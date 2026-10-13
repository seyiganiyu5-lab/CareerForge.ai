import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { upgradeSubscription } from '@/lib/subscription/service';

const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

/** The parts of a Flutterwave transaction we rely on. */
export interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  payment_type?: string;
  created_at: string;
  meta?: { user_id?: string; plan_id?: string; billing_cycle?: string } | null;
}

/**
 * Ask Flutterwave for a transaction's real status. Never trust payment
 * details sent by a browser or webhook body; always look them up here.
 */
export async function fetchTransaction(
  lookup: { id: string | number } | { txRef: string }
): Promise<FlutterwaveTransaction | null> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) return null;

  const url =
    'id' in lookup
      ? `${FLUTTERWAVE_API}/transactions/${encodeURIComponent(String(lookup.id))}/verify`
      : `${FLUTTERWAVE_API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(lookup.txRef)}`;

  const response = await fetch(url, { headers: { Authorization: `Bearer ${secretKey}` } });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.status !== 'success' || !body.data) return null;
  return body.data as FlutterwaveTransaction;
}

export type ApplyPaymentResult =
  | { ok: true; alreadyProcessed: boolean; userId: string }
  | { ok: false; reason: string };

/**
 * Upgrade the user who paid, after checking the payment is successful,
 * for a real paid plan, and for the full price. Safe to call more than
 * once for the same transaction.
 */
export async function applySuccessfulPayment(tx: FlutterwaveTransaction): Promise<ApplyPaymentResult> {
  if (tx.status !== 'successful') return { ok: false, reason: 'Payment not successful' };

  const userId = tx.meta?.user_id;
  const planId = tx.meta?.plan_id;
  const billingCycle = tx.meta?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
  if (!userId || !planId) return { ok: false, reason: 'Payment is missing plan details' };

  const existing = await db.payment.findUnique({
    where: { flutterwave_transaction_id: String(tx.id) },
  });
  if (existing) return { ok: true, alreadyProcessed: true, userId: existing.user_id };

  const [user, plan] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.plan.findUnique({ where: { id: planId } }),
  ]);
  if (!user) return { ok: false, reason: 'User not found' };
  if (!plan || plan.name === 'free') return { ok: false, reason: 'Plan not found' };

  // Prices are stored in cents; Flutterwave reports whole currency units
  const expected = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const paid = Math.round(tx.amount * 100);
  if (expected <= 0 || paid < expected || tx.currency !== plan.currency) {
    console.error(`[billing] Payment ${tx.id} does not match plan ${plan.name}: paid ${paid} ${tx.currency}, expected ${expected} ${plan.currency}`);
    return { ok: false, reason: 'Payment amount does not match the plan price' };
  }

  const subscription = await upgradeSubscription(userId, planId, billingCycle);

  try {
    await db.payment.create({
      data: {
        user_id: userId,
        subscription_id: subscription.id,
        amount: paid,
        currency: tx.currency,
        status: 'successful',
        transaction_reference: tx.tx_ref,
        flutterwave_transaction_id: String(tx.id),
        payment_method: tx.payment_type || 'card',
        paid_at: new Date(tx.created_at),
      },
    });
  } catch (error) {
    // The webhook and the redirect check processed it at the same time
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: true, alreadyProcessed: true, userId };
    }
    throw error;
  }

  // Fresh limits for the new paid period
  await db.userUsage.upsert({
    where: { user_id: userId },
    create: { user_id: userId },
    update: {
      resume_count: 0,
      cover_letter_count: 0,
      ai_requests: 0,
      resume_reviews: 0,
      exports_count: 0,
      ats_checks: 0,
    },
  });

  return { ok: true, alreadyProcessed: false, userId };
}
