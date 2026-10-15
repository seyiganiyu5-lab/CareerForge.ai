import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere, newDocTier } from '@/lib/subscription/documents';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/cover-letters/[id]/duplicate
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
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
        { success: false, error: 'upgrade_required' },
        { status: 403 },
      );
    }

    const { id } = await params;

    const original = await db.coverLetter.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });
    if (!original) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    const duplicated = await db.coverLetter.create({
      data: {
        user_id: auth.userId,
        plan_tier: await newDocTier(auth.userId),
        title: `${original.title} (Copy)`,
        data_json: original.data_json,
        template: original.template,
        customization_json: original.customization_json,
        language: original.language,
        status: 'draft',
      },
    });

    return NextResponse.json({ success: true, coverLetter: duplicated });
  } catch (error) {
    console.error('Cover letter duplicate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to duplicate cover letter' }, { status: 500 });
  }
}
