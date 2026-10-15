import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { generateDocxBlob } from '@/lib/export/docx';
import type { ResumeData } from '@/types/resume';
import { getRequestLocale } from '@/lib/ai/locale';
import type { DocLanguage } from '@/lib/templates/utils';

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

    // CV language: from the editor, else the saved design settings, else the site language
    const body = (await request.json().catch(() => ({}))) as { language?: string };
    let saved: string | undefined;
    try {
      saved = (JSON.parse(resume.customization_json || '{}') as { language?: string }).language;
    } catch {
      saved = undefined;
    }
    const pick = body.language ?? saved ?? getRequestLocale(request);
    const lang: DocLanguage = pick === 'fr' ? 'fr' : 'en';

    // Generate DOCX
    const buffer = await generateDocxBlob(resumeData, lang);

    // Build filename (accents kept via filename*, plain-ASCII fallback for old clients)
    const title = (resume.title || 'resume').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_') || 'resume';
    const asciiTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'resume';
    const filename = `${title}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${asciiTitle}.docx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}