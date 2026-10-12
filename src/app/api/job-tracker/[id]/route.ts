import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';
import { z } from 'zod';

const VALID_STATUSES = [
  'wishlist', 'applied', 'viewed', 'assessment', 'interview', 'final_interview', 'offer', 'accepted', 'rejected', 'withdrawn',
];

const VALID_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const VALID_WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const updateSchema = z.object({
  company_name: z.string().min(1).optional(),
  job_title: z.string().min(1).optional(),
  job_description: z.string().nullable().optional(),
  job_url: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  employment_type: z.string().nullable().optional(),
  work_mode: z.string().nullable().optional(),
  resume_used: z.string().nullable().optional(),
  cover_letter_used: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().optional(),
  is_archived: z.boolean().optional(),
  applied_at: z.string().nullable().optional(),
  interview_date: z.string().nullable().optional(),
  follow_up_date: z.string().nullable().optional(),
  deadline_date: z.string().nullable().optional(),
  offer_expiry: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/job-tracker/[id]
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Job application fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch job application' }, { status: 500 });
  }
}

/**
 * PUT /api/job-tracker/[id]
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Validate enums if provided
    if (data.employment_type !== undefined && data.employment_type !== null && !VALID_EMPLOYMENT_TYPES.includes(data.employment_type)) {
      return NextResponse.json({ success: false, error: 'Invalid employment_type' }, { status: 400 });
    }

    if (data.work_mode !== undefined && data.work_mode !== null && !VALID_WORK_MODES.includes(data.work_mode)) {
      return NextResponse.json({ success: false, error: 'Invalid work_mode' }, { status: 400 });
    }

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    const stringFields = ['company_name', 'job_title', 'job_description', 'job_url', 'salary', 'location',
      'employment_type', 'work_mode', 'resume_used', 'cover_letter_used', 'notes', 'status'];
    for (const field of stringFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
      }
    }

    if (data.is_archived !== undefined) updateData.is_archived = data.is_archived;

    const dateFields = ['applied_at', 'interview_date', 'follow_up_date', 'deadline_date', 'offer_expiry'];
    for (const field of dateFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data] ? new Date(data[field as keyof typeof data] as string) : null;
      }
    }

    const updated = await db.jobApplication.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Job application update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update job application' }, { status: 500 });
  }
}

/**
 * DELETE /api/job-tracker/[id]
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    await db.jobApplication.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job application delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete job application' }, { status: 500 });
  }
}
