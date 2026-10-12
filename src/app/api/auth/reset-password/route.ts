import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, validatePasswordStrength, hashPassword } from '@/lib/auth/utils';
import type { PasswordResetResponse } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token?: string; password?: string };

    // Validate required fields
    if (!token || !password) {
      const response: PasswordResetResponse = { success: false, error: 'Token and new password are required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const sanitizedToken = sanitizeInput(token);
    const sanitizedPassword = sanitizeInput(password);

    // Validate password strength
    const strength = validatePasswordStrength(sanitizedPassword);
    if (strength.score < 60) {
      const response: PasswordResetResponse = {
        success: false,
        error: 'Password is too weak. It must meet at least 3 of the following: 8+ characters, uppercase, lowercase, number, special character.',
      };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Find user by reset token
    const user = await db.user.findFirst({
      where: { reset_token: sanitizedToken },
    });

    if (!user) {
      const response: PasswordResetResponse = { success: false, error: 'Invalid or expired reset token' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if token is expired
    if (!user.reset_token_expires || user.reset_token_expires < new Date()) {
      // Clear expired token
      await db.user.update({
        where: { id: user.id },
        data: { reset_token: null, reset_token_expires: null },
      });
      const response: PasswordResetResponse = { success: false, error: 'Reset token has expired. Please request a new one.' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Hash new password
    const hashedPassword = await hashPassword(sanitizedPassword);

    // Update user: set new password, clear reset token fields
    await db.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    const response: PasswordResetResponse = {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };

    return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Reset password error:', error);
    const response: PasswordResetResponse = { success: false, error: 'An unexpected error occurred' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}