import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { generateText, isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';

interface AiSuggestion {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

type Params = { params: Promise<{ id: string }> };

const SUGGESTION_TYPES = ['interview_tips', 'resume_improvements', 'cover_letter_tips', 'follow_up_advice', 'negotiation_tips'] as const;

/**
 * POST /api/job-tracker/[id]/ai-suggest — Generate AI suggestions for a job application
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json({ success: false, error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }

    // Check AI usage limit (a use is only counted once the AI replies)
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_REQUESTS, false);
    if (!access.allowed) {
      if (access.reason === 'limit_reached') {
        return NextResponse.json(
          { success: false, error: 'limit_reached', planName: access.planName, limit: access.limit, used: access.used },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { success: false, error: 'This feature is not available on your plan' },
        { status: 403 },
      );
    }

    const { id } = await params;

    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      types?: string[];
      context?: string;
    };

    const requestedTypes = (body.types || ['interview_tips', 'resume_improvements', 'cover_letter_tips'])
      .filter((t): t is (typeof SUGGESTION_TYPES)[number] => SUGGESTION_TYPES.includes(t as (typeof SUGGESTION_TYPES)[number]));

    if (requestedTypes.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid suggestion types provided' }, { status: 400 });
    }

    // Build context for AI
    const jobContext = `Job Title: ${application.job_title}
Company: ${application.company_name}${application.job_description ? `\nJob Description: ${application.job_description}` : ''}${application.location ? `\nLocation: ${application.location}` : ''}${application.employment_type ? `\nEmployment Type: ${application.employment_type}` : ''}${application.salary ? `\nSalary: ${application.salary}` : ''}${application.notes ? `\nNotes: ${application.notes}` : ''}`;

    const extraContext = body.context ? `\nAdditional Context: ${body.context}` : '';

    // Generate suggestions for all requested types at the same time
    const suggestions: AiSuggestion[] = await Promise.all(requestedTypes.map(async (type) => {
      let prompt = '';
      let systemPrompt = 'You are a career coach and job search expert. Provide actionable, specific, and concise advice. Respond in a clear, structured format with bullet points or numbered lists. Keep each suggestion to 2-4 sentences maximum.';

      switch (type) {
        case 'interview_tips':
          prompt = `Based on this job application, provide 3-4 specific interview preparation tips:\n\n${jobContext}${extraContext}`;
          break;
        case 'resume_improvements':
          prompt = `Based on this job posting, suggest 3-4 specific improvements for the user's resume to better match this position:\n\n${jobContext}${extraContext}`;
          break;
        case 'cover_letter_tips':
          prompt = `Based on this job application, suggest 3-4 key points to include in a cover letter for this position:\n\n${jobContext}${extraContext}`;
          break;
        case 'follow_up_advice':
          prompt = `Based on this job application (status: ${application.status}), provide 2-3 follow-up strategies and timing recommendations:\n\n${jobContext}${extraContext}`;
          break;
        case 'negotiation_tips':
          prompt = `Based on this job application, provide 2-3 salary negotiation tips and strategies:${application.salary ? ` Target salary range: ${application.salary}` : ''}\n\n${jobContext}${extraContext}`;
          break;
      }

      const content = await generateText([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ]);

      return {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        content,
        createdAt: new Date().toISOString(),
      };
    }));
    await recordUsage(auth.userId, FEATURE_KEYS.AI_REQUESTS);

    // Store suggestions in the application
    let existingSuggestions: AiSuggestion[] = [];
    try {
      existingSuggestions = JSON.parse(application.ai_suggestions || '[]');
    } catch {
      existingSuggestions = [];
    }

    // Keep only the 20 most recent suggestions
    const allSuggestions = [...existingSuggestions, ...suggestions].slice(-20);

    await db.jobApplication.update({
      where: { id },
      data: { ai_suggestions: JSON.stringify(allSuggestions) },
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error('AI suggest error:', error);
    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to generate AI suggestions' }, { status: 500 });
  }
}
