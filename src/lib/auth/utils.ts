import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import type { User } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'careerforge-ai-dev-secret-key-2025-change-in-production'
);

export async function createToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token WITHOUT verification.
 * Used to extract userId/email from an expired token for silent refresh.
 * Returns null if the token is malformed or missing required fields.
 */
export function decodeTokenUnsafe(token: string): { userId: string; email: string } | null {
  try {
    const payload = decodeJwt(token);
    if (payload?.userId && payload?.email) {
      return { userId: payload.userId as string, email: payload.email as string };
    }
    return null;
  } catch {
    return null;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string): {
  score: number;
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
} {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  const score = Math.min(100, (metCount / 5) * 100);

  return { score, requirements };
}

export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'veryWeak', color: 'bg-destructive' };
  if (score <= 40) return { label: 'weak', color: 'bg-orange-500' };
  if (score <= 60) return { label: 'fair', color: 'bg-yellow-500' };
  if (score <= 80) return { label: 'strong', color: 'bg-emerald' };
  return { label: 'veryStrong', color: 'bg-emerald-500' };
}

// Simple hash for password storage (bcrypt would be better in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'cf-salt-2025'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}