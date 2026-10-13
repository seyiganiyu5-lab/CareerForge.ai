import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile, getSiteUrl } from '@/lib/auth/profile';

/**
 * GET /auth/confirm — landing point for links from Supabase:
 * email confirmation, password reset, and Google sign-in.
 *
 * Handles both link styles Supabase can send:
 *   ?token_hash=...&type=...   (works in any browser)
 *   ?code=...                  (must be opened in the browser that asked for it)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = getSiteUrl(request);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'), type);

  const supabase = await createClient();
  let error: unknown = searchParams.get('error');

  if (!error && tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else if (!error && code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (!error) {
    error = 'missing_token';
  }

  if (!error) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await ensureProfile(user);
    return NextResponse.redirect(new URL(next, siteUrl));
  }

  console.error('Auth confirm error:', error);
  return NextResponse.redirect(new URL(failurePath(next, searchParams.get('error')), siteUrl));
}

/** Only allow redirects to paths on this site. */
function safeNext(next: string | null, type: EmailOtpType | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) return next;
  if (type === 'recovery') return '/reset-password';
  if (type === 'signup' || type === 'email') return '/verify-email?verified=1';
  return '/home';
}

function failurePath(next: string, oauthError: string | null): string {
  if (next.startsWith('/reset-password')) return '/reset-password?error=invalid_link';
  if (next.startsWith('/verify-email')) return '/verify-email?error=invalid_link';
  return `/login?error=${oauthError === 'access_denied' ? 'google_access_denied' : 'google_auth_failed'}`;
}
