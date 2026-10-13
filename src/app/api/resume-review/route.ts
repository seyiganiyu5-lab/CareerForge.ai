import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import type { ResumeData } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_RESUME_REVIEW);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason === 'limit_reached' ? 'Usage limit reached' : 'Upgrade required', planName: access.planName },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { resumeId, resumeText } = body as { resumeId?: string; resumeText?: string };

    let textToAnalyze = resumeText || '';

    if (!textToAnalyze && resumeId) {
      const resume = await db.resume.findFirst({
        where: { id: resumeId, user_id: auth.userId },
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

    const zai = await ZAI.create();

    const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume text and provide a comprehensive review.

Evaluate it across these 4 sections:
1. Summary / Professional Summary
2. Experience / Work History
3. Education
4. Skills

For EACH section, provide:
- name: The section name
- score: A score from 0 to 100
- feedback: 2-3 sentences of detailed feedback on what's good and what needs improvement
- suggestions: An array of 2-4 specific, actionable improvement suggestions

Also provide an overall score from 0-100 that considers:
- Content quality (clarity, relevance, impact)
- Formatting and structure
- Impact and quantification of achievements
- Keyword optimization for ATS
- Overall professionalism

IMPORTANT: Respond ONLY with valid JSON in this exact format, no markdown or extra text:
{
  "score": 75,
  "sections": [
    {
      "name": "Summary",
      "score": 80,
      "feedback": "...",
      "suggestions": ["...", "..."]
    },
    {
      "name": "Experience",
      "score": 70,
      "feedback": "...",
      "suggestions": ["...", "..."]
    },
    {
      "name": "Education",
      "score": 85,
      "feedback": "...",
      "suggestions": ["..."]
    },
    {
      "name": "Skills",
      "score": 65,
      "feedback": "...",
      "suggestions": ["...", "..."]
    }
  ]
}

Resume text:
---
${textToAnalyze.substring(0, 8000)}`;

    const completion = await zai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert resume reviewer. Always respond with valid JSON only, no markdown fences.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const review = JSON.parse(cleaned) as {
      score: number;
      sections: { name: string; score: number; feedback: string; suggestions: string[] }[];
    };

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Resume review error:', error);
    return NextResponse.json({ success: false, error: 'Failed to analyze resume' }, { status: 500 });
  }
}

function resumeDataToText(data: ResumeData): string {
  const parts: string[] = [];

  const pi = data.personalInfo;
  if (pi) {
    if (pi.fullName) parts.push(pi.fullName);
    if (pi.professionalTitle) parts.push(pi.professionalTitle);
    if (pi.email) parts.push(pi.email);
    if (pi.phone) parts.push(pi.phone);
    if (pi.location) parts.push(pi.location);
  }

  if (data.professionalSummary) {
    parts.push('Professional Summary', data.professionalSummary);
  }

  if (data.workExperience?.length) {
    parts.push('Work Experience');
    for (const exp of data.workExperience) {
      if (exp.position) parts.push(`- ${exp.position} at ${exp.company || 'Unknown'}`);
      if (exp.startDate) parts.push(`  ${exp.startDate} - ${exp.endDate || 'Present'}`);
      if (exp.description) parts.push(`  ${exp.description}`);
    }
  }

  if (data.education?.length) {
    parts.push('Education');
    for (const edu of data.education) {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      if (degree || edu.school) parts.push(`- ${degree || 'Studies'} at ${edu.school || 'Unknown'}`);
      if (edu.startDate) parts.push(`  ${edu.startDate} - ${edu.endDate || 'Present'}`);
      if (edu.grade) parts.push(`  Grade: ${edu.grade}`);
    }
  }

  if (data.skills?.length) {
    parts.push('Skills', data.skills.map(s => typeof s === 'string' ? s : s.name || '').filter(Boolean).join(', '));
  }

  return parts.join('\n');
}