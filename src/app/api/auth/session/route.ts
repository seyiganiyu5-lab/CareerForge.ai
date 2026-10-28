import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile, toPublicUser } from '@/lib/auth/profile';
import type { AuthResponse } from '@/lib/auth/types';
import { isAdminEmail } from '@/lib/admin';
import { membershipFor, notifyPendingInvites } from '@/lib/enterprise/organizations';
import { brandingOf } from '@/lib/enterprise/branding';
import { adminMfaState } from '@/lib/auth/mfa';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Supabase unreachable or timed out: we don't know, which is not "signed out"
    if (error && (!error.status || error.status >= 500 || error.name === 'AuthRetryableFetchError')) {
      console.error('Session check failed (Supabase unreachable):', error.message);
      return NextResponse.json({ success: false, error: 'unavailable' } satisfies AuthResponse, { status: 503 });
    }

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'unauthorized' } satisfies AuthResponse, { status: 401 });
    }

    const profile = await ensureProfile(user);
    const isAdmin = isAdminEmail(profile.email);
    const [membership, mfa] = await Promise.all([
      membershipFor(profile.id),
      isAdmin ? adminMfaState(supabase).catch(() => 'needs_code' as const) : null,
    ]);
    // Someone invited by email before they had an account sees the invite now
    if (!membership) await notifyPendingInvites(profile.id, profile.email).catch(() => {});
    return NextResponse.json({
      success: true,
      user: {
        ...toPublicUser(profile),
        is_admin: isAdmin,
        // Admin pages need the authenticator code too
        ...(isAdmin ? { admin_mfa: mfa ?? 'needs_code' } : {}),
        organization: membership
          ? { id: membership.organization.id, name: membership.organization.name, role: membership.role, ...brandingOf(membership.organization) }
          : null,
      },
    } satisfies AuthResponse);
  } catch (error) {
    // Usually the database can't be reached (ensureProfile)
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: 'unavailable' } satisfies AuthResponse, { status: 503 });
  }
}
