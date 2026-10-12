import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';
import { z } from 'zod';

const VALID_STATUSES = [
  'wishlist', 'applied', 'viewed', 'assessment', 'interview', 'final_interview', 'offer', 'accepted', 'rejected', 'withdrawn',
];

const statusSchema = z.object({
  status: z.string().refine(s => VALID_STATUSES.includes(s), {
    message: 'Invalid status',
  }),
});

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/job-tracker/[id]/status — Update status (for Kanban drag-drop)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updated = await db.jobApplication.update({
      where: { id },
      data: {
        status: parsed.data.status,
        // Auto-set applied_at when moving to applied
        ...(parsed.data.status === 'applied' && !existing.applied_at
          ? { applied_at: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Job application status update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
