import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/auth/google';
import { randomBytes } from 'crypto';

/**
 * GET /api/auth/google
 *
 * Initiates the Google OAuth 2.0 flow:
 * 1. Generates a CSRF state token and stores it in a cookie
 * 2. Redirects the browser to Google's consent screen
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'google_not_configured');
      return NextResponse.redirect(loginUrl);
    }

    // Build the callback URL from the current request origin
    const origin = request.headers.get('origin') || request.headers.get('x-forwarded-host')
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host') || request.headers.get('host')}`
      : new URL(request.url).origin;

    const redirectUri = `${origin}/api/auth/google/callback`;

    // Generate CSRF state token
    const state = randomBytes(32).toString('hex');

    // Redirect to Google
    const googleUrl = getGoogleAuthUrl(redirectUri, state);

    const response = NextResponse.redirect(googleUrl);

    // Store state in a cookie for CSRF verification in the callback
    response.cookies.set('google-oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/google/callback',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }
}