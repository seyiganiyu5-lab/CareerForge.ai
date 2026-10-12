import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { canAccess } from '@/lib/subscription/service';
import type { FeatureKey } from '@/lib/subscription/features';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { featureKey } = await request.json();

    if (!featureKey) {
      return NextResponse.json({ success: false, error: 'Feature key is required' }, { status: 400 });
    }

    const result = await canAccess(auth.userId, featureKey as FeatureKey);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Feature check error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check feature access' }, { status: 500 });
  }
}