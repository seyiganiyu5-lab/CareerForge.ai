import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_SIGN_IN_TIMEOUT_MS } from '@/lib/supabase/fetch-with-timeout';
import { ensureProfile, toPublicUser, getSiteUrl } from '@/lib/auth/profile';
import { sanitizeInput, validateEmail, validatePasswordStrength } from '@/lib/auth/utils';
import type { AuthResponse, SignupData } from '@/lib/auth/types';

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error } satisfies AuthResponse, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword, agreeToTerms } = body as SignupData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return fail('All fields are required', 400);
    }
    if (!agreeToTerms) {
      return fail('You must agree to the terms and conditions', 400);
    }

    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return fail('Invalid email format', 400);
    }
    if (sanitizedFirstName.length < 1 || sanitizedFirstName.length > 50) {
      return fail('First name must be between 1 and 50 characters', 400);
    }
    if (sanitizedLastName.length < 1 || sanitizedLastName.length > 50) {
      return fail('Last name must be between 1 and 50 characters', 400);
    }
    if (validatePasswordStrength(password).score < 60) {
      return fail(
        'Password is too weak. It must meet at least 3 of the following: 8+ characters, uppercase, lowercase, number, special character.',
        400
      );
    }
    if (password !== confirmPassword) {
      return fail('Passwords do not match', 400);
    }

    const supabase = await createClient({ timeoutMs: SUPABASE_SIGN_IN_TIMEOUT_MS });
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl(request)}/auth/confirm?next=${encodeURIComponent('/verify-email?verified=1')}`,
        data: { first_name: sanitizedFirstName, last_name: sanitizedLastName },
      },
    });

    if (error) {
      if (error.code === 'user_already_exists') {
        return fail('An account with this email already exists', 409);
      }
      if (error.code === 'weak_password') {
        return fail(error.message, 400);
      }
      if (error.status === 429) {
        return fail('Too many attempts. Please wait a minute and try again.', 429);
      }
      console.error('Signup error:', error);
      return fail('An unexpected error occurred during signup', 500);
    }

    // With email confirmation on, Supabase hides existing accounts by returning
    // a user without identities instead of an error.
    if (!data.user || data.user.identities?.length === 0) {
      return fail('An account with this email already exists', 409);
    }

    const profile = await ensureProfile(data.user);

    // No session means the user must confirm their email first
    if (!data.session) {
      return NextResponse.json(
        {
          success: true,
          needsVerification: true,
          message: 'Check your email to confirm your account.',
        } satisfies AuthResponse,
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: true, user: toPublicUser(profile), message: 'Account created successfully.' } satisfies AuthResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return fail('An unexpected error occurred during signup', 500);
  }
}
