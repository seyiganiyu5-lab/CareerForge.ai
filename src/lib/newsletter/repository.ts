/**
 * Newsletter Subscriber Repository
 *
 * Backed by Supabase. Uses the anon-key client for public operations.
 * Table: public.newsletter_subscribers
 */

import { supabaseAdmin } from '@/lib/supabase/server';
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

const TABLE = 'newsletter_subscribers';

/**
 * Find a subscriber by email address.
 */
export async function findByEmail(email: string): Promise<SubscriberRecord | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return data as SubscriberRecord;
}

/**
 * Create a new newsletter subscriber.
 */
export async function createSubscriber(
  data: SubscribeRequest
): Promise<SubscriberRecord> {
  const { data: row, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      email: data.email.toLowerCase().trim(),
      language: data.language,
      source: data.source,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create subscriber: ${error.message}`);
  return row as SubscriberRecord;
}

/**
 * Reactivate an existing subscriber that was previously unsubscribed.
 */
export async function reactivateSubscriber(
  id: string,
  source: SubscribeRequest['source']
): Promise<SubscriberRecord> {
  const { data: row, error } = await supabaseAdmin
    .from(TABLE)
    .update({
      status: 'active',
      subscribed_at: new Date().toISOString(),
      source,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to reactivate subscriber: ${error.message}`);
  return row as SubscriberRecord;
}

/**
 * Update subscriber status.
 * Used for: unsubscribe, bounce handling, double opt-in confirmation.
 */
export async function updateSubscriberStatus(
  id: string,
  status: SubscriberStatus
): Promise<SubscriberRecord> {
  const { data: row, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update subscriber: ${error.message}`);
  return row as SubscriberRecord;
}

/**
 * Get subscriber count by status (for admin/analytics).
 */
export async function getSubscriberCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (error) throw new Error(`Failed to count subscribers: ${error.message}`);
  return count ?? 0;
}

/**
 * Get subscribers by language (for segmented campaigns).
 */
export async function getSubscribersByLanguage(
  language: string
): Promise<SubscriberRecord[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('status', 'active')
    .eq('language', language)
    .order('subscribed_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return (data ?? []) as SubscriberRecord[];
}