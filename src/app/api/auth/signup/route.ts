import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, validateEmail, validatePasswordStrength, hashPassword, createToken } from '@/lib/auth/utils';
import { generateToken, stripPasswordHash } from '@/lib/auth/helpers';
import { initializeUsage } from '@/lib/subscription/service';
import type { AuthResponse, SignupData, CareerGoal } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword, agreeToTerms } = body as SignupData;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      const response: AuthResponse = { success: false, error: 'All fields are required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      const response: AuthResponse = { success: false, error: 'You must agree to the terms and conditions' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      const response: AuthResponse = { success: false, error: 'Invalid email format' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate name lengths
    if (sanitizedFirstName.length < 1 || sanitizedFirstName.length > 50) {
      const response: AuthResponse = { success: false, error: 'First name must be between 1 and 50 characters' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (sanitizedLastName.length < 1 || sanitizedLastName.length > 50) {
      const response: AuthResponse = { success: false, error: 'Last name must be between 1 and 50 characters' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate password strength
    const strength = validatePasswordStrength(password);
    if (strength.score < 60) {
      const response: AuthResponse = {
        success: false,
        error: 'Password is too weak. It must meet at least 3 of the following: 8+ characters, uppercase, lowercase, number, special character.',
      };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      const response: AuthResponse = { success: false, error: 'Passwords do not match' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email: sanitizedEmail } });
    if (existingUser) {
      const response: AuthResponse = { success: false, error: 'An account with this email already exists' };
      return NextResponse.json(response, { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateToken();

    // Create user
    const user = await db.user.create({
      data: {
        email: sanitizedEmail,
        first_name: sanitizedFirstName,
        last_name: sanitizedLastName,
        password_hash: hashedPassword,
        verification_token: verificationToken,
      },
    });

    // Initialize free plan subscription + usage
    await initializeUsage(user.id).catch(err => {
      console.error('Failed to initialize usage for user:', err);
    });

    // Create JWT and set cookie so the user is logged in immediately
    const token = await createToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        success: true,
        user: stripPasswordHash(user as unknown as Record<string, unknown>),
        message: 'Account created successfully.',
      } satisfies AuthResponse,
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

    response.cookies.set('cf-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    const response: AuthResponse = { success: false, error: 'An unexpected error occurred during signup' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}