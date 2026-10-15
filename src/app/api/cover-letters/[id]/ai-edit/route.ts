import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { generateText, isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import type { AIEditAction } from '@/types/cover-letter';

type Params = { params: Promise<{ id: string }> };

const ACTION_PROMPTS: Record<AIEditAction, string> = {
  rewrite: 'Rewrite this section of a cover letter to be more compelling, professional, and impactful. Keep the same meaning but improve the wording.',
  expand: 'Expand this section of a cover letter with more specific details, concrete examples, and measurable achievements. Make it richer and more substantive.',
  shorten: 'Make this section of a cover letter more concise while preserving the key points and impact. Remove filler words and redundant phrases.',
  improve_grammar: 'Fix all grammar, spelling, punctuation, and syntax issues in this cover letter section. Do not change the meaning or tone.',
  improve_tone: 'Improve the professional tone of this cover letter section. Make it more polished, confident, and appropriate for a business communication.',
  replace_paragraph: 'Write a completely new version of this cover letter section that conveys the same message but with fresh, compelling language.',
  regenerate_section: 'Generate a completely new version of this cover letter section from scratch. It should be professional, tailored, and impactful.',
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json({ success: false, error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }

    // Check usage limit (a use is only counted once the AI replies)
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_COVER_LETTER, false);
    if (!access.allowed) {
      if (access.reason === 'limit_reached') {
        return NextResponse.json(
          { success: false, error: 'limit_reached', planName: access.planName, limit: access.limit, used: access.used },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { success: false, error: 'upgrade_required' },
        { status: 403 },
      );
    }

    const { id } = await params;

    const body = (await request.json()) as {
      action: AIEditAction;
      section: string;
      text: string;
      instruction?: string;
      tone?: string;
      language?: string;
    };

    const { action, section, text, instruction, tone, language } = body;

    if (!action || !section || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, section, text' },
        { status: 400 },
      );
    }

    const validActions: AIEditAction[] = ['rewrite', 'expand', 'shorten', 'improve_grammar', 'improve_tone', 'replace_paragraph', 'regenerate_section'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const systemPrompt = language === 'fr'
      ? 'Vous êtes un expert en rédaction de lettres de motivation. Répondez uniquement par le texte modifié, sans guillemets ni explications.'
      : 'You are an expert cover letter writer and editor. Respond ONLY with the rewritten text, no quotes, no explanations.';

    let userPrompt = `${ACTION_PROMPTS[action]}\n\n`;
    if (instruction) {
      userPrompt += `Additional instruction: ${instruction}\n\n`;
    }
    if (tone) {
      userPrompt += `Desired tone: ${tone}\n\n`;
    }
    userPrompt += `Section: ${section}\nText to edit:\n${text}`;

    const result = await generateText([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    await recordUsage(auth.userId, FEATURE_KEYS.AI_COVER_LETTER);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('AI edit error:', error);
    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process AI edit. Please try again.' },
      { status: 500 },
    );
  }
}
