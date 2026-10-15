import { NextRequest, NextResponse } from 'next/server';
import { generateText, parseJsonReply, isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { getRequestLocale, replyLanguageInstruction } from '@/lib/ai/locale';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere } from '@/lib/subscription/documents';
import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import type { ResumeData } from '@/types/resume';
import { resumeDataToText } from '@/lib/resume/to-text';
import { REVIEW_SYSTEM_PROMPT, normalizeReview } from '@/lib/resume/review';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json({ success: false, error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }

    // A use is only counted once the AI replies
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_RESUME_REVIEW, false);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason === 'limit_reached' ? 'limit_reached' : 'upgrade_required', planName: access.planName },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { resumeId, resumeText } = body as { resumeId?: string; resumeText?: string };

    let textToAnalyze = resumeText || '';

    if (!textToAnalyze && resumeId) {
      const resume = await db.resume.findFirst({
        where: { id: resumeId, ...(await docWhere(auth.userId)) },
      });
      if (!resume) {
        return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
      }
      const data = JSON.parse(resume.data_json || '{}') as ResumeData;
      textToAnalyze = resumeDataToText(data);
    }

    if (!textToAnalyze.trim()) {
      return NextResponse.json({ success: false, error: 'No resume content provided' }, { status: 400 });
    }

    const raw = await generateText(
      [
        { role: 'system', content: REVIEW_SYSTEM_PROMPT + replyLanguageInstruction(getRequestLocale(request)) },
        { role: 'user', content: `Resume:\n"""\n${textToAnalyze.substring(0, 12000)}\n"""` },
      ],
      // Low temperature: the same resume should get (nearly) the same review
      { temperature: 0.2, json: true },
    );

    const review = normalizeReview(parseJsonReply<unknown>(raw));
    await recordUsage(auth.userId, FEATURE_KEYS.AI_RESUME_REVIEW);

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Resume review error:', error);
    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to analyze resume' }, { status: 500 });
  }
}
