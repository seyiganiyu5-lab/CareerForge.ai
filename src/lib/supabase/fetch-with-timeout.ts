/**
 * fetch for the Supabase clients that gives up after a few seconds, so a
 * slow or unreachable Supabase (bad network, paused project) can't make
 * every page and API request hang.
 */
export const SUPABASE_FETCH_TIMEOUT_MS = 4_000;

/**
 * Signing in, signing up and finishing Google sign-in happen once, while
 * the person waits on purpose, so they get longer on a slow connection.
 */
export const SUPABASE_SIGN_IN_TIMEOUT_MS = 15_000;

export function fetchWithTimeoutOf(ms: number): typeof fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(ms);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetch(input, { ...init, signal });
  };
}

export const fetchWithTimeout = fetchWithTimeoutOf(SUPABASE_FETCH_TIMEOUT_MS);
