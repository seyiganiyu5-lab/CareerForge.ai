import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

/**
 * GET /api/notifications — latest notifications and the unread count
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [rows, unread] = await Promise.all([
      db.notification.findMany({
        where: { user_id: auth.userId },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
      db.notification.count({ where: { user_id: auth.userId, read_at: null } }),
    ]);

    const notifications = rows.map((n) => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(n.data);
      } catch {
        // keep empty
      }
      return { id: n.id, type: n.type, data, link: n.link, read: !!n.read_at, createdAt: n.created_at };
    });

    return NextResponse.json({ success: true, notifications, unread });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load notifications' }, { status: 500 });
  }
}
