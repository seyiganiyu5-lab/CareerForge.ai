import type { User } from './types';
import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically random token string.
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Convert a Prisma user record to a safe User object (strips password_hash).
 */
export function stripPasswordHash(user: Record<string, unknown>): User {
  const { password_hash: _, ...safeUser } = user;
  return safeUser as unknown as User;
}