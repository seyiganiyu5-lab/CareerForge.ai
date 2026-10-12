import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

const VALID_THEMES = ['light', 'dark', 'system'];
const VALID_LANGUAGES = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh'];

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { theme: true, language: true, email: true, first_name: true, last_name: true, created_at: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        theme: user.theme,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme, language } = body;

    if (theme !== undefined && !VALID_THEMES.includes(theme)) {
      return NextResponse.json({ success: false, error: 'Invalid theme' }, { status: 400 });
    }

    if (language !== undefined && !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ success: false, error: 'Invalid language' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: auth.userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
      },
      select: { theme: true, language: true },
    });

    return NextResponse.json({ success: true, settings: updatedUser });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}