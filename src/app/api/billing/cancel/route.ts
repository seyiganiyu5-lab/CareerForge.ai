import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { cancelSubscription, downgradeToFree, getUserPlan } from '@/lib/subscription/service';

/**
 * POST /api/billing/cancel
 * Cancel the current subscription. Access continues until period end.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const immediate = body.immediate === true;

    const currentSub = await getUserPlan(auth.userId);

    if (currentSub.plan.name === 'free') {
      return NextResponse.json({ success: false, error: 'You are already on the free plan' }, { status: 400 });
    }

    if (immediate) {
      const result = await downgradeToFree(auth.userId);
      return NextResponse.json({
        success: true,
        subscription: {
          plan: { name: result.plan.name, display_name: result.plan.display_name },
          status: result.status,
        },
        immediate: true,
      });
    }

    const result = await cancelSubscription(auth.userId);
    return NextResponse.json({
      success: true,
      subscription: {
        plan: { name: result.plan.name, display_name: result.plan.display_name },
        status: result.status,
        current_period_end: result.current_period_end,
      },
      immediate: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}