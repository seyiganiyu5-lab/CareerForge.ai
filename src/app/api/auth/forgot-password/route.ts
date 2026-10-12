import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, validateEmail } from '@/lib/auth/utils';
import { generateToken } from '@/lib/auth/helpers';
import type { PasswordResetResponse } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    // Validate email field
    if (!email) {
      const response: PasswordResetResponse = { success: false, error: 'Email is required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    if (!validateEmail(sanitizedEmail)) {
      const response: PasswordResetResponse = { success: false, error: 'Invalid email format' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: sanitizedEmail } });

    if (user) {
      // Generate reset token and set expiration to 1 hour from now
      const resetToken = generateToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires,
        },
      });

      // In production, you would send an email with the reset link here.
      console.log(`Password reset token for ${sanitizedEmail}: ${resetToken}`);
    }

    // Always return success for security (don't reveal whether email exists)
    const response: PasswordResetResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Forgot password error:', error);
    const response: PasswordResetResponse = { success: false, error: 'An unexpected error occurred' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}