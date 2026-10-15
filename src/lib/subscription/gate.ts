import { NextResponse } from 'next/server';
import { canAccess } from './service';
import type { FeatureKey } from './features';

/**
 * Block a Pro-only feature for users whose plan doesn't include it.
 * Returns the 403 response to send, or null when the user may continue.
 * (Usage limits are checked separately where an action uses them up.)
 */
export async function requireFeature(userId: string, featureKey: FeatureKey) {
  const access = await canAccess(userId, featureKey);
  if (access.allowed || access.reason === 'limit_reached') return null;
  return NextResponse.json(
    { success: false, error: 'upgrade_required', planName: access.planName },
    { status: 403 },
  );
}
