import { NextRequest, NextResponse } from 'next/server';
import { generateText, isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { getRequestLocale, contentLanguageInstruction } from '@/lib/ai/locale';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_SECTIONS = [
  'professionalSummary',
  'workExperience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'custom',
] as const;

const VALID_ACTIONS = [
  'generate',
  'rewrite',
  'improve',
  'expand',
  'condense',
  'shorten',
  'more_professional',
  'more_technical',
  'simplify',
  'achievement',
  'grammar',
  'keywords',
  'skills_suggest',
  'custom',
] as const;

const TONE_MODIFIERS: Record<string, string> = {
  professional: 'Use a professional, polished tone.',
  executive: 'Use an executive-level, strategic tone.',
  technical: 'Emphasize technical skills, tools, and methodologies.',
  graduate: 'Use a tone appropriate for a recent graduate.',
  entry_level: 'Use a tone appropriate for an entry-level position.',
  concise: 'Be extremely concise. Remove all filler words.',
};

const BASE_SYSTEM_PROMPT = `You are an expert resume writer and career coach with deep knowledge of ATS (Applicant Tracking System) optimization. Your task is to help users write stronger, more professional, ATS-friendly resumes. Always:
- Use strong action verbs (Led, Developed, Implemented, Achieved, Optimized, etc.)
- Include measurable achievements where possible (numbers, percentages, dollar amounts)
- Keep content concise and impactful
- Optimize for ATS keywords and formatting
- Avoid first-person pronouns
- Use consistent tense (past tense for past roles, present for current)
- Return ONLY the improved text, no explanations or markdown formatting unless specifically asked`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Section = (typeof VALID_SECTIONS)[number];
type Action = (typeof VALID_ACTIONS)[number];

interface AiAssistBody {
  section: string;
  action: string;
  content?: string;
  itemId?: string;
  customPrompt?: string;
  tone?: string;
  resumeContext?: ResumeContext;
  field?: string;
}

interface ResumeContext {
  personalInfo?: {
    fullName?: string;
    professionalTitle?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  professionalSummary?: string;
  workExperience?: Array<{
    id?: string;
    position?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    id?: string;
    degree?: string;
    field?: string;
    institution?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    description?: string;
  }>;
  skills?: Array<{ id?: string; name?: string }>;
  projects?: Array<{
    id?: string;
    name?: string;
    description?: string;
    technologies?: string | string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    name?: string;
    proficiency?: string;
  }>;
}

interface PromptResult {
  systemPrompt: string;
  userMessage: string;
}

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

function buildPrompt(
  section: string,
  action: string,
  body: AiAssistBody
): PromptResult {
  const { content, customPrompt, resumeContext, itemId, field } = body;
  const ctx = resumeContext;

  // Extract commonly needed context values
  const jobTitle = ctx?.personalInfo?.professionalTitle || 'professional';
  const skillsList = (ctx?.skills || []).map((s: { name?: string }) => s.name).filter(Boolean).join(', ') || '';
  const yearsOfExperience = estimateYearsOfExperience(ctx?.workExperience || []);

  // Tone modifier
  const toneModifier = body.tone && TONE_MODIFIERS[body.tone]
    ? `\n\n${TONE_MODIFIERS[body.tone]}`
    : '';

  let userMessage = '';
  let systemPrompt = BASE_SYSTEM_PROMPT + toneModifier;

  // -----------------------------------------------------------------------
  // Professional Summary
  // -----------------------------------------------------------------------
  if (section === 'professionalSummary') {
    switch (action) {
      case 'generate':
        userMessage = `Write a professional summary for a ${jobTitle} with ${yearsOfExperience} years of experience. Skills: ${skillsList}. Make it ATS-friendly, 2-3 sentences.`;
        break;

      case 'rewrite':
        userMessage = `Rewrite this professional summary to be more impactful and ATS-optimized.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'improve':
        userMessage = `Improve this professional summary with stronger action verbs and quantifiable achievements.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'shorten':
        userMessage = `Shorten this professional summary to 1-2 sentences while keeping key information.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'expand':
        userMessage = `Expand this professional summary with more detail about achievements and expertise.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'more_professional':
        userMessage = `Make this professional summary more formal and executive-level.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'more_technical':
        userMessage = `Make this professional summary more technically focused, emphasizing tools, technologies, and methodologies.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'simplify':
        userMessage = `Simplify this professional summary for clarity, removing jargon.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any grammar, spelling, or writing issues in this professional summary.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;

      case 'keywords':
        userMessage = `Suggest ATS-friendly keywords commonly found in job descriptions for a ${jobTitle}. Explain why each keyword is valuable. Format as: keyword - reason.`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Current summary:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve this professional summary.\n\nCurrent summary:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Work Experience
  // -----------------------------------------------------------------------
  else if (section === 'workExperience') {
    const targetItem = findWorkExperienceItem(ctx, itemId);
    const position = targetItem?.position || 'this role';
    const company = targetItem?.company || 'the company';

    switch (action) {
      case 'generate':
        userMessage = `Write 3-5 bullet points for a ${position} role at ${company}. Responsibilities: ${content || '(not provided)'}. Technologies: ${skillsList || 'from the skills section'}. Use strong action verbs and measurable achievements.`;
        break;

      case 'rewrite':
        userMessage = `Rewrite these work experience bullet points to be more impactful.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'improve':
        userMessage = `Improve these bullet points with stronger action verbs and measurable impact.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'expand':
        userMessage = `Expand these bullet points with more detail and achievements.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'condense':
        userMessage = `Condense these bullet points to be more concise while keeping key achievements.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'shorten':
        userMessage = `Shorten these bullet points while retaining the most important information.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'achievement':
        userMessage = `Transform these responsibilities into measurable achievements with quantified results. Add metrics, percentages, or numbers where possible.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'more_professional':
        userMessage = `Make these work experience bullet points more formal and executive-level.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'more_technical':
        userMessage = `Make these work experience bullet points more technically focused, emphasizing specific tools, technologies, and methodologies used.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'simplify':
        userMessage = `Simplify these work experience bullet points for clarity, removing jargon.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any grammar, spelling, or writing issues.\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;

      case 'keywords':
        userMessage = `Suggest ATS-friendly keywords commonly found in job descriptions for a ${position} role. Explain why each keyword is valuable. Format as: keyword - reason.`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Position: ${position} at ${company}\n\nCurrent bullet points:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve these work experience bullet points.\n\nPosition: ${position} at ${company}\n\nCurrent bullet points:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Education
  // -----------------------------------------------------------------------
  else if (section === 'education') {
    const targetItem = findEducationItem(ctx, itemId);
    const degree = targetItem?.degree || 'this degree';
    const field = targetItem?.field || '';
    const institution = targetItem?.institution || 'this institution';

    switch (action) {
      case 'generate':
        userMessage = `Write a brief description for a ${degree}${field ? ` in ${field}` : ''} from ${institution}. Highlight relevant coursework, honors, or activities if applicable.`;
        break;

      case 'improve':
        userMessage = `Improve this education entry description.\n\nDegree: ${degree}${field ? ` in ${field}` : ''} at ${institution}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'rewrite':
        userMessage = `Rewrite this education entry to be more impactful.\n\nDegree: ${degree}${field ? ` in ${field}` : ''} at ${institution}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'expand':
        userMessage = `Expand this education entry with more detail about relevant coursework, projects, honors, or activities.\n\nDegree: ${degree}${field ? ` in ${field}` : ''} at ${institution}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'shorten':
        userMessage = `Shorten this education entry while keeping the most relevant information.\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any grammar, spelling, or writing issues in this education entry.\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Degree: ${degree}${field ? ` in ${field}` : ''} at ${institution}\n\nCurrent description:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve this education entry.\n\nDegree: ${degree}${field ? ` in ${field}` : ''} at ${institution}\n\nCurrent description:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Skills
  // -----------------------------------------------------------------------
  else if (section === 'skills') {
    switch (action) {
      case 'skills_suggest':
        userMessage = `Suggest 8-10 relevant skills for a ${jobTitle} with ${skillsList ? `current skills including: ${skillsList}` : 'no existing skills listed'}. Categorize them into Technical and Soft skills. Return in this EXACT format:

Technical: Skill1, Skill2, Skill3, Skill4, Skill5
Soft: Skill6, Skill7, Skill8

Only use "Technical:" and "Soft:" as prefixes. Do not add any other text, explanations, or formatting.`;
        break;

      case 'improve':
        userMessage = `Improve and organize these skills to be more ATS-friendly and impactful.\n\nCurrent skills:\n${content || '(empty)'}`;
        break;

      case 'rewrite':
        userMessage = `Rewrite and reorganize these skills for better presentation and ATS optimization.\n\nCurrent skills:\n${content || '(empty)'}`;
        break;

      case 'keywords':
        userMessage = `Suggest ATS-friendly keywords commonly found in job descriptions for a ${jobTitle}. Explain why each keyword is valuable. Format as: keyword - reason.`;
        break;

      case 'grammar':
        userMessage = `Check and fix any spelling, formatting, or consistency issues in this skills list.\n\nCurrent skills:\n${content || '(empty)'}`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Current skills:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve these skills.\n\nCurrent skills:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Projects
  // -----------------------------------------------------------------------
  else if (section === 'projects') {
    const targetItem = findProjectItem(ctx, itemId);
    const projectName = targetItem?.name || 'this project';
    const techRaw = targetItem?.technologies;
    const technologies = Array.isArray(techRaw) ? techRaw.join(', ') : (techRaw || '');

    switch (action) {
      case 'generate':
        userMessage = `Write a description for a project called "${projectName}"${technologies ? ` using ${technologies}` : ''}. Make it concise, highlight the purpose, and emphasize measurable outcomes.`;
        break;

      case 'improve':
        userMessage = `Improve this project description to be more impactful and results-oriented.\n\nProject: ${projectName}${technologies ? `\nTechnologies: ${technologies}` : ''}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'rewrite':
        userMessage = `Rewrite this project description for stronger impact.\n\nProject: ${projectName}${technologies ? `\nTechnologies: ${technologies}` : ''}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'expand':
        userMessage = `Expand this project description with more detail about the problem solved, approach taken, and results achieved.\n\nProject: ${projectName}${technologies ? `\nTechnologies: ${technologies}` : ''}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'shorten':
        userMessage = `Shorten this project description while keeping the most important information.\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'achievement':
        userMessage = `Transform this project description to emphasize measurable achievements and quantified results.\n\nProject: ${projectName}\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any grammar, spelling, or writing issues in this project description.\n\nCurrent description:\n${content || '(empty)'}`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Project: ${projectName}\n\nCurrent description:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve this project description.\n\nProject: ${projectName}\n\nCurrent description:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Certifications
  // -----------------------------------------------------------------------
  else if (section === 'certifications') {
    switch (action) {
      case 'improve':
        userMessage = `Improve this certification entry for better presentation.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any grammar, spelling, or writing issues in this certification entry.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Current entry:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve this certification entry.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Languages
  // -----------------------------------------------------------------------
  else if (section === 'languages') {
    switch (action) {
      case 'improve':
        userMessage = `Improve this language entry for better presentation.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;

      case 'grammar':
        userMessage = `Check and fix any formatting or consistency issues in this language entry.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;

      case 'custom':
        userMessage = `${customPrompt || ''}\n\n${content ? `Current entry:\n${content}` : ''}`;
        break;

      default:
        userMessage = `Improve this language entry.\n\nCurrent entry:\n${content || '(empty)'}`;
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Custom / Fallback
  // -----------------------------------------------------------------------
  else {
    if (action === 'custom') {
      userMessage = `${customPrompt || ''}\n\n${content ? `Content:\n${content}` : ''}`;
    } else {
      userMessage = `${action}: ${content || '(no content provided)'}`;
    }
  }

  // Override for grammar action on any section that wasn't handled specifically
  if (action === 'grammar' && section !== 'professionalSummary' && section !== 'workExperience' && section !== 'education' && section !== 'skills' && section !== 'projects' && section !== 'certifications' && section !== 'languages') {
    userMessage = `Check and fix grammar, spelling, repetition, weak wording, and passive voice. Return only the corrected text.\n\n${content || '(empty)'}`;
  }

  // Override for keywords action on any section that wasn't handled specifically
  if (action === 'keywords' && section !== 'professionalSummary' && section !== 'workExperience' && section !== 'skills') {
    userMessage = `Suggest ATS-friendly keywords commonly found in job descriptions for a ${jobTitle}. Explain why each keyword is valuable. Format as: keyword - reason.`;
  }

  return { systemPrompt, userMessage };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateYearsOfExperience(workExperience?: ResumeContext['workExperience']): string {
  if (!workExperience || workExperience.length === 0) return 'several';
  let totalYears = 0;
  for (const exp of workExperience) {
    if (exp.startDate) {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      const diffMs = end.getTime() - start.getTime();
      totalYears += Math.max(0, Math.round(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
    }
  }
  return totalYears > 0 ? String(totalYears) : 'several';
}

function findWorkExperienceItem(
  ctx: ResumeContext | undefined,
  itemId?: string
): ResumeContext['workExperience'] extends (infer T)[] | undefined ? NonNullable<T> : never {
  if (!ctx?.workExperience || !itemId) return {} as never;
  return ctx.workExperience.find((item) => item.id === itemId) || ({} as never);
}

function findEducationItem(
  ctx: ResumeContext | undefined,
  itemId?: string
): ResumeContext['education'] extends (infer T)[] | undefined ? NonNullable<T> : never {
  if (!ctx?.education || !itemId) return {} as never;
  return ctx.education.find((item) => item.id === itemId) || ({} as never);
}

function findProjectItem(
  ctx: ResumeContext | undefined,
  itemId?: string
): ResumeContext['projects'] extends (infer T)[] | undefined ? NonNullable<T> : never {
  if (!ctx?.projects || !itemId) return {} as never;
  return ctx.projects.find((item) => item.id === itemId) || ({} as never);
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
    const body: AiAssistBody = await request.json();
    const { section, action, content, customPrompt, tone, resumeContext, itemId, field } = body;

    if (!section || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: section and action' },
        { status: 400 }
      );
    }

    if (!VALID_SECTIONS.includes(section as Section)) {
      return NextResponse.json(
        { success: false, error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_ACTIONS.includes(action as Action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    if (action === 'custom' && !customPrompt) {
      return NextResponse.json(
        { success: false, error: 'customPrompt is required when action is "custom"' },
        { status: 400 }
      );
    }

    // 3. Resolve resume ID from route params
    const { id } = await params;

    // 4. Ownership check
    const resume = await db.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.user_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    if (!isAIConfigured()) {
      return NextResponse.json({ success: false, error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }

    // 5. Feature gating (a use is only counted once the AI replies)
    const usage = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_RESUME_BUILDER, false);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: usage.reason || 'limit_reached',
          limit: usage.limit,
          used: usage.used,
          planName: usage.planName,
        },
        { status: 403 }
      );
    }

    // 6. Build the AI prompt
    const { systemPrompt, userMessage } = buildPrompt(section, action, body);

    // 7. Call the AI
    const aiResponse = await generateText([
      { role: 'system', content: systemPrompt + contentLanguageInstruction(getRequestLocale(request)) },
      { role: 'user', content: userMessage },
    ]);
    await recordUsage(auth.userId, FEATURE_KEYS.AI_RESUME_BUILDER);

    // 8. Save to AiHistory
    await db.aiHistory.create({
      data: {
        resume_id: id,
        user_id: auth.userId,
        section,
        action,
        prompt: systemPrompt + '\n\n' + userMessage,
        result: aiResponse,
        original_text: content || '',
      },
    });

    // 9. Return success
    return NextResponse.json({
      success: true,
      result: aiResponse,
      action,
      section,
      usage: {
        limit: usage.limit,
        used: usage.used + 1, // reflect the just-incremented count
      },
    });
  } catch (error) {
    console.error('[AI Assist] Error:', error);

    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}