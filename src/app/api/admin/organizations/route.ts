import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ORG_TYPES } from '@/lib/enterprise/leads';
import { createInvites, newInviteCode } from '@/lib/enterprise/organizations';

const createSchema = z.object({
  name: z.string().trim().min(2).max(160),
  org_type: z.enum(ORG_TYPES),
  seats: z.number().int().min(1).max(100_000),
  ends_at: z.string().date().nullable().optional(),
  owner_email: z.email().max(200),
  lead_id: z.string().max(64).nullable().optional(),
});

/** GET /api/admin/organizations — every organisation with its seat use (site admins only) */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const orgs = await db.organization.findMany({
    orderBy: { created_at: 'desc' },
    take: 500,
    include: {
      _count: { select: { members: true, invites: { where: { expires_at: { gt: now } } } } },
      members: { where: { role: 'owner' }, take: 3, select: { user: { select: { email: true } } } },
    },
  });
  return NextResponse.json({
    success: true,
    organizations: orgs.map(({ _count, members, ...o }) => ({
      ...o,
      members_count: _count.members,
      pending_count: _count.invites,
      owners: members.map((m) => m.user.email),
    })),
  });
}

/**
 * POST /api/admin/organizations — set up a customer's organisation. The owner
 * joins straight away when they already have an account and aren't in another
 * organisation; otherwise they get a personal invite link.
 */
export async function POST(request: NextRequest) {
  const { auth, error } = await requireAdmin();
  if (error) return error;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'invalid', fields: parsed.error.issues.map((i) => i.path[0]) }, { status: 400 });
  }
  const { name, org_type, seats, ends_at, owner_email, lead_id } = parsed.data;
  const email = owner_email.toLowerCase();

  const owner = await db.user.findUnique({ where: { email }, include: { organizationMembership: true } });
  if (owner?.organizationMembership) {
    return NextResponse.json({ success: false, error: 'owner_in_other_org' }, { status: 409 });
  }

  const org = await db.organization.create({
    data: {
      name, org_type, seats,
      // End of that day
      ends_at: ends_at ? new Date(`${ends_at}T23:59:59.999Z`) : null,
      invite_code: newInviteCode(),
      lead_id: lead_id || null,
    },
  });

  let ownerInvite: { token: string } | null = null;
  if (owner) {
    await db.organizationMember.create({ data: { organization_id: org.id, user_id: owner.id, role: 'owner' } });
  } else {
    const result = await createInvites(org, [email], 'owner', auth.userId);
    ownerInvite = result.created?.[0] ?? null;
  }

  if (lead_id) {
    await db.enterpriseLead.update({ where: { id: lead_id }, data: { status: 'won' } }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    organization: org,
    owner_joined: !!owner,
    owner_invite_path: ownerInvite ? `/join/${ownerInvite.token}` : null,
  });
}
