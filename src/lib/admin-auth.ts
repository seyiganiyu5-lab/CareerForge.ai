import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAdminEmail } from '@/lib/admin';

/**
 * Admin pages also need the code from the admin's authenticator app
 * (two-step verification), so a stolen password alone isn't enough.
 * ADMIN_MFA="off" turns that off: only for emergencies, e.g. a lost phone.
 */
export function adminMfaRequired() {
  return process.env.ADMIN_MFA?.trim().toLowerCase() !== 'off';
}

/** The signed-in admin, or the 401/403 response to send back. */
export async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  if (!isAdminEmail(auth.email)) return { error: NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 }) };
  if (adminMfaRequired() && auth.aal !== 'aal2') {
    return { error: NextResponse.json({ success: false, error: 'mfa_required' }, { status: 403 }) };
  }
  return { auth };
}
