import { NextResponse } from 'next/server';
import { requireOrgManager } from '@/lib/enterprise/organizations';
import { organizationProgress } from '@/lib/enterprise/progress';

export const dynamic = 'force-dynamic';

/** GET /api/organization/progress — members' progress, numbers only (owners/admins) */
export async function GET() {
  const { membership, error } = await requireOrgManager();
  if (error) return error;

  try {
    return NextResponse.json({ success: true, ...(await organizationProgress(membership.organization_id)) });
  } catch (err) {
    console.error('Organisation progress error:', err);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
