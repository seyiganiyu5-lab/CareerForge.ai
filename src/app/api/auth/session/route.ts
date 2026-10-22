import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile, toPublicUser } from '@/lib/auth/profile';
import type { AuthResponse } from '@/lib/auth/types';
import { isAdminEmail } from '@/lib/admin';

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
    return NextResponse.json({ success: true, user: { ...toPublicUser(profile), is_admin: isAdminEmail(profile.email) } } satisfies AuthResponse);
  } catch (error) {
    // Usually the database can't be reached (ensureProfile)
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: 'unavailable' } satisfies AuthResponse, { status: 503 });
  }
}
