import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docAccess, hiddenDocsWhere, newDocTier } from '@/lib/subscription/documents';
import { canAccess } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { checkAndIncrementUsage } from '@/lib/subscription/service';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { planName, where } = await docAccess(auth.userId);
    const hiddenWhere = hiddenDocsWhere(auth.userId, planName);
    const [resumes, hiddenCount] = await Promise.all([
      db.resume.findMany({ where, orderBy: { updated_at: 'desc' } }),
      hiddenWhere ? db.resume.count({ where: hiddenWhere }) : 0,
    ]);

    const formatted = resumes.map(r => ({
      id: r.id,
      title: r.title,
      template: r.template,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({ success: true, resumes: formatted, hiddenCount });
  } catch (error) {
    console.error('Resumes list error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const access = await canAccess(auth.userId, FEATURE_KEYS.CREATE_RESUME);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'limit_reached', planName: access.planName }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, template } = body as { title?: string; template?: string };

    await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.CREATE_RESUME);

    const resume = await db.resume.create({
      data: {
        user_id: auth.userId,
        plan_tier: await newDocTier(auth.userId),
        title: title || 'Untitled Resume',
        template: template || 'ats-classic',
        data_json: JSON.stringify({}),
        customization_json: JSON.stringify({}),
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        template: resume.template,
        status: resume.status,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Resume create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create resume' }, { status: 500 });
  }
}