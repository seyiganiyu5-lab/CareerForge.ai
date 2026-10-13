import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/auth/profile';
import { validateEmail } from '@/lib/auth/utils';
import type { PasswordResetResponse } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' } satisfies PasswordResetResponse, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' } satisfies PasswordResetResponse, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${getSiteUrl(request)}/auth/confirm?next=/reset-password`,
    });

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute and try again.' } satisfies PasswordResetResponse,
        { status: 429 }
      );
    }
    if (error) {
      console.error('Forgot password error:', error);
    }

    // Same answer whether or not the account exists, so emails can't be probed
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    } satisfies PasswordResetResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' } satisfies PasswordResetResponse, { status: 500 });
  }
}
