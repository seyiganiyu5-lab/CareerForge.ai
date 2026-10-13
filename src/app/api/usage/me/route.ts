import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { getUserUsage, canAccessBatch, loadAccount } from '@/lib/subscription/service';
import { PREMIUM_FEATURES } from '@/lib/subscription/features';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // One load of plan + usage, shared by both summaries
    const account = await loadAccount(auth.userId);
    const usageData = await getUserUsage(auth.userId, account);
    const premiumAccess = await canAccessBatch(auth.userId, PREMIUM_FEATURES, account);

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
