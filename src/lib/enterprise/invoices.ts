import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { adminEmails } from '@/lib/admin';
import { createNotification } from '@/lib/notifications';
import { addPeriod } from '@/lib/subscription/service';
import { paymentMetadata, type PaystackTransaction } from '@/lib/billing/paystack';
import { MANAGER_ROLES } from './organizations';

/**
 * Enterprise seats are sold by payment request: a site admin sets the seats,
 * months and price per seat, the organisation pays through a private link,
 * and the payment sets the seats and moves the end date forward.
 */

export const MONTH_OPTIONS = [1, 3, 6, 12] as const;
// Reminder to renew before an organisation's access ends
const REMINDER_DAYS = 14;
const DAY = 86_400_000;

export const newInvoiceToken = () => randomBytes(24).toString('base64url');
export const invoicePath = (token: string) => `/pay/${token}`;

/** Paystack metadata marking a payment as an organisation invoice */
export const INVOICE_KIND = 'org_invoice';

export function isInvoicePayment(tx: PaystackTransaction) {
  const meta = paymentMetadata(tx);
  return meta.kind === INVOICE_KIND && typeof meta.invoice_id === 'string' ? meta.invoice_id : null;
}

async function managerIds(organizationId: string) {
  const managers = await db.organizationMember.findMany({
    where: { organization_id: organizationId, role: { in: [...MANAGER_ROLES] } },
    select: { user_id: true },
  });
  return managers.map((m) => m.user_id);
}

async function siteAdminIds() {
  const emails = adminEmails();
  if (!emails.length) return [];
  const users = await db.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  return users.map((u) => u.id);
}

/** Owners and admins of the organisation see the request in their notifications */
export async function notifyInvoiceCreated(invoice: { id: string; organization_id: string | null; amount: number; currency: string; seats: number; months: number; token: string }) {
  if (!invoice.organization_id) return;
  const ids = await managerIds(invoice.organization_id);
  await Promise.all(ids.map((id) =>
    createNotification(id, {
      type: 'org_invoice',
      key: `orginvoice:${invoice.id}`,
      data: { amount: invoice.amount, currency: invoice.currency, seats: invoice.seats, months: invoice.months },
      link: invoicePath(invoice.token),
    }).catch(() => {})));
}

export type ApplyInvoiceResult =
  | { ok: true; alreadyProcessed: boolean; invoiceId: string }
  | { ok: false; reason: string };

/**
 * Apply a successful Paystack payment to its invoice: set the seats and move
 * the end date forward by the months bought (from today, or from the current
 * end date when it's still in the future). Safe to call more than once for
 * the same payment (return page + webhook).
 */
export async function applyInvoicePayment(tx: PaystackTransaction): Promise<ApplyInvoiceResult> {
  if (tx.status !== 'success') return { ok: false, reason: 'Payment not successful' };
  const invoiceId = isInvoicePayment(tx);
  if (!invoiceId) return { ok: false, reason: 'Not an organisation payment' };

  const invoice = await db.organizationInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { ok: false, reason: 'Invoice not found' };
  if (invoice.reference === tx.reference) return { ok: true, alreadyProcessed: true, invoiceId };
  if (invoice.status !== 'open') {
    // e.g. two people paid the same link: the second payment needs a refund
    console.error(`[billing] Payment ${tx.reference} received for invoice ${invoice.id}, which is already ${invoice.status}. Refund it in the Paystack dashboard if needed.`);
    return { ok: false, reason: `Invoice is ${invoice.status}` };
  }
  if (tx.currency !== invoice.currency || tx.amount < invoice.amount) {
    console.error(`[billing] Payment ${tx.reference} does not match invoice ${invoice.id}: paid ${tx.amount} ${tx.currency}, expected ${invoice.amount} ${invoice.currency}`);
    return { ok: false, reason: 'Payment amount does not match the invoice' };
  }

  const paidAt = new Date(tx.paid_at || tx.created_at || Date.now());
  const result = await db.$transaction(async (trx) => {
    // Only one of the return page and the webhook gets to mark it paid
    const claimed = await trx.organizationInvoice.updateMany({
      where: { id: invoice.id, status: 'open' },
      data: { status: 'paid', reference: tx.reference, paid_at: paidAt, payment_method: tx.channel || 'card' },
    });
    if (!claimed.count) return null;

    let accessUntil: Date | null = null;
    if (invoice.organization_id) {
      const org = await trx.organization.findUnique({ where: { id: invoice.organization_id }, select: { ends_at: true } });
      if (org) {
        const now = new Date();
        let end = org.ends_at && org.ends_at > now ? org.ends_at : now;
        for (let i = 0; i < invoice.months; i++) end = addPeriod(end, 'monthly');
        accessUntil = end;
        await trx.organization.update({
          where: { id: invoice.organization_id },
          data: { seats: invoice.seats, ends_at: end, status: 'active' },
          select: { id: true },
        });
      }
    }
    await trx.organizationInvoice.update({ where: { id: invoice.id }, data: { access_until: accessUntil } });
    return { accessUntil };
  });
  if (!result) {
    // Someone else's payment got there first
    const now = await db.organizationInvoice.findUnique({ where: { id: invoice.id }, select: { reference: true } });
    if (now?.reference === tx.reference) return { ok: true, alreadyProcessed: true, invoiceId };
    console.error(`[billing] Payment ${tx.reference} received for invoice ${invoice.id}, which another payment already paid. Refund it in the Paystack dashboard if needed.`);
    return { ok: false, reason: 'Invoice is paid' };
  }

  // Organisation owners/admins and the Hassify admins hear about it
  const people = new Set([...(invoice.organization_id ? await managerIds(invoice.organization_id) : []), ...(await siteAdminIds())]);
  await Promise.all([...people].map((id) =>
    createNotification(id, {
      type: 'org_paid',
      key: `orgpaid:${invoice.id}`,
      data: {
        organization: invoice.organization_name,
        amount: invoice.amount,
        currency: invoice.currency,
        seats: invoice.seats,
        until: result.accessUntil?.toISOString() ?? null,
      },
      link: '/organization',
    }).catch(() => {})));

  return { ok: true, alreadyProcessed: false, invoiceId };
}

/**
 * For owners and admins: a reminder when their organisation's access ends
 * within two weeks. Runs when their notifications load, once per end date.
 */
export async function remindOrgRenewal(userId: string, now = new Date()) {
  const membership = await db.organizationMember.findUnique({
    where: { user_id: userId },
    select: { role: true, organization: { select: { id: true, name: true, ends_at: true, status: true } } },
  });
  const org = membership?.organization;
  if (!org || !MANAGER_ROLES.includes(membership.role) || org.status !== 'active' || !org.ends_at) return;
  const left = org.ends_at.getTime() - now.getTime();
  if (left <= 0 || left > REMINDER_DAYS * DAY) return;

  await createNotification(userId, {
    type: 'org_ending',
    key: `orgending:${org.id}:${org.ends_at.toISOString()}`,
    data: { organization: org.name, date: org.ends_at.toISOString() },
    link: '/organization',
  });
}
