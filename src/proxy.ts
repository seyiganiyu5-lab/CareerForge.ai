import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SESSION_HINT_HEADER, encodeHint, hintFromClaims } from '@/lib/auth/session-hint';
import { fetchWithTimeout } from '@/lib/supabase/fetch-with-timeout';

// Longest a page waits for the session check before loading anyway
const SESSION_CHECK_TIMEOUT_MS = 4_500;

// Every page in the (dashboard) route group, plus onboarding
const PROTECTED_ROUTES = [
  '/admin',
  '/ats-checker',
  '/billing',
  '/cover-letters',
  '/dashboard',
  '/home',
  '/job-tracker',
  '/my-resumes',
  '/onboarding',
  '/organization',
  '/profile',
  '/resume-builder',
  '/resume-review',
  '/settings',
  '/templates',
];

const AUTH_ROUTES = ['/login', '/signup'];

function matches(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Refreshes the Supabase session cookie on each page request and
 * guards pages that need a signed-in user.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Verifies the session token (and refreshes it if expired). If Supabase
  // can't be reached in time, don't make the page wait: let it load and let
  // the page and its API calls check the session themselves.
  const check = await Promise.race([
    supabase.auth.getClaims().then(({ data }) => ({ known: true as const, claims: data?.claims })),
    new Promise<{ known: false }>((resolve) => setTimeout(() => resolve({ known: false }), SESSION_CHECK_TIMEOUT_MS)),
  ]).catch(() => ({ known: false as const }));
  const { pathname, search } = request.nextUrl;

  if (!check.known) {
    console.warn(`[auth] Supabase did not answer within ${SESSION_CHECK_TIMEOUT_MS / 1000}s; loading ${pathname} without the session check`);
    const headers = new Headers(request.headers);
    headers.delete(SESSION_HINT_HEADER);
    return NextResponse.next({ request: { headers } });
  }
  const data = { claims: check.claims };
  const isSignedIn = Boolean(data.claims?.sub);

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isSignedIn && matches(pathname, PROTECTED_ROUTES)) {
    return redirectTo(`/login?redirect=${encodeURIComponent(pathname + search)}`);
  }

  if (isSignedIn && matches(pathname, AUTH_ROUTES)) {
    return redirectTo('/home');
  }

  // Tell the page render who is signed in (always overwritten, so a browser
  // can't set it), keeping any refreshed session cookies
  const headers = new Headers(request.headers);
  headers.set(SESSION_HINT_HEADER, encodeHint(hintFromClaims(data?.claims as Parameters<typeof hintFromClaims>[0])));
  const next = NextResponse.next({ request: { headers } });
  response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
  return next;
}

export const config = {
  // Run on pages only: skip API routes (they check the session themselves),
  // Next.js internals and static files.
  matcher: ['/((?!api|auth/confirm|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
};
