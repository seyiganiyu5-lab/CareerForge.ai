import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/auth/profile';
import { validateEmail } from '@/lib/auth/utils';

/**
 * PUT /api/auth/verify-email — resend the confirmation email.
 * The confirmation link itself is handled by /auth/confirm.
 */
export async function PUT(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase() ?? '';

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${getSiteUrl(request)}/auth/confirm?next=${encodeURIComponent('/verify-email?verified=1')}`,
      },
    });

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Please wait a minute before requesting another email.' },
        { status: 429 }
      );
    }
    if (error) {
      console.error('Resend verification error:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email needs verification, a new email has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
