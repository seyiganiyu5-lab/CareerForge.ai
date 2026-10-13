/**
 * Newsletter Subscriber Repository
 *
 * Stored in the app database (Supabase Postgres) via Prisma.
 */

import type { NewsletterSubscriber } from '@prisma/client';
import { db } from '@/lib/db';
import type { SubscribeRequest, SubscriberStatus } from '@/types/newsletter';

export interface SubscriberRecord {
  id: string;
  email: string;
  language: string;
  status: string;
  subscribed_at: string;
  updated_at: string;
  source: string;
  created_at: string;
}

function toRecord(row: NewsletterSubscriber): SubscriberRecord {
  return {
    ...row,
    subscribed_at: row.subscribed_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    created_at: row.created_at.toISOString(),
  };
}

/**
 * Find a subscriber by email address.
 */
export async function findByEmail(email: string): Promise<SubscriberRecord | null> {
  const row = await db.newsletterSubscriber.findUnique({
    where: { email: email.toLowerCase() },
  });
  return row ? toRecord(row) : null;
}

/**
 * Create a new newsletter subscriber.
 */
export async function createSubscriber(
  data: SubscribeRequest
): Promise<SubscriberRecord> {
  const row = await db.newsletterSubscriber.create({
    data: {
      email: data.email.toLowerCase().trim(),
      language: data.language,
      source: data.source,
      status: 'active',
    },
  });
  return toRecord(row);
}

/**
 * Reactivate an existing subscriber that was previously unsubscribed.
 */
export async function reactivateSubscriber(
  id: string,
  source: SubscribeRequest['source']
): Promise<SubscriberRecord> {
  const row = await db.newsletterSubscriber.update({
    where: { id },
    data: { status: 'active', subscribed_at: new Date(), source },
  });
  return toRecord(row);
}

/**
 * Update subscriber status.
 * Used for: unsubscribe, bounce handling, double opt-in confirmation.
 */
export async function updateSubscriberStatus(
  id: string,
  status: SubscriberStatus
): Promise<SubscriberRecord> {
  const row = await db.newsletterSubscriber.update({
    where: { id },
    data: { status },
  });
  return toRecord(row);
}

/**
 * Get subscriber count by status (for admin/analytics).
 */
export async function getSubscriberCount(): Promise<number> {
  return db.newsletterSubscriber.count({ where: { status: 'active' } });
}

/**
 * Get subscribers by language (for segmented campaigns).
 */
export async function getSubscribersByLanguage(
  language: string
): Promise<SubscriberRecord[]> {
  const rows = await db.newsletterSubscriber.findMany({
    where: { status: 'active', language },
    orderBy: { subscribed_at: 'desc' },
  });
  return rows.map(toRecord);
}
