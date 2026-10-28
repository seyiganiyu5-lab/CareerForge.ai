import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAdminEmail } from '@/lib/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/admin-audit';

/**
 * POST /api/auth/mfa/verify { code, factor_id? } — check a 6-digit code from
 * the authenticator app. On success this session can open the admin pages.
 * factor_id is only sent when finishing the first set-up.
 */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!isAdminEmail(auth.email)) return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });

  // Guessing codes: 5 tries every 5 minutes
  if (!rateLimit(`mfa:${auth.userId}`, { maxRequests: 5, windowMs: 5 * 60_000 }).success) {
    return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code.replace(/\s/g, '') : '';
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ success: false, error: 'invalid_code' }, { status: 400 });

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.[0];
  const pending = (factors?.all ?? []).find((f) => f.id === body.factor_id && f.factor_type === 'totp' && f.status !== 'verified');
  const factor = verified ?? pending;
  if (!factor) return NextResponse.json({ success: false, error: 'not_enrolled' }, { status: 400 });

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    await logAdminAction(auth, 'admin.mfa_failed', { type: 'account' });
    return NextResponse.json({ success: false, error: 'wrong_code' }, { status: 400 });
  }

  await logAdminAction(auth, verified ? 'admin.verified' : 'admin.mfa_enrolled', { type: 'account' });
  return NextResponse.json({ success: true });
}
