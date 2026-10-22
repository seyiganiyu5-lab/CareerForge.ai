import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ORG_STATUSES } from '@/lib/enterprise/organizations';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  seats: z.number().int().min(1).max(100_000).optional(),
  ends_at: z.string().date().nullable().optional(),
  status: z.enum(ORG_STATUSES).optional(),
});

/** PATCH /api/admin/organizations/:id — seats, end date, name or status (site admins only) */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
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
  return NextResponse.json({ success: true, organization });
}
