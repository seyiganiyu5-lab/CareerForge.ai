import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { validatePasswordStrength } from '@/lib/auth/utils';

/**
 * POST /api/auth/change-password — change the signed-in user's password.
 * The current password is checked first.
 */
export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Please fill in both password fields.' }, { status: 400 });
    }
    if (validatePasswordStrength(newPassword).score < 60) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password is too weak. Use at least 8 characters with a mix of upper and lower case letters, numbers or symbols.',
        },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ success: false, error: 'Your new password must be different from your current one.' }, { status: 400 });
    }

    const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const hasPassword = user.identities?.some(i => i.provider === 'email') ?? false;
    if (!hasPassword) {
      return NextResponse.json(
        { success: false, error: 'You signed in with Google, so there is no password to change.' },
        { status: 400 }
      );
    }

    // Confirm the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      if (signInError.status === 429) {
        return NextResponse.json({ success: false, error: 'Too many attempts. Please wait a minute and try again.' }, { status: 429 });
      }
      return NextResponse.json({ success: false, error: 'Your current password is incorrect.' }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Change password error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Your password has been changed.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
