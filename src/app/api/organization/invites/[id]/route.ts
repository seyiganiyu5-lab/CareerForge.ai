import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgManager } from '@/lib/enterprise/organizations';

/** DELETE /api/organization/invites/:id — cancel an invite and free its seat (owners/admins) */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { membership, error } = await requireOrgManager();
  if (error) return error;

  const { id } = await params;
  const { count } = await db.organizationInvite.deleteMany({ where: { id, organization_id: membership.organization_id } });
  if (!count) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
