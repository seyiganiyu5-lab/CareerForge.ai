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
