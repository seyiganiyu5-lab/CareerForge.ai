import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { adminEmails } from '@/lib/admin';
import { createNotification } from '@/lib/notifications';
import { describeDevice } from '@/lib/admin-device';

/** Who did it, from where: IP and a short device description */
async function origin() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null;
  const ua = h.get('user-agent')?.slice(0, 300) || null;
  return { ip, ua };
}

/**
 * Record an admin action on the Admin activity page. Never throws: a
 * logging problem must not stop the action itself.
 */
export async function logAdminAction(
  actor: { userId: string; email: string },
  action: string,
  target?: { type: string; id?: string | null; summary?: string },
) {
  try {
    const { ip, ua } = await origin();
    await db.adminAuditLog.create({
      data: {
        actor_id: actor.userId,
        actor_email: actor.email.toLowerCase(),
        action,
        target_type: target?.type ?? null,
        target_id: target?.id ?? null,
        summary: target?.summary?.slice(0, 300) ?? '',
        ip,
        user_agent: ua,
      },
    });
  } catch (err) {
    console.error('Admin activity log failed:', err);
  }
}

/**
 * An admin account just signed in (password or Google): log it and tell every
 * admin, so a sign-in that wasn't them is noticed straight away.
 */
export async function notifyAdminSignIn(actor: { userId: string; email: string }, method: 'password' | 'google') {
  try {
    const { ip, ua } = await origin();
    await logAdminAction(actor, 'admin.signin', { type: 'account', summary: method });
    const admins = await db.user.findMany({ where: { email: { in: adminEmails() } }, select: { id: true } });
    const at = new Date().toISOString();
    await Promise.all(admins.map((a) =>
      createNotification(a.id, {
        type: 'admin_signin',
        key: `adminsignin:${actor.userId}:${at}`,
        data: { email: actor.email, device: describeDevice(ua), ip: ip ?? '', date: at },
        link: '/admin/activity',
      }).catch(() => {})));
  } catch (err) {
    console.error('Admin sign-in alert failed:', err);
  }
}
