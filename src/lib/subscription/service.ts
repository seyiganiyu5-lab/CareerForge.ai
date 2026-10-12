import { db } from '@/lib/db';
import { FEATURE_KEYS, FEATURE_USAGE_MAP, type FeatureKey } from './features';

/**
 * Get a user's effective plan (defaults to Free if no subscription exists).
 * Creates a default subscription + usage record on first access.
 */
export async function getUserPlan(userId: string) {
  // Ensure user has a subscription (default to Free)
  let subscription = await db.subscription.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });

  if (!subscription) {
    const freePlan = await db.plan.findFirst({ where: { name: 'free' } });
    if (!freePlan) throw new Error('Free plan not found in database');

    subscription = await db.subscription.create({
      data: {
        user_id: userId,
        plan_id: freePlan.id,
        status: 'active',
        billing_cycle: 'monthly',
      },
      include: { plan: true },
    });
  }

  // Ensure user has a usage record
  const existingUsage = await db.userUsage.findUnique({ where: { user_id: userId } });
  if (!existingUsage) {
    await db.userUsage.create({ data: { user_id: userId } });
  }

  return subscription;
}

/**
 * Get plan features for a specific plan ID.
 */
export async function getPlanFeatures(planId: string) {
  return db.planFeature.findMany({
    where: { plan_id: planId },
  });
}

/**
 * Check if a user can access a specific feature.
 * Returns { allowed: boolean, reason?: string, limit?: number, used?: number }
 */
export async function canAccess(
  userId: string,
  featureKey: FeatureKey
): Promise<{
  allowed: boolean;
  reason?: string;
  limit: number;
  used: number;
  planName: string;
}> {
  const subscription = await getUserPlan(userId);
  const features = await getPlanFeatures(subscription.plan_id);

  const feature = features.find(f => f.feature_key === featureKey);

  // Feature not configured for this plan = not allowed
  if (!feature || !feature.enabled) {
    return {
      allowed: false,
      reason: subscription.plan.name === 'free' ? 'upgrade_required' : 'feature_not_available',
      limit: 0,
      used: 0,
      planName: subscription.plan.name,
    };
  }

  // Unlimited access
  if (feature.limit_value === -1) {
    return {
      allowed: true,
      limit: -1,
      used: 0,
      planName: subscription.plan.name,
    };
  }

  // Check usage limit
  const usageField = FEATURE_USAGE_MAP[featureKey];
  let used = 0;

  if (usageField) {
    const usage = await db.userUsage.findUnique({ where: { user_id: userId } });
    if (usage) {
      used = usage[usageField] ?? 0;
    }
  }

  const allowed = used < feature.limit_value;

  return {
    allowed,
    reason: allowed ? undefined : 'limit_reached',
    limit: feature.limit_value,
    used,
    planName: subscription.plan.name,
  };
}

/**
 * Check if a user can use a feature and optionally increment usage.
 * Returns the access result, and optionally increments the usage counter.
 */
export async function checkAndIncrementUsage(
  userId: string,
  featureKey: FeatureKey,
  increment = true
) {
  const access = await canAccess(userId, featureKey);

  if (!access.allowed) return access;

  if (increment) {
    const usageField = FEATURE_USAGE_MAP[featureKey];
    if (usageField) {
      await db.userUsage.update({
        where: { user_id: userId },
        data: { [usageField]: { increment: 1 } },
      });
    }
  }

  return access;
}

/**
 * Get current usage for a user.
 * Optimized: reuses getUserPlan which already ensures usage record exists,
 * and fetches usage in a single query (already created by getUserPlan).
 */
export async function getUserUsage(userId: string) {
  const subscription = await getUserPlan(userId);
  // getUserPlan already ensures the usage record exists
  const usage = await db.userUsage.findUniqueOrThrow({ where: { user_id: userId } });
  const features = await getPlanFeatures(subscription.plan_id);

  const featureUsage: Record<string, { limit: number; used: number; enabled: boolean }> = {};

  for (const feature of features) {
    const usageField = FEATURE_USAGE_MAP[feature.feature_key];
    const used = usage && usageField ? (usage[usageField] ?? 0) : 0;

    featureUsage[feature.feature_key] = {
      limit: feature.limit_value,
      used,
      enabled: feature.enabled,
    };
  }

  return {
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      display_name: subscription.plan.display_name,
    },
    subscription: {
      status: subscription.status,
      started_at: subscription.started_at,
      expires_at: subscription.expires_at,
      billing_cycle: subscription.billing_cycle,
    },
    usage: featureUsage,
    raw: usage ?? {
      resume_count: 0,
      cover_letter_count: 0,
      ai_requests: 0,
      resume_reviews: 0,
      exports_count: 0,
      ats_checks: 0,
    },
  };
}

