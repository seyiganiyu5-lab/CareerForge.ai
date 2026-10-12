import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';
import { z } from 'zod';

const VALID_STATUSES = [
  'wishlist', 'applied', 'viewed', 'assessment', 'interview', 'final_interview', 'offer', 'accepted', 'rejected', 'withdrawn',
];

const VALID_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const VALID_WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const createSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_description: z.string().optional(),
  job_url: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.string().optional(),
  work_mode: z.string().optional(),
  resume_used: z.string().optional(),
  cover_letter_used: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('wishlist'),
  applied_at: z.string().optional(),
  interview_date: z.string().optional(),
  follow_up_date: z.string().optional(),
  deadline_date: z.string().optional(),
  offer_expiry: z.string().optional(),
});

/**
 * GET /api/job-tracker — List all job applications
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const where: Record<string, unknown> = { user_id: auth.userId };

    if (!includeArchived) {
      where.is_archived = false;
    }

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { company_name: { contains: search } },
        { job_title: { contains: search } },
        { location: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const applications = await db.jobApplication.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('Job tracker fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch job applications' }, { status: 500 });
  }
}

/**
 * POST /api/job-tracker — Create a job application
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.JOB_TRACKER);
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

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Validate enums
    if (data.employment_type && !VALID_EMPLOYMENT_TYPES.includes(data.employment_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid employment_type' },
        { status: 400 },
      );
    }

    if (data.work_mode && !VALID_WORK_MODES.includes(data.work_mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work_mode' },
        { status: 400 },
      );
    }

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 },
      );
    }

    const application = await db.jobApplication.create({
      data: {
        user_id: auth.userId,
        company_name: data.company_name,
        job_title: data.job_title,
        job_description: data.job_description || null,
        job_url: data.job_url || null,
        salary: data.salary || null,
        location: data.location || null,
        employment_type: data.employment_type || null,
        work_mode: data.work_mode || null,
        resume_used: data.resume_used || null,
        cover_letter_used: data.cover_letter_used || null,
        notes: data.notes || null,
        status: data.status || 'wishlist',
        applied_at: data.applied_at ? new Date(data.applied_at) : null,
        interview_date: data.interview_date ? new Date(data.interview_date) : null,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : null,
        deadline_date: data.deadline_date ? new Date(data.deadline_date) : null,
        offer_expiry: data.offer_expiry ? new Date(data.offer_expiry) : null,
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error('Job application create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create job application' }, { status: 500 });
  }
}
