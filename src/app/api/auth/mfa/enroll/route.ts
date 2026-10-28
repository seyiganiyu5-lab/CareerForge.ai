import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAdminEmail } from '@/lib/admin';

/**
 * POST /api/auth/mfa/enroll — start setting up the authenticator app
 * (admins). Returns the QR code to scan and the key to type in instead.
 * Nothing is switched on until a first code is verified.
 */
export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!isAdminEmail(auth.email)) return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp?.length) return NextResponse.json({ success: false, error: 'already_enrolled' }, { status: 409 });

  // A set-up that was started but never finished
  for (const f of factors?.all ?? []) {
    if (f.factor_type === 'totp' && f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Hassify',
    friendlyName: `Hassify admin ${new Date().toISOString().slice(0, 10)}`,
  });
  if (error || !data) {
    console.error('MFA enroll failed:', error?.message);
    // Usually: two-step verification (TOTP) is turned off in the Supabase project
    return NextResponse.json({ success: false, error: 'enroll_failed' }, { status: 502 });
  }
  return NextResponse.json({ success: true, factor_id: data.id, qr_code: data.totp.qr_code, secret: data.totp.secret });
}
