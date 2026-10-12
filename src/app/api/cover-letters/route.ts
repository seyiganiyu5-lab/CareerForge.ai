import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';

/**
 * GET /api/cover-letters — List all cover letters
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const letters = await db.coverLetter.findMany({
      where: { user_id: auth.userId },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        title: true,
        template: true,
        status: true,
        language: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ success: true, coverLetters: letters });
  } catch (error) {
    console.error('Cover letters fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cover letters' }, { status: 500 });
  }
}

/**
 * POST /api/cover-letters — Create a cover letter
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.CREATE_COVER_LETTER);
    if (!access.allowed) {
      if (access.reason === 'limit_reached') {
        return NextResponse.json(
          { success: false, error: 'limit_reached', planName: access.planName, limit: access.limit, used: access.used },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { success: false, error: 'This feature is not available on your plan' },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      title?: string;
      data_json?: string;
      template?: string;
      language?: string;
    };

    // Fetch user profile for sender info
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { first_name: true, last_name: true, email: true, country: true },
    });

    const defaultData = {
      fullName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      email: user?.email || '',
      phone: '',
      address: user?.country || '',
      linkedIn: '',
      website: '',
      hiringManager: '',
      companyName: '',
      companyAddress: '',
      jobTitle: '',
      jobDescription: '',
      salutation: 'Dear Hiring Manager,',
      opening: '',
      body: '',
      closing: '',
      signOff: 'Sincerely,',
      language: body.language || 'en',
      tone: 'professional',
      date: new Date().toISOString().split('T')[0],
    };

    const coverLetter = await db.coverLetter.create({
      data: {
        user_id: auth.userId,
        title: body.title || 'Untitled Cover Letter',
        data_json: body.data_json || JSON.stringify(defaultData),
        template: body.template || 'professional',
        language: body.language || 'en',
      },
    });

    return NextResponse.json({ success: true, coverLetter });
  } catch (error) {
    console.error('Cover letter create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create cover letter' }, { status: 500 });
  }
}
