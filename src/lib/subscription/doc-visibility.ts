/**
 * Resumes and cover letters remember the plan they were created on.
 * On the Free plan only documents created on Free are visible; the ones
 * created on Pro are kept (not deleted) and come back after upgrading.
 */
export type DocTier = 'free' | 'pro';

export function tierForPlan(planName: string): DocTier {
  return planName === 'free' ? 'free' : 'pro';
}

/** Prisma `where` part for the documents a plan can see. */
export function visibleDocsWhere(userId: string, planName: string) {
  return planName === 'free' ? { user_id: userId, plan_tier: 'free' } : { user_id: userId };
}

/** Whether a document with this tier can be opened on this plan. */
export function canSeeDoc(planName: string, tier: string) {
  return planName !== 'free' || tier === 'free';
}
