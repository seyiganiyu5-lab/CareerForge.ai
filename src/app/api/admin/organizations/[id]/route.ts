import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/admin-audit';
import { ORG_STATUSES } from '@/lib/enterprise/organizations';
import { createNotification } from '@/lib/notifications';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  seats: z.number().int().min(1).max(100_000).optional(),
  ends_at: z.string().date().nullable().optional(),
  status: z.enum(ORG_STATUSES).optional(),
});

/** PATCH /api/admin/organizations/:id — seats, end date, name or status (site admins only) */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });
  const { ends_at, ...rest } = parsed.data;

  const organization = await db.organization.update({
    where: { id },
    data: {
      ...rest,
      ...(ends_at !== undefined ? { ends_at: ends_at ? new Date(`${ends_at}T23:59:59.999Z`) : null } : {}),
    },
  }).catch(() => null);
  if (!organization) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
  const changes = [
    rest.name !== undefined && `name ${rest.name}`,
    rest.seats !== undefined && `seats ${rest.seats}`,
    ends_at !== undefined && `ends ${ends_at ?? 'never'}`,
    rest.status && (rest.status === 'active' ? 'resumed' : 'paused'),
  ].filter(Boolean).join(', ');
  await logAdminAction(auth, rest.status && Object.keys(parsed.data).length === 1 ? (rest.status === 'active' ? 'org.resume' : 'org.pause') : 'org.update',
    { type: 'organization', id, summary: `${organization.name} · ${changes}` });
  return NextResponse.json({ success: true, organization });
}

/**
 * DELETE /api/admin/organizations/:id — remove an organisation for good
 * (site admins only). Its members and pending invites go with it; members
 * go back to their own plan and keep their CVs, letters and applications.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const org = await db.organization.findUnique({
    where: { id },
    select: { id: true, name: true, members: { select: { id: true, user_id: true } } },
  });
  if (!org) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

  // Members and invites are deleted with it (ON DELETE CASCADE)
  await db.organization.delete({ where: { id }, select: { id: true } });

  await Promise.all(org.members.map((m) =>
    createNotification(m.user_id, {
      type: 'org_removed',
      key: `orgremoved:${m.id}`,
      data: { organization: org.name },
      link: '/billing',
    }).catch(() => {})));

  await logAdminAction(auth, 'org.delete', { type: 'organization', id, summary: `${org.name} · ${org.members.length} members removed` });
  return NextResponse.json({ success: true, removed_members: org.members.length });
}
