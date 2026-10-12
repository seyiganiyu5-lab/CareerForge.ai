import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/job-tracker/[id]/archive — Toggle archive
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

    const updated = await db.jobApplication.update({
      where: { id },
      data: { is_archived: !existing.is_archived },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Job application archive error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update archive status' }, { status: 500 });
  }
}
