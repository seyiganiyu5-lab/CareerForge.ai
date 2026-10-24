import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logoUrl } from '@/lib/enterprise/branding';
import { joinProblem, joinWithCode, resolveJoinCode } from '@/lib/enterprise/organizations';

type Params = { params: Promise<{ code: string }> };

/** GET /api/join/:code — which organisation a join link is for, and whether this user can join */
export async function GET(request: Request, { params }: Params) {
  const limited = rateLimit(`join:${getClientIp(request)}`, { maxRequests: 30, windowMs: 60_000 });
  if (!limited.success) return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });

  const { code } = await params;
  const target = await resolveJoinCode(code);
  if (!target) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

  const user = await getAuthUser();
  const problem = await joinProblem(target, user);
  return NextResponse.json({
    success: true,
    organization: target.organization.name,
    logo_url: logoUrl(target.organization),
    kind: target.kind,
    // Lets the page say which address the invite is for
    invite_email: target.invite?.email ?? null,
    signed_in: !!user,
    problem,
  });
}

/** POST /api/join/:code — join the organisation */
export async function POST(request: Request, { params }: Params) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const limited = rateLimit(`join-post:${user.userId}`, { maxRequests: 10, windowMs: 60_000 });
  if (!limited.success) return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });

  const { code } = await params;
  const result = await joinWithCode(code, user);
  if (result.error) return NextResponse.json({ success: false, error: result.error }, { status: 409 });
  return NextResponse.json({ success: true, organization: result.organization!.name });
}
