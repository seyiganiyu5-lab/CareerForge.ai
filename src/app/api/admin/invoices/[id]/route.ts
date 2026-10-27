import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/** PATCH /api/admin/invoices/:id { status: 'cancelled' } — cancel an unpaid payment request (site admins only) */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body?.status !== 'cancelled') return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });

  // Paid ones stay as they are
  const { count } = await db.organizationInvoice.updateMany({ where: { id, status: 'open' }, data: { status: 'cancelled' } });
  if (!count) return NextResponse.json({ success: false, error: 'not_open' }, { status: 409 });
  return NextResponse.json({ success: true });
}
