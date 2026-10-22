import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { LEAD_STATUSES } from '@/lib/enterprise/leads';

/** PATCH /api/admin/leads/:id { status } — follow up on a request (admins only) */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ success: false, error: 'invalid_status' }, { status: 400 });
  }
  const lead = await db.enterpriseLead.update({ where: { id }, data: { status } }).catch(() => null);
  if (!lead) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ success: true, lead });
}
