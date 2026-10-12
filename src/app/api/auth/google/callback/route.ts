import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken } from '@/lib/auth/utils';
import { stripPasswordHash } from '@/lib/auth/helpers';
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
  parseGoogleName,
} from '@/lib/auth/google';

/** Build an external URL using forwarded headers for proxy compatibility */
function buildExternalUrl(request: NextRequest, path: string): URL {
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  return new URL(`${proto}://${host}${path}`);
}

/**
 * GET /api/auth/google/callback?code=...&state=...
 *
 * Handles the Google OAuth callback:
 * 1. Verifies CSRF state token
 * 2. Exchanges the authorization code for access tokens
 * 3. Fetches the user's Google profile
 * 4. Creates a new user or links to an existing account
 * 5. Issues a JWT cookie and redirects to dashboard/onboarding
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // User denied consent or Google returned an error
  if (error) {
    console.error('Google OAuth error:', error);
    const loginUrl = buildExternalUrl(request, '/login?error=google_access_denied');
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    const loginUrl = buildExternalUrl(request, '/login?error=google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  // Verify CSRF state
  const storedState = request.cookies.get('google-oauth-state')?.value;
  if (!storedState || storedState !== state) {
    console.error('Google OAuth state mismatch — possible CSRF attack');
    const loginUrl = buildExternalUrl(request, '/login?error=google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  // Build the callback URL (must match what was sent in the initial redirect)
  const origin = request.headers.get('origin') || request.headers.get('x-forwarded-host')
    ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host') || request.headers.get('host')}`
    : new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Fetch user profile from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      console.error('Google user has no email');
      const loginUrl = buildExternalUrl(request, '/login?error=google_no_email');
      return NextResponse.redirect(loginUrl);
    }

    const email = googleUser.email.toLowerCase().trim();
    const { firstName, lastName } = parseGoogleName(googleUser);

    // Check if user already exists (by email OR by google_id)
    const existingByEmail = await db.user.findUnique({ where: { email } });
    const existingByGoogleId = googleUser.id
      ? await db.user.findUnique({ where: { google_id: googleUser.id } })
      : null;

    let user;

    if (existingByEmail) {
      // Account exists — link Google if not already linked
      user = existingByEmail;

      if (!user.google_id && googleUser.id) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            google_id: googleUser.id,
            auth_provider: 'google',
            google_picture_url: googleUser.picture || null,
            // Fill in name if missing
            first_name: user.first_name || firstName || null,
            last_name: user.last_name || lastName || null,
            // Google-verified email is trusted
            email_verified: user.email_verified || googleUser.verified_email,
          },
        });
      }
    } else if (existingByGoogleId) {
      // Google account linked to a different email — update email
      user = await db.user.update({
        where: { id: existingByGoogleId.id },
        data: {
          email,
          first_name: existingByGoogleId.first_name || firstName || null,
          last_name: existingByGoogleId.last_name || lastName || null,
          google_picture_url: googleUser.picture || existingByGoogleId.google_picture_url || null,
          email_verified: true,
        },
      });
    } else {
      // Brand new user — create account
      user = await db.user.create({
        data: {
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          auth_provider: 'google',
          google_id: googleUser.id || null,
          google_picture_url: googleUser.picture || null,
          password_hash: '', // No password for OAuth users
          email_verified: googleUser.verified_email,
        },
      });
    }

    // Create JWT
    const token = await createToken({ userId: user.id, email: user.email });

    // Determine redirect target
    const redirectTo = user.onboarding_completed ? '/home' : '/onboarding';

    // Build redirect URL using forwarded headers for proxy compatibility
    const redirectUrl = buildExternalUrl(request, redirectTo);

    const response = NextResponse.redirect(redirectUrl);

    // Clear the CSRF state cookie
    response.cookies.delete('google-oauth-state');

    // Set the auth cookie (same as email/password login)
    response.cookies.set('cf-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days for OAuth sign-in
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    const loginUrl = buildExternalUrl(request, '/login?error=google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }
}