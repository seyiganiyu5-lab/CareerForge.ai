import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgManager } from '@/lib/enterprise/organizations';
import { invoicePath } from '@/lib/enterprise/invoices';

/** GET /api/organization/invoices — your organisation's payment requests and payments (owners/admins) */
export async function GET() {
  const { membership, error } = await requireOrgManager();
  if (error) return error;
  const invoices = await db.organizationInvoice.findMany({
    where: { organization_id: membership.organization_id, status: { in: ['open', 'paid'] } },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
  return NextResponse.json({
    success: true,
    seats: membership.organization.seats,
    ends_at: membership.organization.ends_at,
    invoices: invoices.map((i) => ({
      id: i.id, seats: i.seats, months: i.months, unit_price: i.unit_price, amount: i.amount, currency: i.currency,
      note: i.note, status: i.status, paid_at: i.paid_at, access_until: i.access_until, created_at: i.created_at,
      path: i.status === 'open' ? invoicePath(i.token) : null,
    })),
  });
}
