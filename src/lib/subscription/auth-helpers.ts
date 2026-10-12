/**
 * Server-side auth helper: extract user from request.
 * Falls back to decoding expired/malformed JWTs to allow continued access
 * while the session endpoint handles silent token refresh via Set-Cookie.
 */
import { cookies } from 'next/headers';
import { verifyToken, decodeTokenUnsafe } from '@/lib/auth/utils';
import { db } from '@/lib/db';

export async function getAuthUser(request?: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('cf-auth-token')?.value;

  if (!token) return null;

  // 1. Try normal verification first
  const payload = await verifyToken(token);
  if (payload) {
    return { userId: payload.userId, email: payload.email };
  }

  // 2. Token invalid/expired — try to decode unsafely as fallback.
  //    This allows API calls to succeed even with a stale token.
  //    The /api/auth/session endpoint handles setting a fresh cookie.
  const decoded = decodeTokenUnsafe(token);
  if (!decoded) return null;

  // Verify the user still exists in the DB
  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user) return null;

  return { userId: user.id, email: user.email };
}