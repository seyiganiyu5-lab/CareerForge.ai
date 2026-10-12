import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput, verifyToken } from '@/lib/auth/utils';
import { stripPasswordHash } from '@/lib/auth/helpers';
import type { AuthResponse, OnboardingData } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('cf-auth-token')?.value;
    if (!token) {
      const response: AuthResponse = { success: false, error: 'unauthorized' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response: AuthResponse = { success: false, error: 'unauthorized' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Find user
    const existingUser = await db.user.findUnique({ where: { id: payload.userId } });
    if (!existingUser) {
      const response: AuthResponse = { success: false, error: 'unauthorized' };
      return NextResponse.json(response, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, country, jobTitle, careerLevel, careerGoals } = body as OnboardingData;

    // Validate required fields
    if (!firstName || !lastName || !country || !jobTitle || !careerLevel || !careerGoals || careerGoals.length === 0) {
      const response: AuthResponse = { success: false, error: 'All onboarding fields are required' };
      return NextResponse.json(response, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedCountry = sanitizeInput(country);
    const sanitizedJobTitle = sanitizeInput(jobTitle);
    const sanitizedCareerLevel = sanitizeInput(careerLevel);
    const sanitizedCareerGoals = careerGoals.map((goal) => sanitizeInput(goal));

    // Store careerGoals as JSON string
    const careerGoalJson = JSON.stringify(sanitizedCareerGoals);

    // Update user with onboarding data
    const updatedUser = await db.user.update({
      where: { id: existingUser.id },
      data: {
        first_name: sanitizedFirstName,
        last_name: sanitizedLastName,
        country: sanitizedCountry,
        job_title: sanitizedJobTitle,
        career_level: sanitizedCareerLevel,
        career_goal: careerGoalJson,
        onboarding_completed: true,
      },
    });

    const response: AuthResponse = {
      success: true,
      user: stripPasswordHash(updatedUser as unknown as Record<string, unknown>),
      message: 'Onboarding completed successfully.',
    };

    return NextResponse.json(response, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Onboarding error:', error);
    const response: AuthResponse = { success: false, error: 'An unexpected error occurred during onboarding' };
    return NextResponse.json(response, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}