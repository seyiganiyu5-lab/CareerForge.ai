import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/** GET /api/admin/activity?kind=signin|org|invoice|lead|security — latest admin activity (site admins only) */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const kind = request.nextUrl.searchParams.get('kind');
  const where =
    kind === 'signin' ? { action: 'admin.signin' }
      : kind === 'security' ? { action: { startsWith: 'admin.', not: 'admin.signin' } }
        : kind && ['org', 'invoice', 'lead'].includes(kind) ? { action: { startsWith: `${kind}.` } }
          : {};
  const entries = await db.adminAuditLog.findMany({ where, orderBy: { created_at: 'desc' }, take: 300 });
  return NextResponse.json({ success: true, entries });
}
