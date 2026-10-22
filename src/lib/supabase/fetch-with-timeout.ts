/**
 * fetch for the Supabase clients that gives up after a few seconds, so a
 * slow or unreachable Supabase (bad network, paused project) can't make
 * every page and API request hang.
 */
export const SUPABASE_FETCH_TIMEOUT_MS = 4_000;

export const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};