/**
 * Batch check feature access for multiple features in a single DB round-trip.
 * Avoids the N+1 problem of calling canAccess() in a loop.
 */
export async function canAccessBatch(
  userId: string,
  featureKeys: FeatureKey[]
): Promise<Record<string, boolean>> {
  const subscription = await getUserPlan(userId);
  const features = await getPlanFeatures(subscription.plan_id);
  const usage = await db.userUsage.findUnique({ where: { user_id: userId } });

  // Build a lookup map for O(1) feature lookup
  const featureMap = new Map(features.map(f => [f.feature_key, f]));

  const result: Record<string, boolean> = {};
  for (const key of featureKeys) {
    const feature = featureMap.get(key);
    if (!feature || !feature.enabled) {
      result[key] = false;
      continue;
    }
    if (feature.limit_value === -1) {
      result[key] = true;
      continue;
    }
    const usageField = FEATURE_USAGE_MAP[key];
    const used = usage && usageField ? (usage[usageField] ?? 0) : 0;
    result[key] = used < feature.limit_value;
  }

  return result;
}

/**
 * Get all active plans with their features.
 */
export async function getPlans() {
  return db.plan.findMany({
    where: { is_active: true },
    include: { plan_features: true },
    orderBy: { sort_order: 'asc' },
  });
}

/**
 * Upgrade a user's subscription to a new plan.
 */
export async function upgradeSubscription(
  userId: string,
  newPlanId: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
) {
  const newPlan = await db.plan.findUnique({ where: { id: newPlanId } });
  if (!newPlan) throw new Error('Plan not found');

  const price = billingCycle === 'yearly' ? newPlan.price_yearly : newPlan.price_monthly;
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const existing = await db.subscription.findUnique({ where: { user_id: userId } });

  if (existing) {
    return db.subscription.update({
      where: { user_id: userId },
      data: {
        plan_id: newPlanId,
        status: 'active',
        billing_cycle: billingCycle,
        current_period_start: now,
        current_period_end: periodEnd,
        expires_at: periodEnd,
        cancelled_at: null,
        updated_at: now,
      },
      include: { plan: true },
    });
  }

  return db.subscription.create({
    data: {
      user_id: userId,
      plan_id: newPlanId,
      status: 'active',
      billing_cycle: billingCycle,
      current_period_start: now,
      current_period_end: periodEnd,
      expires_at: periodEnd,
    },
    include: { plan: true },
  });
}

/**
 * Cancel a user's subscription (keep active until end of billing period).
 */
export async function cancelSubscription(userId: string) {
  const subscription = await db.subscription.findUnique({ where: { user_id: userId } });
  if (!subscription) throw new Error('No subscription found');

  if (subscription.plan.name === 'free') {
    throw new Error('Cannot cancel free plan');
  }

  return db.subscription.update({
    where: { user_id: userId },
    data: {
      status: 'cancelled',
      cancelled_at: new Date(),
      // Keep access until end of current period
    },
    include: { plan: true },
  });
}

/**
 * Downgrade a user to the free plan.
 */
export async function downgradeToFree(userId: string) {
  const freePlan = await db.plan.findFirst({ where: { name: 'free' } });
  if (!freePlan) throw new Error('Free plan not found');

  return db.subscription.update({
    where: { user_id: userId },
    data: {
      plan_id: freePlan.id,
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: new Date(),
      current_period_end: null,
      expires_at: null,
      cancelled_at: null,
    },
    include: { plan: true },
  });
}

/**
 * Initialize usage for a new user (called after signup).
 */
export async function initializeUsage(userId: string) {
  const freePlan = await db.plan.findFirst({ where: { name: 'free' } });
  if (!freePlan) throw new Error('Free plan not found');

  await db.$transaction([
    db.subscription.create({
      data: {
        user_id: userId,
        plan_id: freePlan.id,
        status: 'active',
        billing_cycle: 'monthly',
      },
    }),
    db.userUsage.create({
      data: { user_id: userId },
    }),
  ]);
}

// Quick helper: is user on free plan?
export async function isFreePlan(userId: string): Promise<boolean> {
  const sub = await getUserPlan(userId);
  return sub.plan.name === 'free';
}