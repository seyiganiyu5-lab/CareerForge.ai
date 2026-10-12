import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';
import type { ToneType } from '@/types/cover-letter';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check usage limit
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_COVER_LETTER);
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

    const body = (await request.json()) as {
      jobTitle?: string;
      companyName?: string;
      hiringManager?: string;
      jobDescription?: string;
      resumeId?: string;
      tone?: ToneType;
      language?: 'en' | 'fr';
    };

    const { jobTitle, companyName, hiringManager, jobDescription, resumeId, tone, language } = body;

    if (!jobTitle || !companyName || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: jobTitle, companyName, jobDescription' },
        { status: 400 },
      );
    }

    // Fetch resume data if a resume ID was provided
    let resumeContent = '';
    if (resumeId) {
      const resume = await db.resume.findFirst({
        where: { id: resumeId, user_id: auth.userId },
        select: { data_json: true },
      });
      if (resume) {
        try {
          const parsed = JSON.parse(resume.data_json);
          resumeContent = JSON.stringify(parsed, null, 2);
        } catch {
          resumeContent = resume.data_json;
        }
      }
    }

    // Fetch user info
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { first_name: true, last_name: true, job_title: true, career_level: true, country: true },
    });

    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
    const userJobTitle = user?.job_title || '';
    const userCareerLevel = user?.career_level || '';

    const lang = language || 'en';
    const isFrench = lang === 'fr';

    const toneDescriptions: Record<ToneType, string> = {
      professional: isFrench ? 'professionnel et poli' : 'professional and polished',
      executive: isFrench ? 'autoritaire et axé sur le leadership' : 'authoritative and leadership-focused',
      technical: isFrench ? 'orienté sur les détails avec une profondeur technique' : 'detail-oriented with technical depth',
      friendly: isFrench ? 'chaleureux et accessible' : 'warm and approachable',
      'entry-level': isFrench ? 'enthousiaste avec une mentalité de croissance' : 'enthusiastic with growth mindset',
      graduate: isFrench ? 'académique et axé sur les réalisations' : 'academic and achievement-focused',
      creative: isFrench ? 'unique et expressif' : 'unique and expressive',
    };

    const systemPrompt = isFrench
      ? `Vous êtes un expert en rédaction de lettres de motivation professionnelles. Vous écrivez des lettres de motivation convaincantes et personnalisées qui mettent en valeur les forces d'un candidat et les alignent sur une opportunité d'emploi spécifique. Écrivez toujours à la première personne. Gardez la lettre concise (3-4 paragraphes, environ 250-350 mots). N'incluez pas de texte d'espace réservé — utilisez les détails réels fournis. Répondez UNIQUEMENT en JSON valide.`
      : `You are a professional cover letter writer with deep expertise in career communications. You write compelling, tailored cover letters that highlight a candidate's strengths and align them with a specific job opportunity. Always write in the first person. Keep the letter concise (3-4 paragraphs, approximately 250-350 words). Do not include placeholder text like [Company Name] or [Job Title] — use the actual details provided. Respond ONLY with valid JSON.`;

    const userPrompt = isFrench
      ? `Rédigez une lettre de motivation ${toneDescriptions[tone || 'professional']} avec les détails suivants :

**Informations du candidat :**
- Nom : ${userName || 'Non fourni'}
- Titre professionnel actuel : ${userJobTitle || 'Non fourni'}
- Niveau de carrière : ${userCareerLevel || 'Non fourni'}

**Poste cible :**
- Titre du poste : ${jobTitle}
- Entreprise : ${companyName}
${hiringManager ? `- Responsable du recrutement : ${hiringManager}` : ''}

**Description du poste :**
${jobDescription}

${resumeContent ? `**Données du CV du candidat :**\n${resumeContent}\n\nUtilisez ces informations pour mettre en évidence les compétences et expériences pertinentes.` : ''}

**Ton :** ${toneDescriptions[tone || 'professional']}

Renvoyez UNIQUEMENT un objet JSON valide avec ces champs exacts (pas de texte supplémentaire) :
{
  "salutation": "${hiringManager ? `Cher/Chère ${hiringManager}` : 'Cher responsable du recrutement'}",
  "opening": "Premier paragraphe - qui vous êtes et pourquoi vous postulez",
  "body": "Paragraphe principal - compétences pertinentes et réalisations",
  "closing": "Paragraphe final - appel à l'action",
  "signOff": "Cordialement"
}`
      : `Write a ${toneDescriptions[tone || 'professional']} cover letter with the following details:

**Applicant Information:**
- Name: ${userName || 'Not provided'}
- Current/Target Job Title: ${userJobTitle || 'Not provided'}
- Career Level: ${userCareerLevel || 'Not provided'}

**Target Position:**
- Job Title: ${jobTitle}
- Company: ${companyName}
${hiringManager ? `- Hiring Manager: ${hiringManager}` : ''}

**Job Description:**
${jobDescription}

${resumeContent ? `**Applicant's Resume Data:**\n${resumeContent}\n\nUse this resume information to highlight relevant skills, experiences, and achievements that match the job requirements.` : ''}

**Tone:** ${toneDescriptions[tone || 'professional']}

Respond ONLY with a valid JSON object with these exact fields (no additional text):
{
  "salutation": "${hiringManager ? `Dear ${hiringManager}` : 'Dear Hiring Manager'}",
  "opening": "First paragraph - who you are and why you're writing",
  "body": "Main body paragraph - relevant skills and achievements",
  "closing": "Final paragraph - call to action",
  "signOff": "Sincerely,"
}`;

    // Call AI SDK
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || '';

    // Try to parse JSON from the response
    let content: { salutation: string; opening: string; body: string; closing: string; signOff: string };
    try {
      // Strip markdown code fences if present
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(jsonStr);
    } catch {
      // Fallback: treat entire response as body text
      content = {
        salutation: hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Manager,',
        opening: '',
        body: raw,
        closing: '',
        signOff: 'Sincerely,',
      };
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 },
    );
  }
}
