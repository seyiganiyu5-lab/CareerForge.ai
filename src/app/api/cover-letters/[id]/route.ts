import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere } from '@/lib/subscription/documents';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/cover-letters/[id]
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const letter = await db.coverLetter.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!letter) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coverLetter: letter });
  } catch (error) {
    console.error('Cover letter fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cover letter' }, { status: 500 });
  }
}

/**
 * PUT /api/cover-letters/[id]
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.coverLetter.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      title?: string;
      data_json?: string;
      template?: string;
      customization_json?: string;
      status?: string;
      language?: string;
    };

    // Check if data changed significantly and save version
    if (body.data_json && body.data_json !== existing.data_json) {
      const versionCount = await db.coverLetterVersion.count({
        where: { cover_letter_id: id },
      });
      // Keep max 10 versions
      if (versionCount < 10) {
        const lastVersion = await db.coverLetterVersion.findFirst({
          where: { cover_letter_id: id },
          orderBy: { version_number: 'desc' },
        });
        const nextNum = (lastVersion?.version_number || 0) + 1;
        await db.coverLetterVersion.create({
          data: {
            cover_letter_id: id,
            version_number: nextNum,
            data_json: existing.data_json,
            change_summary: `Auto-save v${nextNum}`,
          },
        });
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.data_json !== undefined) updateData.data_json = body.data_json;
    if (body.template !== undefined) updateData.template = body.template;
    if (body.customization_json !== undefined) updateData.customization_json = body.customization_json;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.language !== undefined) updateData.language = body.language;

    const updated = await db.coverLetter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, coverLetter: updated });
  } catch (error) {
    console.error('Cover letter update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update cover letter' }, { status: 500 });
  }
}

/**
 * DELETE /api/cover-letters/[id]
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.coverLetter.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    await db.coverLetter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cover letter delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete cover letter' }, { status: 500 });
  }
}
