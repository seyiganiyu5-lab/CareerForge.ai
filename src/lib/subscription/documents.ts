import { getUserPlan } from './service';
import { tierForPlan, visibleDocsWhere } from './doc-visibility';

export { tierForPlan, visibleDocsWhere, canSeeDoc } from './doc-visibility';

/**
 * Resumes and cover letters remember the plan they were created on.
 * On the Free plan only documents created on Free are visible; the ones
 * created on Pro are kept (not deleted) and come back after upgrading.
 */
/** The user's current plan, the documents it can see, and the tier for new documents. */
export async function docAccess(userId: string) {
  const sub = await getUserPlan(userId);
  const planName = sub.plan.name;
  return { planName, where: visibleDocsWhere(userId, planName), newTier: tierForPlan(planName) };
}

/** Prisma `where` part for the user's documents visible on their current plan. */
export async function docWhere(userId: string) {
  return (await docAccess(userId)).where;
}

/** Tier to store on a document created now. */
export async function newDocTier(userId: string) {
  return (await docAccess(userId)).newTier;
}

/** Documents hidden on the current plan (created on Pro, now on Free), or null when none can be. */
export function hiddenDocsWhere(userId: string, planName: string) {
  return planName === 'free' ? { user_id: userId, plan_tier: 'pro' } : null;
}
