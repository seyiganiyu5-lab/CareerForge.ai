import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify resume ownership
    const resume = await db.resume.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Check feature access and increment usage
    const access = await checkAndIncrementUsage(user.userId, FEATURE_KEYS.PDF_EXPORT);

    if (!access.allowed) {
      if (access.reason === 'upgrade_required' || access.reason === 'limit_reached') {
        return NextResponse.json(
          { error: 'limit_reached', limit: access.limit, used: access.used },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
    }

    // Return filename for client-side PDF generation
    const safeTitle = (resume.title || 'resume').replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const filename = `${safeTitle}.pdf`;

    return NextResponse.json({
      success: true,
      filename,
      usage: { limit: access.limit, used: access.used + 1 },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}