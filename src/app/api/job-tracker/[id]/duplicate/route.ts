import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { requireFeature } from '@/lib/subscription/gate';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/job-tracker/[id]/duplicate — Clone a job application
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const locked = await requireFeature(auth.userId, FEATURE_KEYS.JOB_TRACKER);
    if (locked) return locked;

    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.JOB_TRACKER);
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

    const original = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });
    if (!original) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const duplicated = await db.jobApplication.create({
      data: {
        user_id: auth.userId,
        company_name: original.company_name,
        job_title: `${original.job_title} (Copy)`,
        job_description: original.job_description,
        job_url: original.job_url,
        salary: original.salary,
        location: original.location,
        employment_type: original.employment_type,
        work_mode: original.work_mode,
        resume_used: original.resume_used,
        cover_letter_used: original.cover_letter_used,
        notes: original.notes,
        status: 'wishlist',
        is_archived: false,
        applied_at: null,
        interview_date: null,
        follow_up_date: null,
        deadline_date: null,
        offer_expiry: null,
        calendar_events: '[]',
        reminders: '[]',
        ai_suggestions: '[]',
      },
    });

    return NextResponse.json({ success: true, application: duplicated }, { status: 201 });
  } catch (error) {
    console.error('Job application duplicate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to duplicate job application' }, { status: 500 });
  }
}
