import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createInvites, requireOrgManager } from '@/lib/enterprise/organizations';

const MAX_AT_ONCE = 200;

const inviteSchema = z.object({
  // Pasted list: commas, semicolons, spaces or new lines between addresses
  emails: z.string().max(20_000),
  role: z.enum(['member', 'admin']).default('member'),
});

/** POST /api/organization/invites — personal invite links for a list of emails (owners/admins) */
export async function POST(request: NextRequest) {
  const { auth, membership, error } = await requireOrgManager();
  if (error) return error;

  const parsed = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });

  const list = parsed.data.emails.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
  const invalid = list.filter((e) => !z.email().safeParse(e).success);
  if (!list.length || invalid.length) {
    return NextResponse.json({ success: false, error: 'invalid_emails', invalid: invalid.slice(0, 10) }, { status: 400 });
  }
  if (list.length > MAX_AT_ONCE) {
    return NextResponse.json({ success: false, error: 'too_many', max: MAX_AT_ONCE }, { status: 400 });
  }

  const result = await createInvites(membership.organization, list, parsed.data.role, auth.userId);
  if (result.error) return NextResponse.json({ success: false, error: result.error, free: result.free }, { status: 409 });

  return NextResponse.json({
    success: true,
    created: result.created!.map((i) => ({ id: i.id, email: i.email, path: `/join/${i.token}` })),
    skipped: result.skipped,
  });
}
