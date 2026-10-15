import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere, newDocTier } from '@/lib/subscription/documents';
import { canAccess } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { checkAndIncrementUsage } from '@/lib/subscription/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check plan limit
    const access = await canAccess(auth.userId, FEATURE_KEYS.CREATE_RESUME);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'limit_reached', planName: access.planName }, { status: 403 });
    }

    const { id } = await params;

    const original = await db.resume.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!original) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.CREATE_RESUME);

    const duplicated = await db.resume.create({
      data: {
        user_id: auth.userId,
        plan_tier: await newDocTier(auth.userId),
        title: `${original.title} (Copy)`,
        data_json: original.data_json,
        template: original.template,
        status: 'draft',
      },
    });

    return NextResponse.json({
      success: true,
      resume: { id: duplicated.id, title: duplicated.title, template: duplicated.template, status: duplicated.status, created_at: duplicated.created_at, updated_at: duplicated.updated_at },
    }, { status: 201 });
  } catch (error) {
    console.error('Resume duplicate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to duplicate resume' }, { status: 500 });
  }
}