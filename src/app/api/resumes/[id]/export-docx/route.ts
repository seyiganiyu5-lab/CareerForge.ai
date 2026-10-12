import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { generateDocxBlob } from '@/lib/export/docx';
import type { ResumeData } from '@/types/resume';

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

    // Check DOCX_EXPORT feature access (Pro only) and increment usage
    const access = await checkAndIncrementUsage(user.userId, FEATURE_KEYS.DOCX_EXPORT);

    if (!access.allowed) {
      if (access.reason === 'upgrade_required' || access.reason === 'limit_reached') {
        return NextResponse.json(
          { error: 'limit_reached', limit: access.limit, used: access.used },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
    }

    // Parse resume data
    let resumeData: ResumeData;
    try {
      resumeData = JSON.parse(resume.data_json as string) as ResumeData;
    } catch {
      return NextResponse.json({ error: 'Invalid resume data' }, { status: 400 });
    }

    // Generate DOCX
    const buffer = await generateDocxBlob(resumeData);

    // Build safe filename
    const safeTitle = (resume.title || 'resume').replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const filename = `${safeTitle}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}