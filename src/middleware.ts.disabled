import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'careerforge-ai-dev-secret-key-2025-change-in-production'
);

const PROTECTED_ROUTES = [
  '/dashboard',
  '/resume-builder',
  '/cover-letter',
  '/job-tracker',
  '/settings',
  '/billing',
];

const AUTH_ROUTES = ['/login', '/signup'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isOnboardingRoute(pathname: string): boolean {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}

async function verifyAuthCookie(
  request: NextRequest
): Promise<{ userId: string; email: string } | null> {
  const token = request.cookies.get('cf-auth-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await verifyAuthCookie(request);

  // 1. Protected routes: require authentication
  if (isProtectedRoute(pathname)) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Onboarding route: allow if not authenticated or if authenticated (page handles redirect)
  //    The middleware only blocks unauthenticated users from bypassing login entirely
  //    (onboarding is considered semi-public — the page itself checks onboarding_completed)
  if (isOnboardingRoute(pathname)) {
    // If authenticated, the onboarding page itself will redirect to dashboard if needed
    // We just let everyone through to onboarding
    return NextResponse.next();
  }

  // 3. Auth routes: redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. All other routes: allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resume-builder/:path*',
    '/cover-letter/:path*',
    '/job-tracker/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/login',
    '/signup',
    '/onboarding',
    '/onboarding/:path*',
  ],
};