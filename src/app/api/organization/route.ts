import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { MANAGER_ROLES, isOrgActive, membershipFor, newInviteCode, requireOrgManager, seatUsage } from '@/lib/enterprise/organizations';

/**
 * GET /api/organization — the signed-in user's organisation. Owners and
 * admins also get the members, pending invites and the join link. People
 * who aren't in one get the invites waiting for their email.
 */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const membership = await membershipFor(auth.userId);
  if (!membership) {
    const invites = await db.organizationInvite.findMany({
      where: { email: auth.email.toLowerCase(), expires_at: { gt: new Date() } },
      include: { organization: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({
      success: true,
      organization: null,
      invites: invites.map((i) => ({ organization: i.organization.name, path: `/join/${i.token}`, expires_at: i.expires_at })),
    });
  }

  const org = membership.organization;
  const base = {
    id: org.id,
    name: org.name,
    org_type: org.org_type,
    ends_at: org.ends_at,
    active: isOrgActive(org),
    role: membership.role,
    joined_at: membership.joined_at,
  };
  if (!MANAGER_ROLES.includes(membership.role)) {
    return NextResponse.json({ success: true, organization: base });
  }

  const now = new Date();
  const [members, invites, usage] = await Promise.all([
    db.organizationMember.findMany({
      where: { organization_id: org.id },
      orderBy: { joined_at: 'asc' },
      select: { id: true, role: true, joined_at: true, user_id: true, user: { select: { first_name: true, last_name: true, email: true } } },
    }),
    db.organizationInvite.findMany({
      where: { organization_id: org.id, expires_at: { gt: now } },
      orderBy: { created_at: 'desc' },
      select: { id: true, email: true, role: true, token: true, expires_at: true, created_at: true },
    }),
    seatUsage(org.id, now),
  ]);

  return NextResponse.json({
    success: true,
    organization: {
      ...base,
      seats: org.seats,
      seats_used: usage.used,
      invite_link_enabled: org.invite_link_enabled,
      invite_path: `/join/${org.invite_code}`,
      members: members.map(({ user, user_id, ...m }) => ({
        ...m,
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        email: user.email,
        is_you: user_id === auth.userId,
      })),
      invites: invites.map(({ token, ...i }) => ({ ...i, path: `/join/${token}` })),
    },
  });
}

/** PATCH /api/organization { invite_link_enabled?, regenerate_link? } — the shareable join link (owners/admins) */
export async function PATCH(request: NextRequest) {
  const { membership, error } = await requireOrgManager();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const data: { invite_link_enabled?: boolean; invite_code?: string } = {};
  if (typeof body.invite_link_enabled === 'boolean') data.invite_link_enabled = body.invite_link_enabled;
  // The old link stops working
  if (body.regenerate_link === true) data.invite_code = newInviteCode();
  if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });

  const org = await db.organization.update({ where: { id: membership.organization_id }, data });
  return NextResponse.json({ success: true, invite_link_enabled: org.invite_link_enabled, invite_path: `/join/${org.invite_code}` });
}
