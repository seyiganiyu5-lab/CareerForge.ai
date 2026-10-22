import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { ORG_ROLES, requireOrgManager } from '@/lib/enterprise/organizations';

async function findMember(id: string, organizationId: string) {
  return db.organizationMember.findFirst({ where: { id, organization_id: organizationId } });
}

/** PATCH /api/organization/members/:id { role } — owners only; not your own role */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, membership, error } = await requireOrgManager();
  if (error) return error;
  if (membership.role !== 'owner') return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const { role } = await request.json().catch(() => ({}));
  if (!(ORG_ROLES as readonly string[]).includes(role)) return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });

  const member = await findMember(id, membership.organization_id);
  if (!member) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  if (member.user_id === auth.userId) return NextResponse.json({ success: false, error: 'own_role' }, { status: 400 });

  await db.organizationMember.update({ where: { id }, data: { role } });
  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/organization/members/:id — remove someone; their seat is freed
 * and they go back to their own plan. Admins can only remove members.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth, membership, error } = await requireOrgManager();
  if (error) return error;

  const { id } = await params;
  const member = await findMember(id, membership.organization_id);
  if (!member) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  if (member.user_id === auth.userId) return NextResponse.json({ success: false, error: 'use_leave' }, { status: 400 });
  if (membership.role !== 'owner' && member.role !== 'member') {
    return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });
  }

  await db.organizationMember.delete({ where: { id } });
  await createNotification(member.user_id, {
    type: 'org_removed',
    key: `orgremoved:${member.id}`,
    data: { organization: membership.organization.name },
    link: '/billing',
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
