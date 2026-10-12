import { NextRequest, NextResponse } from 'next/server';
import type { AuthResponse } from '@/lib/auth/types';

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      } satisfies AuthResponse,
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    response.cookies.set('cf-auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const body: AuthResponse = { success: false, error: 'An unexpected error occurred during logout' };
    return NextResponse.json(body, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}