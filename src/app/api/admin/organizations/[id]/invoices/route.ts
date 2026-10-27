import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { enabledCurrencies } from '@/lib/billing/currency';
import { MONTH_OPTIONS, invoicePath, newInvoiceToken, notifyInvoiceCreated } from '@/lib/enterprise/invoices';

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  seats: z.number().int().min(1).max(100_000),
  months: z.number().int().refine((m) => (MONTH_OPTIONS as readonly number[]).includes(m)),
  // Price per seat per month in the currency's main unit (e.g. 1500 for 1 500 F CFA)
  unit_price: z.number().positive().max(10_000_000),
  currency: z.string(),
  note: z.string().trim().max(500).optional(),
});

/** GET /api/admin/organizations/:id/invoices — payment requests for one organisation (site admins only) */
export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const invoices = await db.organizationInvoice.findMany({ where: { organization_id: id }, orderBy: { created_at: 'desc' }, take: 50 });
  return NextResponse.json({
    success: true,
    currencies: enabledCurrencies(),
    invoices: invoices.map(({ token, ...i }) => ({ ...i, path: invoicePath(token) })),
  });
}

/** POST /api/admin/organizations/:id/invoices — ask an organisation to pay for seats (site admins only) */
export async function POST(request: NextRequest, { params }: Params) {
  const { auth, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });
  const { seats, months, unit_price, currency, note } = parsed.data;
  if (!(enabledCurrencies() as string[]).includes(currency)) {
    return NextResponse.json({ success: false, error: 'currency_unavailable' }, { status: 400 });
  }

  const org = await db.organization.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!org) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

  const unit = Math.round(unit_price * 100); // subunits, like every other price
  const invoice = await db.organizationInvoice.create({
    data: {
      organization_id: org.id,
      organization_name: org.name,
      seats,
      months,
      unit_price: unit,
      amount: unit * seats * months,
      currency,
      note: note ?? '',
      token: newInvoiceToken(),
      created_by: auth.userId,
    },
  });
  await notifyInvoiceCreated(invoice).catch(() => {});

  const { token, ...rest } = invoice;
  return NextResponse.json({ success: true, invoice: { ...rest, path: invoicePath(token) } });
}
