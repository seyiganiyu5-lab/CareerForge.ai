import { db } from '@/lib/db';
import { notifyUsage } from '@/lib/notifications';
import { FEATURE_USAGE_MAP, type FeatureKey } from './features';

// Plans and their feature limits rarely change, so keep them in memory
// briefly instead of reading them on every request.
const PLAN_CACHE_MS = 60_000;
let planCache: { at: number; plans: ReturnType<typeof fetchPlans> } | null = null;

function fetchPlans() {
  return db.plan.findMany({
    include: { plan_features: true },
    orderBy: { sort_order: 'asc' },
  });
}

function getPlansCached(fresh = false) {
  if (fresh || !planCache || Date.now() - planCache.at > PLAN_CACHE_MS) {
    const plans = fetchPlans();
    planCache = { at: Date.now(), plans };
    plans.catch(() => { planCache = null; });
  }
  return planCache.plans;
}

async function findPlan(planId: string) {
  const plan = (await getPlansCached()).find(p => p.id === planId);
  return plan ?? (await getPlansCached(true)).find(p => p.id === planId);
}

/**
 * Load everything needed for plan and usage checks — subscription, plan,
 * plan features and usage counters — in a single parallel round trip.
 * Creates the Free subscription / usage row on first access and drops
 * expired paid plans back to Free.
 */
export async function loadAccount(userId: string) {
  let [subscriptionRow, usage, plans] = await Promise.all([
    db.subscription.findUnique({ where: { user_id: userId } }),
    db.userUsage.findUnique({ where: { user_id: userId } }),
    getPlansCached(),
  ]);

  if (!subscriptionRow) {
    const freePlan = plans.find(p => p.name === 'free');
    if (!freePlan) throw new Error('Free plan not found in database');

    subscriptionRow = await db.subscription.create({
      data: {
        user_id: userId,
        plan_id: freePlan.id,
        status: 'active',
        billing_cycle: 'monthly',
      },
    });
  }

  const plan = await findPlan(subscriptionRow.plan_id);
  if (!plan) throw new Error('Plan not found');

  // Paid plans are bought one period at a time: once the period ends,
  // the user drops back to Free until they pay again.
  if (
    plan.name !== 'free' &&
    subscriptionRow.current_period_end &&
    subscriptionRow.current_period_end < new Date()
  ) {
    await downgradeToFree(userId);
    return loadAccount(userId);
  }

  if (!usage) {
    usage = await db.userUsage.create({ data: { user_id: userId } });
  }

  const subscription = { ...subscriptionRow, plan };
  return { subscription, features: plan.plan_features, usage };
}

export type Account = Awaited<ReturnType<typeof loadAccount>>;

/**
 * Get a user's effective plan (defaults to Free if no subscription exists).
 */
export async function getUserPlan(userId: string) {
  return (await loadAccount(userId)).subscription;
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
  const { subscription, features, usage } = await loadAccount(userId);
  const planName = subscription.plan.name;
  const feature = features.find(f => f.feature_key === featureKey);

  // Feature not configured for this plan = not allowed
  if (!feature || !feature.enabled) {
    return {
      allowed: false,
      reason: planName === 'free' ? 'upgrade_required' : 'feature_not_available',
      limit: 0,
      used: 0,
      planName,
    };
  }

  // Unlimited access
  if (feature.limit_value === -1) {
    return { allowed: true, limit: -1, used: 0, planName };
  }

  // Check usage limit
  const usageField = FEATURE_USAGE_MAP[featureKey];
  const used = usageField ? usage[usageField] ?? 0 : 0;
  const allowed = used < feature.limit_value;

  return {
    allowed,
    reason: allowed ? undefined : 'limit_reached',
    limit: feature.limit_value,
    used,
    planName,
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
      const row = await db.userUsage.update({
        where: { user_id: userId },
        data: { [usageField]: { increment: 1 } },
      });
      await warnIfNearLimit(userId, usageField, row, access.limit);
    }
  }

  return access;
}

/**
 * Count one use of a feature (e.g. after an AI request succeeds).
 */
export async function recordUsage(userId: string, featureKey: FeatureKey) {
  const usageField = FEATURE_USAGE_MAP[featureKey];
  if (!usageField) return;
  const row = await db.userUsage.update({
    where: { user_id: userId },
    data: { [usageField]: { increment: 1 } },
  });
  const { features } = await loadAccount(userId);
  const limit = features.find(f => f.feature_key === featureKey)?.limit_value ?? -1;
  await warnIfNearLimit(userId, usageField, row, limit);
}

/** Notification at 80% / 100% of a plan limit; never blocks the action itself. */
async function warnIfNearLimit(userId: string, usageField: string, row: object, limit: number) {
  const used = (row as Record<string, unknown>)[usageField];
  if (typeof used !== 'number') return;
  try {
    await notifyUsage(userId, usageField, used, limit);
  } catch (err) {
    console.error('Usage notification failed:', err);
  }
}

/**
 * Get current usage for a user.
 */
export async function getUserUsage(userId: string, preloaded?: Account) {
  const { subscription, features, usage } = preloaded ?? (await loadAccount(userId));

  const featureUsage: Record<string, { limit: number; used: number; enabled: boolean }> = {};

  for (const feature of features) {
    const usageField = FEATURE_USAGE_MAP[feature.feature_key];
    const used = usageField ? usage[usageField] ?? 0 : 0;

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
    raw: usage,
  };
}

/**
 * Check access to several features at once.
 */
export async function canAccessBatch(
  userId: string,
  featureKeys: FeatureKey[],
  preloaded?: Account
): Promise<Record<string, boolean>> {
  const { features, usage } = preloaded ?? (await loadAccount(userId));

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
    const used = usageField ? usage[usageField] ?? 0 : 0;
    result[key] = used < feature.limit_value;
  }

  return result;
}

/**
 * Get all active plans with their features.
 */
export async function getPlans() {
  return (await getPlansCached()).filter(p => p.is_active);
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
  const subscription = await db.subscription.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });
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