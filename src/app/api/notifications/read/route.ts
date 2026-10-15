import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

const bodySchema = z.object({ ids: z.array(z.string()).max(100).optional() });

/**
 * POST /api/notifications/read — mark some (ids) or all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const { ids } = parsed.data;

    await db.notification.updateMany({
      where: { user_id: auth.userId, read_at: null, ...(ids ? { id: { in: ids } } : {}) },
      data: { read_at: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications read error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notifications' }, { status: 500 });
  }
}
