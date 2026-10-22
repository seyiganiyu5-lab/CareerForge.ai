import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/enterprise/leads';

/** GET /api/admin/leads?status=new — Enterprise requests, newest first (admins only) */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = request.nextUrl.searchParams.get('status');
  const where = status && (LEAD_STATUSES as readonly string[]).includes(status) ? { status: status as LeadStatus } : {};
  const [leads, counts] = await Promise.all([
    db.enterpriseLead.findMany({ where, orderBy: { created_at: 'desc' }, take: 200 }),
    db.enterpriseLead.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  return NextResponse.json({
    success: true,
    leads,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
  });
}
