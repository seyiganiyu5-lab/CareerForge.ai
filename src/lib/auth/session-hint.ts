/**
 * A small "who is signed in" hint the proxy works out from the session token
 * and passes to the page render, so the header can show the account menu
 * straight away instead of waiting for /api/auth/session in the browser.
 * Display only: it is never used to authorise anything.
 */
export const SESSION_HINT_HEADER = 'x-cf-session';

export interface SessionHint {
  signedIn: boolean;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
}

type Claims = { sub?: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined;

export function hintFromClaims(claims: Claims): SessionHint {
  if (!claims?.sub) return { signedIn: false };
  const meta = claims.user_metadata ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const full = str(meta.full_name) ?? str(meta.name);
  return {
    signedIn: true,
    email: claims.email,
    first_name: str(meta.first_name) ?? str(meta.given_name) ?? full?.split(/\s+/)[0] ?? null,
    last_name: str(meta.last_name) ?? str(meta.family_name) ?? (full && full.includes(' ') ? full.split(/\s+/).slice(1).join(' ') : null),
  };
}

export function encodeHint(hint: SessionHint): string {
  return encodeURIComponent(JSON.stringify(hint));
}

export function decodeHint(value: string | null): SessionHint | null {
  if (!value) return null;
  try {
    const hint = JSON.parse(decodeURIComponent(value));
    return typeof hint?.signedIn === 'boolean' ? hint : null;
  } catch {
    return null;
  }
}
