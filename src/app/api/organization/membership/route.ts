import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';

/** DELETE /api/organization/membership — leave your organisation */
export async function DELETE() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const membership = await db.organizationMember.findUnique({ where: { user_id: auth.userId } });
  if (!membership) return NextResponse.json({ success: false, error: 'not_member' }, { status: 404 });

  // Someone has to stay in charge
  if (membership.role === 'owner') {
    const owners = await db.organizationMember.count({ where: { organization_id: membership.organization_id, role: 'owner' } });
    if (owners <= 1) return NextResponse.json({ success: false, error: 'last_owner' }, { status: 400 });
  }

  await db.organizationMember.delete({ where: { id: membership.id } });
  return NextResponse.json({ success: true });
}
