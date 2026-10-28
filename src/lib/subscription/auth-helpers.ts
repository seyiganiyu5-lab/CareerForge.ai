/**
 * Server-side auth helper: get the signed-in user for an API route.
 */
import { createClient } from '@/lib/supabase/server';

export async function getAuthUser(_request?: Request) {
  const supabase = await createClient();
  // Verifies the session token locally (no network trip on projects using
  // Supabase JWT signing keys). The user's profile row is created at
  // sign-in and on every app load via /api/auth/session.
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  return {
    userId: claims.sub,
    email: (claims.email as string) ?? '',
    // 'aal2' once the person has entered a two-step verification code in this session
    aal: (claims.aal as string) ?? 'aal1',
  };
}
