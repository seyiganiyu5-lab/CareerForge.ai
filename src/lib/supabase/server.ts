import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_FETCH_TIMEOUT_MS, fetchWithTimeoutOf } from './fetch-with-timeout';

/**
 * Supabase client for Server Components and Route Handlers.
 * Reads and refreshes the user's session from cookies.
 * Pass a longer timeout for sign-in steps (SUPABASE_SIGN_IN_TIMEOUT_MS).
 */
export async function createClient({ timeoutMs = SUPABASE_FETCH_TIMEOUT_MS }: { timeoutMs?: number } = {}) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeoutOf(timeoutMs) },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes the session instead.
          }
        },
      },
    }
  );
}
