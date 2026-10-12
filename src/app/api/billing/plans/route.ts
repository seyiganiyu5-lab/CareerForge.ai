import { NextResponse } from 'next/server';
import { getPlans } from '@/lib/subscription/service';

export async function GET() {
  try {
    const plans = await getPlans();
    const formatted = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      display_name: plan.display_name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      currency: plan.currency,
      description: plan.description,
      sort_order: plan.sort_order,
      features: plan.plan_features.map(f => ({
        key: f.feature_key,
        enabled: f.enabled,
        limit: f.limit_value,
      })),
    }));

    return NextResponse.json({ success: true, plans: formatted });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}