import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { createNotification } from '@/lib/notifications';

export const ORG_ROLES = ['owner', 'admin', 'member'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];
export const MANAGER_ROLES: readonly string[] = ['owner', 'admin'];
export const ORG_STATUSES = ['active', 'suspended'] as const;

/** Personal invites stay valid this long */
export const INVITE_DAYS = 14;

export const newInviteCode = () => randomBytes(8).toString('base64url');
export const newInviteToken = () => randomBytes(24).toString('base64url');

/** Members get the Enterprise plan only while this is true */
export function isOrgActive(org: { status: string; ends_at: Date | null }, now = new Date()) {
  return org.status === 'active' && (!org.ends_at || org.ends_at > now);
}

/** Seats taken by members and by personal invites that are still valid */
export async function seatUsage(organizationId: string, now = new Date()) {
  const [members, pending] = await Promise.all([
    db.organizationMember.count({ where: { organization_id: organizationId } }),
    db.organizationInvite.count({ where: { organization_id: organizationId, expires_at: { gt: now } } }),
  ]);
  return { members, pending, used: members + pending };
}

export function membershipFor(userId: string) {
  return db.organizationMember.findUnique({ where: { user_id: userId }, include: { organization: true } });
}

/** The signed-in owner/admin of an organisation, or the 401/403 response to send back. */
export async function requireOrgManager() {
  const auth = await getAuthUser();
  if (!auth) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const membership = await membershipFor(auth.userId);
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    return { error: NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 }) };
  }
  return { auth, membership };
}

/** Tell people who already have an account about invites waiting for them. */
export async function notifyPendingInvites(userId: string, email: string) {
  const invites = await db.organizationInvite.findMany({
    where: { email: email.toLowerCase(), expires_at: { gt: new Date() } },
    include: { organization: { select: { name: true } } },
    take: 5,
  });
  await Promise.all(invites.map((invite) =>
    createNotification(userId, {
      type: 'org_invite',
      key: `orginvite:${invite.id}`,
      data: { organization: invite.organization.name },
      link: `/join/${invite.token}`,
    })));
}

/**
 * Create personal invites for these emails (lowercased, duplicates and
 * current members skipped). Fails with 'no_seats' when there aren't enough
 * free seats for all of them.
 */
export async function createInvites(
  org: { id: string; name: string; seats: number },
  emails: string[],
  role: OrgRole,
  invitedBy: string | null,
) {
  const wanted = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const now = new Date();
  const [members, existing] = await Promise.all([
    db.organizationMember.findMany({ where: { organization_id: org.id, user: { email: { in: wanted } } }, select: { user: { select: { email: true } } } }),
    db.organizationInvite.findMany({ where: { organization_id: org.id, email: { in: wanted } } }),
  ]);
  const memberEmails = new Set(members.map((m) => m.user.email.toLowerCase()));
  const valid = new Set(existing.filter((i) => i.expires_at > now).map((i) => i.email));
  const fresh = wanted.filter((e) => !memberEmails.has(e) && !valid.has(e));

  const { used } = await seatUsage(org.id, now);
  if (used + fresh.length > org.seats) return { error: 'no_seats' as const, free: Math.max(org.seats - used, 0) };

  const expires_at = new Date(now.getTime() + INVITE_DAYS * 86_400_000);
  const created: Awaited<ReturnType<typeof db.organizationInvite.upsert>>[] = [];
  for (const email of fresh) {
    // Replaces an expired invite for the same email
    created.push(await db.organizationInvite.upsert({
      where: { organization_id_email: { organization_id: org.id, email } },
      create: { organization_id: org.id, email, role, token: newInviteToken(), invited_by: invitedBy, expires_at },
      update: { role, token: newInviteToken(), invited_by: invitedBy, expires_at, created_at: now },
    }));
  }

  // People who already have an account see the invite in their notifications
  const users = await db.user.findMany({ where: { email: { in: fresh } }, select: { id: true, email: true } });
  await Promise.all(users.map((u) => notifyPendingInvites(u.id, u.email).catch(() => {})));

  return { created, skipped: wanted.length - fresh.length };
}

export type JoinError = 'not_found' | 'expired' | 'inactive' | 'link_disabled' | 'no_seats' | 'wrong_email' | 'other_org' | 'already_member';

/** What a /join/<code> link points to: a personal invite token or an organisation's link code */
export async function resolveJoinCode(code: string) {
  if (!code || code.length > 64) return null;
  const invite = await db.organizationInvite.findUnique({ where: { token: code }, include: { organization: true } });
  if (invite) return { kind: 'invite' as const, invite, organization: invite.organization };
  const organization = await db.organization.findUnique({ where: { invite_code: code } });
  return organization ? { kind: 'link' as const, invite: null, organization } : null;
}

/** Why this user can't join with this code right now, or null when they can */
export async function joinProblem(
  target: NonNullable<Awaited<ReturnType<typeof resolveJoinCode>>>,
  user: { userId: string; email: string } | null,
): Promise<JoinError | null> {
  const { organization, invite } = target;
  const now = new Date();
  if (!isOrgActive(organization, now)) return 'inactive';
  if (invite && invite.expires_at <= now) return 'expired';
  if (!invite && !organization.invite_link_enabled) return 'link_disabled';
  if (user) {
    const membership = await db.organizationMember.findUnique({ where: { user_id: user.userId } });
    if (membership) return membership.organization_id === organization.id ? 'already_member' : 'other_org';
    if (invite && invite.email !== user.email.toLowerCase()) return 'wrong_email';
  }
  // A personal invite already holds its seat
  if (!invite) {
    const { used } = await seatUsage(organization.id, now);
    if (used >= organization.seats) return 'no_seats';
  }
  return null;
}

/** Add the user to the organisation the code points to */
export async function joinWithCode(code: string, user: { userId: string; email: string }) {
  const target = await resolveJoinCode(code);
  if (!target) return { error: 'not_found' as JoinError };
  const problem = await joinProblem(target, user);
  if (problem) return { error: problem };

  const { organization, invite } = target;
  const member = await db.$transaction(async (tx) => {
    const created = await tx.organizationMember.create({
      data: { organization_id: organization.id, user_id: user.userId, role: invite?.role ?? 'member' },
    });
    if (invite) await tx.organizationInvite.delete({ where: { id: invite.id } });
    // The user's own email may also have a personal invite from this organisation
    await tx.organizationInvite.deleteMany({ where: { organization_id: organization.id, email: user.email.toLowerCase() } });
    return created;
  }).catch(() => null);
  // Unique user_id: joined somewhere else at the same moment
  if (!member) return { error: 'other_org' as JoinError };

  const [profile, managers] = await Promise.all([
    db.user.findUnique({ where: { id: user.userId }, select: { first_name: true, last_name: true, email: true } }),
    db.organizationMember.findMany({ where: { organization_id: organization.id, role: { in: [...MANAGER_ROLES] }, user_id: { not: user.userId } }, select: { user_id: true } }),
  ]);
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || user.email;
  await Promise.all(managers.map((m) =>
    createNotification(m.user_id, {
      type: 'org_joined',
      key: `orgjoin:${member.id}`,
      data: { name, organization: organization.name },
      link: '/organization',
    }).catch(() => {})));

  return { organization, member };
}
