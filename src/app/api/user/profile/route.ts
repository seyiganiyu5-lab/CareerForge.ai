import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        auth_provider: true,
        google_picture_url: true,
        country: true,
        job_title: true,
        career_level: true,
        career_goal: true,
        language: true,
        theme: true,
        email_verified: true,
        onboarding_completed: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, country, job_title, career_level, career_goal } = body;

    // Validate career_level if provided
    const validLevels = ['student', 'graduate', 'professional', 'freelancer', 'career_changer'];
    if (career_level && !validLevels.includes(career_level)) {
      return NextResponse.json({ success: false, error: 'Invalid career level' }, { status: 400 });
    }

    // Validate career_goal if provided
    const validGoals = ['build_resume', 'create_cover_letter', 'improve_resume', 'track_applications', 'find_jobs'];
    if (career_goal && !validGoals.includes(career_goal)) {
      return NextResponse.json({ success: false, error: 'Invalid career goal' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: auth.userId },
      data: {
        ...(first_name !== undefined && { first_name: first_name.trim() || null }),
        ...(last_name !== undefined && { last_name: last_name.trim() || null }),
        ...(country !== undefined && { country: country.trim() || null }),
        ...(job_title !== undefined && { job_title: job_title.trim() || null }),
        ...(career_level !== undefined && { career_level }),
        ...(career_goal !== undefined && { career_goal }),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        auth_provider: true,
        google_picture_url: true,
        country: true,
        job_title: true,
        career_level: true,
        career_goal: true,
        language: true,
        theme: true,
        email_verified: true,
        onboarding_completed: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}