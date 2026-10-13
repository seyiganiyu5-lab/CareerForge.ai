import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/auth/profile';

/**
 * GET /api/auth/google — start Google sign-in through Supabase Auth.
 */
export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(request);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/confirm?next=/home`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error('Google sign-in error:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', siteUrl));
  }

  return NextResponse.redirect(data.url);
}
