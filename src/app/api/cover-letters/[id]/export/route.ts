import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/cover-letters/[id]/export — Returns HTML for client-side PDF export
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const letter = await db.coverLetter.findFirst({
      where: { id, user_id: auth.userId },
    });

    if (!letter) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    // Return the cover letter data for client-side PDF rendering
    return NextResponse.json({
      success: true,
      coverLetter: letter,
    });
  } catch (error) {
    console.error('Cover letter export fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to prepare export' }, { status: 500 });
  }
}
