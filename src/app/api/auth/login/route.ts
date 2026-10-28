import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { ensureProfile, toPublicUser } from '@/lib/auth/profile';
import { validateEmail } from '@/lib/auth/utils';
import type { AuthResponse, LoginCredentials } from '@/lib/auth/types';
import { isAdminEmail } from '@/lib/admin';
import { notifyAdminSignIn } from '@/lib/admin-audit';

function fail(error: string, status: number, extra?: Partial<AuthResponse>) {
  return NextResponse.json({ success: false, error, ...extra } satisfies AuthResponse, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as LoginCredentials;

    if (!email || !password) {
      return fail('Email and password are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return fail('Invalid email format', 400);
    }

    const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.code === 'email_not_confirmed') {
        return fail('Please confirm your email first. Check your inbox for the link.', 403, {
          needsVerification: true,
        });
      }
      if (error.status === 429) {
        return fail('Too many attempts. Please wait a minute and try again.', 429);
      }
      return fail('Invalid email or password', 401);
    }

    const profile = await ensureProfile(data.user);
    if (isAdminEmail(profile.email)) await notifyAdminSignIn({ userId: profile.id, email: profile.email }, 'password');
    return NextResponse.json({ success: true, user: toPublicUser(profile) } satisfies AuthResponse);
  } catch (error) {
    console.error('Login error:', error);
    return fail('An unexpected error occurred during login', 500);
  }
}
