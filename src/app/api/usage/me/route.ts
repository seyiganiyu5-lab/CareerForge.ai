import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { getUserUsage, canAccessBatch } from '@/lib/subscription/service';
import { PREMIUM_FEATURES } from '@/lib/subscription/features';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch usage data (already optimized with single getUserPlan call)
    const usageData = await getUserUsage(auth.userId);

    // Batch check premium feature access in a single DB round-trip
    const premiumAccess = await canAccessBatch(auth.userId, PREMIUM_FEATURES);

    return NextResponse.json({
      success: true,
      isPremium: usageData.plan.name !== 'free',
      ...usageData,
      premiumAccess,
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch usage' }, { status: 500 });
  }
}
