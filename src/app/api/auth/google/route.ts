import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { getSiteUrl } from '@/lib/auth/profile';

/**
 * GET /api/auth/google — start Google sign-in through Supabase Auth.
 */
export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(request);

  // Google sends people back to siteUrl, and the browser keeps the sign-in
  // cookie for the address it started on (localhost ≠ 127.0.0.1), so start there
  const site = new URL(siteUrl);
  // (only once: behind a proxy the host we see may never match)
  if (site.host !== (request.headers.get('x-forwarded-host') ?? request.headers.get('host')) && !request.nextUrl.searchParams.has('moved')) {
    return NextResponse.redirect(new URL('/api/auth/google?moved=1', site));
  }

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/confirm?next=/home`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error('Google sign-in error:', error);
    const slow = /retryable|timeout|abort|fetch failed/i.test(`${error?.name} ${error?.message}`);
    return NextResponse.redirect(new URL(`/login?error=${slow ? 'google_timeout' : 'google_auth_failed'}`, siteUrl));
  }

  return NextResponse.redirect(data.url);
}
