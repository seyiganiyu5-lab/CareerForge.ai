/**
 * Google OAuth 2.0 utility for the custom auth system.
 *
 * Flow:
 * 1. GET /api/auth/google  → redirects user to Google's consent screen
 * 2. User authorizes → Google redirects to /api/auth/google/callback?code=...&state=...
 * 3. Callback exchanges code for tokens, fetches user profile, creates/links account
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID     — from Google Cloud Console (OAuth 2.0 Client ID)
 *   GOOGLE_CLIENT_SECRET — from Google Cloud Console (OAuth 2.0 Client Secret)
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const SCOPES = [
  'openid',
  'email',
  'profile',
].join(' ');

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  locale?: string;
}

/**
 * Generate the Google OAuth authorization URL.
 * @param redirectUri - The callback URL that Google will redirect back to
 * @param state - CSRF protection token (random string stored in cookie)
 */
export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured. Set it in your .env file.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access/refresh tokens.
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${errorData}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
    id_token?: string;
  }>;
}

/**
 * Fetch the user's Google profile using an access token.
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(`${GOOGLE_USERINFO_URL}?access_token=${accessToken}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google user info: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GoogleUserInfo>;
}

/**
 * Parse the user's first and last name from Google's name field.
 * Google provides `given_name` and `family_name` directly, but they may be empty.
 */
export function parseGoogleName(userInfo: GoogleUserInfo): { firstName: string; lastName: string } {
  let firstName = userInfo.given_name || '';
  let lastName = userInfo.family_name || '';

  // Fallback: split the full name if individual names are empty
  if (!firstName && !lastName && userInfo.name) {
    const parts = userInfo.name.trim().split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  return { firstName, lastName };
}