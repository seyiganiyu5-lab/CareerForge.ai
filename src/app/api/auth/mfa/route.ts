import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAdminEmail } from '@/lib/admin';
import { logAdminAction } from '@/lib/admin-audit';
import { adminMfaState } from '@/lib/auth/mfa';

/** GET /api/auth/mfa — two-step verification status (admins) */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!isAdminEmail(auth.email)) return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.[0] ?? null;
  return NextResponse.json({
    success: true,
    state: await adminMfaState(supabase),
    factor: factor ? { id: factor.id, created_at: factor.created_at } : null,
  });
}

/**
 * DELETE /api/auth/mfa — remove the authenticator app (admins, only right
 * after entering a code). Used when moving to a new phone: remove, then set up again.
 */
export async function DELETE() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!isAdminEmail(auth.email)) return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });
  if (auth.aal !== 'aal2') return NextResponse.json({ success: false, error: 'mfa_required' }, { status: 403 });

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
  const { data } = await supabase.auth.mfa.listFactors();
  for (const f of data?.all ?? []) {
    if (f.factor_type === 'totp') await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  await logAdminAction(auth, 'admin.mfa_removed', { type: 'account' });
  return NextResponse.json({ success: true });
}
