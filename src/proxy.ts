import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Every page in the (dashboard) route group, plus onboarding
const PROTECTED_ROUTES = [
  '/ats-checker',
  '/billing',
  '/cover-letters',
  '/dashboard',
  '/home',
  '/job-tracker',
  '/my-resumes',
  '/onboarding',
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

  // Verifies the session token (and refreshes it if expired)
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

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

  return response;
}

export const config = {
  // Run on pages only: skip API routes (they check the session themselves),
  // Next.js internals and static files.
  matcher: ['/((?!api|auth/confirm|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
};
