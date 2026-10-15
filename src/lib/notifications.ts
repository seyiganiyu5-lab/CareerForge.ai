import { db } from '@/lib/db';

/**
 * In-app notifications. We store *what happened* (type + data), not text, so
 * the bell can show it in the reader's language.
 */
export interface JobStatusNotificationData {
  applicationId: string;
  company: string;
  jobTitle: string;
  from: string | null; // null when the application was just created
  to: string;
  source: 'email';
  date?: string | null; // interview date / assessment deadline, if known
}

export async function notifyJobStatus(userId: string, data: JobStatusNotificationData) {
  const n = await db.notification.create({
    data: {
      user_id: userId,
      type: 'job_status',
      data: JSON.stringify(data),
      link: '/job-tracker',
    },
  });
  return n.id;
}

// ── Automatic notifications ─────────────────────────────────────────

interface AutoNotification {
  type: string;
  key: string; // unique per user: the same event is never reported twice
  data: Record<string, unknown>;
  link: string;
}

async function createOnce(userId: string, items: AutoNotification[]) {
  if (!items.length) return;
  await db.notification.createMany({
    data: items.map((n) => ({
      user_id: userId,
      type: n.type,
      dedupe_key: n.key,
      data: JSON.stringify(n.data),
      link: n.link,
    })),
    skipDuplicates: true,
  });
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const CLOSED_STATUSES = ['accepted', 'rejected', 'withdrawn'];

interface Reminder {
  id: string;
  title: string;
  date: string;
  completed?: boolean;
}

/**
 * Looks at the user's job applications and adds notifications for what's coming up:
 * interviews in the next 24h, follow-ups due, deadlines in the next 48h, offers
 * expiring in the next 3 days, and reminders that are due. No scheduler needed:
 * this runs when the user's notifications are loaded.
 */
export async function generateDueNotifications(userId: string, now = new Date()) {
  const t = now.getTime();
  const apps = await db.jobApplication.findMany({
    where: { user_id: userId, is_archived: false, status: { notIn: CLOSED_STATUSES } },
    select: {
      id: true, company_name: true, job_title: true, status: true,
      interview_date: true, follow_up_date: true, deadline_date: true, offer_expiry: true, reminders: true,
    },
  });

  const items: AutoNotification[] = [];
  const within = (d: Date | null, from: number, to: number) => !!d && d.getTime() > from && d.getTime() <= to;

  for (const app of apps) {
    const base = { applicationId: app.id, company: app.company_name, jobTitle: app.job_title };
    const push = (type: string, key: string, date: Date | string, extra: Record<string, unknown> = {}) =>
      items.push({ type, key, link: '/job-tracker', data: { ...base, date: new Date(date).toISOString(), ...extra } });

    if (within(app.interview_date, t, t + DAY)) {
      push('job_interview_soon', `interview:${app.id}:${app.interview_date!.toISOString()}`, app.interview_date!);
    }
    // Follow-up date reached (and not more than 3 days ago)
    if (within(app.follow_up_date, t - 3 * DAY, t)) {
      push('job_follow_up', `followup:${app.id}:${app.follow_up_date!.toISOString()}`, app.follow_up_date!);
    }
    if (within(app.deadline_date, t, t + 2 * DAY)) {
      push('job_deadline', `deadline:${app.id}:${app.deadline_date!.toISOString()}`, app.deadline_date!);
    }
    if (app.status === 'offer' && within(app.offer_expiry, t, t + 3 * DAY)) {
      push('job_offer_expiry', `offer:${app.id}:${app.offer_expiry!.toISOString()}`, app.offer_expiry!);
    }

    let reminders: Reminder[] = [];
    try {
      reminders = JSON.parse(app.reminders || '[]');
    } catch {
      reminders = [];
    }
    for (const r of reminders) {
      if (!r || r.completed || !r.date) continue;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) continue;
      // Due within the next 24h, or overdue by up to 3 days
      if (within(d, t - 3 * DAY, t + DAY)) {
        push('job_reminder', `reminder:${app.id}:${r.id}:${d.toISOString()}`, d, { title: r.title });
      }
    }
  }

  await createOnce(userId, items);
}

/** Warn once at 80% of a plan limit, and once when the limit is reached. */
export async function notifyUsage(userId: string, usageField: string, used: number, limit: number) {
  if (limit <= 0) return; // unlimited (-1) or not available
  const items: AutoNotification[] = [];
  const data = { field: usageField, used, limit };
  if (used >= limit) {
    items.push({ type: 'usage_limit', key: `usage100:${usageField}:${limit}`, data, link: '/billing' });
  } else if (used >= Math.ceil(limit * 0.8) && limit >= 5) {
    items.push({ type: 'usage_warning', key: `usage80:${usageField}:${limit}`, data, link: '/billing' });
  }
  await createOnce(userId, items);
}
