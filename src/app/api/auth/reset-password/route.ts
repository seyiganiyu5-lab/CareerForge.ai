import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePasswordStrength } from '@/lib/auth/utils';
import type { PasswordResetResponse } from '@/lib/auth/types';

/**
 * Set a new password. The user arrives here signed in from the reset link
 * (see /auth/confirm), so the session identifies them.
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' } satisfies PasswordResetResponse, { status: 400 });
    }
    if (validatePasswordStrength(password).score < 60) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password is too weak. It must meet at least 3 of the following: 8+ characters, uppercase, lowercase, number, special character.',
        } satisfies PasswordResetResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'This reset link is invalid or has expired. Please request a new one.' } satisfies PasswordResetResponse,
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      if (error.code === 'same_password') {
        return NextResponse.json(
          { success: false, error: 'Your new password must be different from your old one.' } satisfies PasswordResetResponse,
          { status: 400 }
        );
      }
      console.error('Reset password error:', error);
      return NextResponse.json({ success: false, error: error.message } satisfies PasswordResetResponse, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' } satisfies PasswordResetResponse);
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' } satisfies PasswordResetResponse, { status: 500 });
  }
}
