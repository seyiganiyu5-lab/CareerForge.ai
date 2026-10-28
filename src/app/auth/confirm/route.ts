import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { ensureProfile, getSiteUrl } from '@/lib/auth/profile';
import { isAdminEmail } from '@/lib/admin';
import { notifyAdminSignIn } from '@/lib/admin-audit';

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

  const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
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
    if (user) {
      const profile = await ensureProfile(user);
      // Google sign-in (code) to an admin account
      if (code && isAdminEmail(profile.email)) await notifyAdminSignIn({ userId: profile.id, email: profile.email }, 'google');
    }
    return NextResponse.redirect(new URL(next, siteUrl));
  }

  const reason = failureReason(error, searchParams);
  console.error(`Auth confirm error (${reason}):`, describe(error, searchParams), HINTS[reason]);
  return NextResponse.redirect(new URL(failurePath(next, searchParams.get('error'), reason), siteUrl));
}

type FailureReason = 'timeout' | 'provider' | 'verifier' | 'other';

// Printed in the server log next to the error, to help fix the setup
const HINTS: Record<FailureReason, string> = {
  timeout: 'Supabase did not answer in time: check the internet connection, or that the Supabase project is not paused.',
  provider: 'Supabase could not complete sign-in with Google: check the Google Client ID and Client Secret in Supabase → Authentication → Sign In / Providers → Google.',
  verifier: 'Sign-in was finished in a different browser or address than it was started in (e.g. localhost vs 127.0.0.1). Open the site at NEXT_PUBLIC_APP_URL and try again.',
  other: '',
};

function failureReason(error: unknown, params: URLSearchParams): FailureReason {
  if (params.get('error')) return 'provider';
  const e = error as { name?: string; message?: string; status?: number } | null;
  const text = `${e?.name ?? ''} ${e?.message ?? ''}`.toLowerCase();
  if (text.includes('retryable') || text.includes('timeout') || text.includes('abort') || text.includes('fetch failed')) return 'timeout';
  if (text.includes('code verifier') || text.includes('code_verifier') || text.includes('pkce')) return 'verifier';
  return 'other';
}

function describe(error: unknown, params: URLSearchParams) {
  const fromUrl = params.get('error');
  if (fromUrl) return { error: fromUrl, code: params.get('error_code'), description: params.get('error_description') };
  const e = error as { name?: string; message?: string; status?: number; code?: string } | string;
  return typeof e === 'string' ? e : { name: e?.name, message: e?.message, status: e?.status, code: e?.code };
}

/** Only allow redirects to paths on this site. */
function safeNext(next: string | null, type: EmailOtpType | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) return next;
  if (type === 'recovery') return '/reset-password';
  if (type === 'signup' || type === 'email') return '/verify-email?verified=1';
  return '/home';
}

function failurePath(next: string, oauthError: string | null, reason: FailureReason): string {
  if (next.startsWith('/reset-password')) return '/reset-password?error=invalid_link';
  if (next.startsWith('/verify-email')) return '/verify-email?error=invalid_link';
  if (oauthError === 'access_denied') return '/login?error=google_access_denied';
  return `/login?error=${reason === 'timeout' ? 'google_timeout' : 'google_auth_failed'}`;
}
