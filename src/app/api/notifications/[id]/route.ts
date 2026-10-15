import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * DELETE /api/notifications/[id] — e.g. when the change it reports is undone
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await db.notification.deleteMany({ where: { id, user_id: auth.userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
