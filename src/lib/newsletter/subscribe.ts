/**
 * Newsletter Subscription Business Logic
 *
 * Orchestrates the subscription flow:
 * 1. Check for existing subscriber
 * 2. Create or reactivate
 * 3. Trigger email service (when configured)
 */

import type { SubscribeRequest, SubscribeResponse } from '@/types/newsletter';
import {
  findByEmail,
  createSubscriber,
  reactivateSubscriber,
} from './repository';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * Process a newsletter subscription request.
 * Handles duplicate detection, reactivation, and email triggering.
 */
export async function subscribe(
  data: SubscribeRequest
): Promise<SubscribeResponse> {
  // 1. Check if email already exists
  const existing = await findByEmail(data.email);

  if (existing) {
    if (existing.status === 'active') {
      return {
        success: false,
        message: 'already_subscribed',
        statusCode: 409,
      };
    }

    // Previously unsubscribed or bounced — reactivate
    await reactivateSubscriber(existing.id, data.source);

    // Fire-and-forget welcome email
    sendWelcomeEmail(data.email, data.language).catch(() => {});

    return {
      success: true,
      message: 'reactivated',
      statusCode: 200,
    };
  }

  // 2. Create new subscriber
  await createSubscriber(data);

  // 3. Fire-and-forget welcome email (non-blocking)
  sendWelcomeEmail(data.email, data.language).catch(() => {});

  return {
    success: true,
    message: 'subscribed',
    statusCode: 200,
  };
}