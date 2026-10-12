import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile, toPublicUser } from '@/lib/auth/profile';
import type { AuthResponse } from '@/lib/auth/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'unauthorized' } satisfies AuthResponse, { status: 401 });
    }

    const profile = await ensureProfile(user);
    return NextResponse.json({ success: true, user: toPublicUser(profile) } satisfies AuthResponse);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get session' } satisfies AuthResponse, { status: 500 });
  }
}
