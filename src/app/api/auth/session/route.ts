import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, decodeTokenUnsafe, createToken } from '@/lib/auth/utils';
import { stripPasswordHash } from '@/lib/auth/helpers';
import type { AuthResponse } from '@/lib/auth/types';

const TOKEN_COOKIE_NAME = 'cf-auth-token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function buildAuthResponse(
  user: Record<string, unknown>,
  newToken?: string
): NextResponse<AuthResponse> {
  const body: AuthResponse = {
    success: true,
    user: stripPasswordHash(user),
  };

  const response = NextResponse.json(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  if (newToken) {
    response.cookies.set(TOKEN_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    });
  }

  return response;
}

function unauthorizedResponse(): NextResponse<AuthResponse> {
  return NextResponse.json(
    { success: false, error: 'unauthorized' } satisfies AuthResponse,
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return unauthorizedResponse();
    }

    // 1. Try normal verification first
    const payload = await verifyToken(token);

    if (payload) {
      // Token is valid — find user and return
      const user = await db.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return unauthorizedResponse();
      }

      return buildAuthResponse(user as unknown as Record<string, unknown>);
    }

    // 2. Token verification failed (expired, secret changed, etc.)
    //    Try to decode it unsafely to extract userId for silent refresh
    const decoded = decodeTokenUnsafe(token);

    if (!decoded) {
      // Token is completely malformed — can't recover
      return unauthorizedResponse();
    }

    // 3. We have a userId from the expired/malformed token.
    //    Verify the user still exists in the DB, then issue a fresh token.
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Issue a fresh token
    const freshToken = await createToken({
      userId: user.id,
      email: user.email,
    });

    console.log(`[auth] Silent token refresh for ${user.email}`);

    return buildAuthResponse(
      user as unknown as Record<string, unknown>,
      freshToken
    );
  } catch (error) {
    console.error('Session error:', error);
    return unauthorizedResponse();
  }
}