import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, validateEmail } from '@/lib/auth/utils';
import { generateToken, stripPasswordHash } from '@/lib/auth/helpers';
import type { AuthResponse } from '@/lib/auth/types';

// POST: Verify email with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body as { token?: string };

    if (!token) {
      const response: AuthResponse = { success: false, error: 'Verification token is required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const sanitizedToken = sanitizeInput(token);

    // Find user by verification token
    const user = await db.user.findFirst({
      where: { verification_token: sanitizedToken },
    });

    if (!user) {
      const response: AuthResponse = { success: false, error: 'Invalid verification token' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if already verified
    if (user.email_verified) {
      const response: AuthResponse = {
        success: true,
        user: stripPasswordHash(user as unknown as Record<string, unknown>),
        message: 'Email is already verified.',
      };
      return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Mark email as verified and clear verification token
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        verification_token: null,
      },
    });

    const response: AuthResponse = {
      success: true,
      user: stripPasswordHash(updatedUser as unknown as Record<string, unknown>),
      message: 'Email verified successfully.',
    };

    return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Email verification error:', error);
    const response: AuthResponse = { success: false, error: 'An unexpected error occurred during email verification' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// PUT: Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      const response: AuthResponse = { success: false, error: 'Email is required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    if (!validateEmail(sanitizedEmail)) {
      const response: AuthResponse = { success: false, error: 'Invalid email format' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      const response: AuthResponse = { success: false, error: 'No account found with that email' };
      return NextResponse.json(response, { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if already verified
    if (user.email_verified) {
      const response: AuthResponse = { success: false, error: 'Email is already verified' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Regenerate verification token
    const newVerificationToken = generateToken();

    await db.user.update({
      where: { id: user.id },
      data: {
        verification_token: newVerificationToken,
      },
    });

    // In production, you would send an email with the verification link here.
    console.log(`Verification token for ${sanitizedEmail}: ${newVerificationToken}`);

    const response: AuthResponse = {
      success: true,
      message: 'Verification email has been resent. Please check your inbox.',
    };

    return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Resend verification error:', error);
    const response: AuthResponse = { success: false, error: 'An unexpected error occurred' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}