import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, validateEmail, verifyPassword, createToken } from '@/lib/auth/utils';
import { stripPasswordHash } from '@/lib/auth/helpers';
import type { AuthResponse, LoginCredentials } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body as LoginCredentials;

    // Validate required fields
    if (!email || !password) {
      const response: AuthResponse = { success: false, error: 'Email and password are required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    if (!validateEmail(sanitizedEmail)) {
      const response: AuthResponse = { success: false, error: 'Invalid email format' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      const response: AuthResponse = { success: false, error: 'Invalid email or password' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify password
    // Google OAuth users have empty password_hash — reject email/password login
    if (!user.password_hash) {
      const response: AuthResponse = { success: false, error: 'This account uses Google sign-in. Please use the Google button to sign in.' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      const response: AuthResponse = { success: false, error: 'Invalid email or password' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Create JWT token
    const token = await createToken({ userId: user.id, email: user.email });

    // Set cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days in seconds
    const response = NextResponse.json(
      {
        success: true,
        user: stripPasswordHash(user as unknown as Record<string, unknown>),
        message: !user.email_verified ? 'Login successful. Please verify your email address.' : 'Login successful.',
      } satisfies AuthResponse,
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    response.cookies.set('cf-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = { success: false, error: 'An unexpected error occurred during login' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}