import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAdminEmail } from '@/lib/admin';

/** The signed-in admin, or the 401/403 response to send back. */
export async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  if (!isAdminEmail(auth.email)) return { error: NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 }) };
  return { auth };
}
