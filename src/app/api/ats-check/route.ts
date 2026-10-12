import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import type { ResumeData } from '@/types/resume';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryResult {
  score: number;
  maxScore: number;
  label: string;
  issues: string[];
}

interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchRate: number;
}

interface AiAnalysis {
  grammarIssues: { message: string; suggestion: string }[];
  suggestions: { message: string; priority: 'high' | 'medium' | 'low' }[];
  strengths: string[];
  weaknesses: string[];
}

// ---------------------------------------------------------------------------
// Helpers: Resume → plain text
// ---------------------------------------------------------------------------

function resumeDataToText(data: ResumeData): string {
  const parts: string[] = [];

  // Personal info
  const pi = data.personalInfo;
  if (pi) {
    if (pi.fullName) parts.push(pi.fullName);
    if (pi.professionalTitle) parts.push(pi.professionalTitle);
    if (pi.email) parts.push(pi.email);
    if (pi.phone) parts.push(pi.phone);
    if (pi.location) parts.push(pi.location);
    if (pi.website) parts.push(pi.website);
    if (pi.linkedin) parts.push(pi.linkedin);
    if (pi.github) parts.push(pi.github);
    if (pi.portfolio) parts.push(pi.portfolio);
  }

  // Summary
  if (data.professionalSummary) {
    parts.push('Professional Summary');
    parts.push(data.professionalSummary);
  }

  // Work experience
  if (data.workExperience?.length) {
    parts.push('Work Experience');
    for (const w of data.workExperience) {
      if (w.position) parts.push(w.position);
      if (w.company) parts.push(w.company);
      if (w.location) parts.push(w.location);
      if (w.startDate) parts.push(w.startDate);
      if (w.endDate) parts.push(w.endDate);
      if (w.description) parts.push(w.description);
    }
  }

  // Education
  if (data.education?.length) {
    parts.push('Education');
    for (const e of data.education) {
      if (e.school) parts.push(e.school);
      if (e.degree) parts.push(e.degree);
      if (e.fieldOfStudy) parts.push(e.fieldOfStudy);
      if (e.location) parts.push(e.location);
      if (e.startDate) parts.push(e.startDate);
      if (e.endDate) parts.push(e.endDate);
      if (e.grade) parts.push(e.grade);
    }
  }

  // Skills
  if (data.skills?.length) {
    parts.push('Skills');
    parts.push(data.skills.map(s => s.name).join(', '));
  }

  // Projects
  if (data.projects?.length) {
    parts.push('Projects');
    for (const p of data.projects) {
      if (p.name) parts.push(p.name);
      if (p.description) parts.push(p.description);
      if (p.technologies) parts.push(p.technologies);
    }
  }

  // Certifications
  if (data.certifications?.length) {
    parts.push('Certifications');
    for (const c of data.certifications) {
      if (c.name) parts.push(c.name);
      if (c.issuer) parts.push(c.issuer);
      if (c.issueDate) parts.push(c.issueDate);
    }
  }

  // Languages
  if (data.languages?.length) {
    parts.push('Languages');
    for (const l of data.languages) {
      if (l.language) parts.push(l.language);
      if (l.proficiency) parts.push(l.proficiency);
    }
  }

  // Awards
  if (data.awards?.length) {
    parts.push('Awards');
    for (const a of data.awards) {
      if (a.name) parts.push(a.name);
      if (a.organization) parts.push(a.organization);
      if (a.year) parts.push(a.year);
    }
  }

  // Volunteer
  if (data.volunteerExperience?.length) {
    parts.push('Volunteer Experience');
    for (const v of data.volunteerExperience) {
      if (v.organization) parts.push(v.organization);
      if (v.role) parts.push(v.role);
      if (v.description) parts.push(v.description);
    }
  }

  // References
  if (data.references?.length) {
    parts.push('References');
    for (const r of data.references) {
      if (r.name) parts.push(r.name);
      if (r.position) parts.push(r.position);
      if (r.company) parts.push(r.company);
    }
  }

  // Additional info
  if (data.additionalInfo?.text) {
    parts.push('Additional Information');
    parts.push(data.additionalInfo.text);
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function scoreContactInfo(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;

  // Check via structured data if available
  const hasName = data?.personalInfo?.fullName?.trim() ? true : /([A-Z][a-z]+ [A-Z][a-z]+)/.test(text);
  const hasEmail = data?.personalInfo?.email?.trim() ? true : /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = data?.personalInfo?.phone?.trim() ? true : /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
  const hasLocation = data?.personalInfo?.location?.trim() ? true : false;

  if (hasName) score += 4; else issues.push('Full name is missing or incomplete.');
  if (hasEmail) score += 4; else issues.push('Email address is missing.');
  if (hasPhone) score += 4; else issues.push('Phone number is missing.');
  if (hasLocation) score += 3; else issues.push('Location/city is missing. Adding one helps with local job matching.');

  return { score, maxScore: 15, label: 'Contact Information', issues };
}

function scoreSummary(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  const summary = data?.professionalSummary?.trim() ?? '';

  if (!summary) {
    issues.push('Professional summary is missing. Add a 2-3 sentence summary to make a strong first impression.');
    return { score: 0, maxScore, label: 'Professional Summary', issues };
  }

  if (summary.length >= 50) {
    score += 5;
  } else {
    issues.push(`Summary is too short (${summary.length} chars). Aim for 50+ characters.`);
  }

  if (summary.length >= 150) {
    score += 3;
  } else if (summary.length >= 100) {
    score += 2;
  } else {
    issues.push('Consider expanding your summary to 100-200 characters for better impact.');
  }

  // Check for action/impact language
  const impactWords = /managed|led|developed|achieved|improved|built|delivered|drove|increased|reduced|implemented/i;
  if (impactWords.test(summary)) {
    score += 2;
  } else {
    issues.push('Use action-oriented language with metrics in your summary (e.g., "led a team of 5", "increased revenue by 20%").');
  }

  return { score, maxScore, label: 'Professional Summary', issues };
}

function scoreWorkExperience(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 20;

  const entries = data?.workExperience ?? [];

  if (entries.length === 0) {
    issues.push('Work experience section is missing. This is one of the most important sections for ATS.');
    return { score: 0, maxScore, label: 'Work Experience', issues };
  }

  // Up to 5 points for having entries
  score += Math.min(5, entries.length * 3);

  let hasGoodEntry = false;
  let goodEntryCount = 0;

  for (const entry of entries) {
    let entryScore = 0;

    if (entry.company?.trim()) entryScore += 1;
    else issues.push(`Work entry is missing a company name.`);

    if (entry.position?.trim()) entryScore += 1;
    else issues.push(`Work entry is missing a job title/position.`);

    if (entry.startDate?.trim()) entryScore += 1;
    else issues.push(`Work entry is missing a start date.`);

    // Description with bullet-like content
    const desc = entry.description?.trim() ?? '';
    if (desc.length > 0) {
      entryScore += 1;
      // Check for quantifiable results or bullet-like items
      const bulletIndicators = /^[-•●▪▶◆]\s|^•\s|\n[-•●▪▶◆]\s|\n•\s/m;
      const hasBullets = bulletIndicators.test(desc);
      const hasNumbers = /\d+%|\$[\d,]+|\d+\+?\s*(years?|users?|clients?|projects?|team|people|members?)/i.test(desc);
      if (hasBullets) entryScore += 1;
      if (hasNumbers) entryScore += 1;
    } else {
      issues.push(`Work entry is missing a description. Add bullet points with achievements.`);
    }

    if (entryScore >= 4) {
      hasGoodEntry = true;
      goodEntryCount++;
    }
  }

  // Quality points
  if (hasGoodEntry) score += 5;
  else issues.push('No work experience entry has all required fields (company, position, dates, description).');

  if (goodEntryCount >= 2) score += 3;
  else if (entries.length >= 2) issues.push('Ensure all work experience entries have complete details.');

  // Points for descriptions with impact
  const allDescs = entries.map(e => e.description ?? '').join(' ');
  const actionVerbs = /managed|led|developed|achieved|improved|built|delivered|drove|increased|reduced|implemented|created|designed|launched|optimized|coordinated|established|generated|streamlined|spearheaded/i;
  if (actionVerbs.test(allDescs)) score += 2;
  else issues.push('Use action verbs (e.g., "led", "developed", "achieved") in your work descriptions.');

  if (score > maxScore) score = maxScore;

  return { score, maxScore, label: 'Work Experience', issues };
}

function scoreEducation(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  const entries = data?.education ?? [];

  if (entries.length === 0) {
    issues.push('Education section is missing. Most ATS systems expect this section.');
    return { score: 0, maxScore, label: 'Education', issues };
  }

  for (const entry of entries) {
    if (entry.school?.trim() && entry.degree?.trim()) {
      score += 5;
      if (entry.fieldOfStudy?.trim()) score += 3;
      if (score >= maxScore) break;
    } else {
      if (!entry.school?.trim()) issues.push('Education entry is missing a school/university name.');
      if (!entry.degree?.trim()) issues.push('Education entry is missing a degree.');
      score += 2;
    }
  }

  if (score > maxScore) score = maxScore;

  return { score, maxScore, label: 'Education', issues };
}

function scoreSkills(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  const skills = data?.skills ?? [];

  if (skills.length === 0) {
    issues.push('Skills section is missing. Add at least 3 skills relevant to your target role.');
    return { score: 0, maxScore, label: 'Skills', issues };
  }

  // Points for number of skills
  if (skills.length >= 8) score += 4;
  else if (skills.length >= 5) score += 3;
  else if (skills.length >= 3) score += 2;
  else issues.push('Add at least 3 more skills to strengthen this section.');

  // Check for variety (mix of hard/soft skills)
  const skillNames = skills.map(s => s.name.toLowerCase());
  const softSkillIndicators = /leadership|communication|teamwork|problem.?solving|analytical|creative|adaptable|organized|detail.?oriented|collaboration/i;
  const hardSkillCount = skillNames.filter(n => !softSkillIndicators.test(n)).length;
  const softSkillCount = skillNames.filter(n => softSkillIndicators.test(n)).length;

  if (hardSkillCount > 0 && softSkillCount > 0) {
    score += 3;
  } else if (hardSkillCount > 0) {
    score += 2;
    issues.push('Consider adding soft skills (e.g., leadership, communication) alongside your technical skills.');
  } else {
    score += 1;
    issues.push('Include more technical/hard skills relevant to your target role.');
  }

  // Check for relevant keywords in skill names
  const relevantTechKeywords = /python|javascript|java|react|node|aws|azure|sql|docker|kubernetes|typescript|git|agile|scrum|rest|api|machine.?learning|data.?analysis|project.?management|excel|powerpoint|photoshop|figma|swift|kotlin|c\+\+|ruby|php|go|rust|scala|linux|ci\/cd|devops|terraform|graphql/i;
  const hasRelevantSkills = skillNames.some(n => relevantTechKeywords.test(n));
  if (hasRelevantSkills) score += 3;
  else score += 1;

  if (score > maxScore) score = maxScore;

  return { score, maxScore, label: 'Skills', issues };
}

function scoreFormatting(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 15;

  // Check for section headers — use broad patterns that match singular/plural variants
  const headerPatterns = /\b(?:work\s+)?experience\b|\beducation\b|\bskills?\b/gi;
  const headersFound = (text.match(headerPatterns) || []).length;
  if (headersFound >= 3) score += 4;
  else if (headersFound >= 2) { score += 3; issues.push('Consider adding more standard section headers (Experience, Education, Skills).'); }
  else issues.push('Standard section headers (Experience, Education, Skills) are missing or hard to detect.');

  // Check for consistent date formats within work experience
  const dates = data?.workExperience
    ?.flatMap(e => [e.startDate, e.endDate].filter(Boolean))
    ?? [];

  if (dates.length >= 2) {
    // If using structured data, dates are likely consistent
    score += 3;
  } else if (dates.length > 0) {
    score += 2;
  } else {
    // Check raw text for dates
    const datePatterns = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}\s*[-–—]\s*\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi) || [];
    if (datePatterns.length >= 2) score += 2;
    else issues.push('Add employment dates to your work experience entries.');
  }

  // Check for bullet point usage in descriptions
  // In a structured resume builder, descriptions are rendered as bullets by templates.
  // Check both raw bullet markers AND multi-line descriptions (which become bullets when rendered).
  const allDescriptions = data?.workExperience?.map(e => e.description ?? '').join('\n') ?? '';
  const bulletCount = (allDescriptions.match(/^[-•●▪▶◆]\s/gm) || []).length;
  const lineCount = allDescriptions.split(/\n/).filter(l => l.trim().length > 10).length;
  const hasBulletContent = bulletCount >= 3 || lineCount >= 3;
  if (hasBulletContent) score += 3;
  else if (bulletCount >= 1 || lineCount >= 1) { score += 2; issues.push('Use more bullet points to describe your achievements and responsibilities.'); }
  else if (allDescriptions.length > 0) issues.push('Use bullet points (•, -, etc.) to format your experience descriptions.');

  // Check for special characters that can confuse ATS
  const atsUnfriendlyChars = /[│║═╔╗╚╝┌┐└┘├┤┬┴┼]/;
  if (!atsUnfriendlyChars.test(text)) score += 2;
  else issues.push('Remove box-drawing or special characters that ATS systems cannot parse.');

  // Check that text is not all caps (which can look unprofessional)
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 0) {
    const allCapsWords = words.filter(w => w === w.toUpperCase() && /[A-Z]/.test(w));
    const allCapsRatio = allCapsWords.length / words.length;
    if (allCapsRatio < 0.1) score += 3;
    else if (allCapsRatio < 0.3) { score += 2; issues.push('Avoid using excessive ALL CAPS text. Reserve uppercase for section headers only.'); }
    else { score += 1; issues.push('Too much uppercase text detected. Use standard capitalization for better readability.'); }
  } else {
    score += 3;
  }

  if (score > maxScore) score = maxScore;

  return { score, maxScore, label: 'Formatting Quality', issues };
}

function scoreLength(text: string): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  // Rough word count estimation
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < 100) {
    issues.push('Resume appears to be very short (under 100 words). Aim for at least 300-800 words for a single page.');
    score = 1;
  } else if (wordCount < 200) {
    issues.push('Resume is quite short. Most competitive resumes are 300-800 words.');
    score = 3;
  } else if (wordCount < 300) {
    issues.push('Resume is a bit thin. Consider adding more detail to reach 300+ words.');
    score = 5;
  } else if (wordCount <= 1500) {
    // Sweet spot: 300-1500 words (1-2 pages)
    score = 10;
  } else if (wordCount <= 2000) {
    issues.push('Resume is slightly long. Consider trimming to keep it within 2 pages.');
    score = 7;
  } else {
    issues.push('Resume is too long (over 2000 words). Most recruiters prefer 1-2 page resumes. Trim less relevant content.');
    score = 4;
  }

  return { score, maxScore, label: 'Resume Length', issues };
}

function extractKeywords(jobDescription: string): string[] {
  // Common stop words to exclude from keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'need',
    'dare', 'ought', 'used', 'you', 'your', 'our', 'we', 'they', 'them',
    'their', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'if',
    'not', 'no', 'nor', 'so', 'than', 'too', 'very', 'just', 'about',
    'also', 'then', 'there', 'here', 'each', 'every', 'all', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'what', 'which', 'who', 'whom', 'how', 'when', 'where',
    'why', 'while', 'up', 'out', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'under', 'again', 'further',
    'once', 'work', 'working', 'experience', 'required', 'requirements',
    'preferred', 'qualifications', 'skills', 'ability', 'able', 'strong',
    'excellent', 'good', 'great', 'looking', 'join', 'team', 'role',
    'position', 'job', 'company', 'opportunity', 'responsibilities',
    'include', 'including', 'well', 'new', 'plus', 'etc', 'e.g.',
    'i.e.', 'per', 'via', 'within', 'across', 'among', 'along',
    'minimum', 'maximum', 'least', 'years', 'year', 'like',
  ]);

  // Extract multi-word technical terms first (2-3 words)
  const techPhrases: string[] = [];
  const phrasePatterns = [
    /machine\s+learning/gi,
    /deep\s+learning/gi,
    /data\s+science/gi,
    /data\s+analysis/gi,
    /project\s+management/gi,
    /product\s+management/gi,
    /full\s+stack/gi,
    /front\s*[- ]?end/gi,
    /back\s*[- ]?end/gi,
    /ci\s*\/\s*cd/gi,
    /cloud\s+computing/gi,
    /software\s+development/gi,
    /agile\s+methodology/gi,
    /rest\s*[- ]?api/gi,
    /graphql/gi,
    /user\s+experience/gi,
    /ui\s*\/\s*ux/gi,
    /natural\s+language\s+processing/gi,
    /computer\s+vision/gi,
    /big\s+data/gi,
    /supply\s+chain/gi,
    /quality\s+assurance/gi,
    /continuous\s+integration/gi,
    /continuous\s+delivery/gi,
    /cross[\s-]functional/gi,
    /stakeholder\s+management/gi,
    /business\s+development/gi,
    /customer\s+experience/gi,
    /a\/b\s+testing/gi,
    /unit\s+testing/gi,
  ];

  for (const pattern of phrasePatterns) {
    const matches = jobDescription.match(pattern);
    if (matches) {
      techPhrases.push(...matches.map(m => m.trim().toLowerCase()));
    }
  }

  // Extract single words (alphabetic, 2+ chars)
  const singleWords = jobDescription
    .replace(/[^a-zA-Z\s\-\/\.]/g, ' ')
    .split(/\s+/)
    .map(w => w.toLowerCase().replace(/^[-\/\.]+|[-\/\.]+$/g, ''))
    .filter(w => w.length >= 2 && !stopWords.has(w) && !/^\d+$/.test(w));

  // Count frequency
  const wordFreq = new Map<string, number>();
  for (const w of singleWords) {
    wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  }

  // Get keywords that appear at least once (or are tech phrases)
  const keywords = new Set<string>();
  for (const [word, count] of wordFreq) {
    if (count >= 1 && word.length >= 3) {
      keywords.add(word);
    }
  }
  for (const phrase of techPhrases) {
    keywords.add(phrase);
  }

  return Array.from(keywords);
}

function scoreKeywords(
  resumeText: string,
  jobDescription: string,
): { category: CategoryResult; matchResult: KeywordMatchResult } {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  const keywords = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Cap missing display to 10 most relevant
  const displayMissing = missing.slice(0, 10);

  const matchRate = keywords.length > 0 ? matched.length / keywords.length : 1;

  if (keywords.length === 0) {
    score = 10;
  } else if (matchRate >= 0.7) {
    score = 10;
  } else if (matchRate >= 0.5) {
    score = 7;
    if (displayMissing.length > 0) {
      issues.push(`${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
    }
  } else if (matchRate >= 0.3) {
    score = 5;
    if (displayMissing.length > 0) {
      issues.push(`${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
    }
  } else if (matchRate >= 0.15) {
    score = 3;
    if (displayMissing.length > 0) {
      issues.push(`Only ${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
    }
  } else {
    score = 1;
    if (displayMissing.length > 0) {
      issues.push(`Very few keywords matched (${matched.length}/${keywords.length}). Strongly consider incorporating: ${displayMissing.join(', ')}`);
    }
  }

  return {
    category: { score, maxScore, label: 'Keyword Match', issues },
    matchResult: {
      matched,
      missing: displayMissing,
      matchRate: Math.round(matchRate * 100) / 100,
    },
  };
}

// ---------------------------------------------------------------------------
// AI Analysis (Pro only)
// ---------------------------------------------------------------------------

async function runAiAnalysis(resumeText: string): Promise<AiAnalysis> {
  const zai = await ZAI.create();

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the given resume text and provide detailed, actionable feedback.

IMPORTANT RULES:
- NEVER mention or suggest changes to date formats. All common date formats (Jan 2023, 01/2023, 2023-01, January 2023, etc.) are perfectly valid.
- Focus on content quality, impact, structure, and ATS optimization.
- Be specific and actionable in your suggestions.

Respond with a JSON object (no markdown, no code fences, pure JSON) with this exact structure:
{
  "grammarIssues": [{"message": "Description of the issue", "suggestion": "How to fix it"}],
  "suggestions": [{"message": "What to improve", "priority": "high|medium|low"}],
  "strengths": ["List of 3-5 strengths"],
  "weaknesses": ["List of 3-5 weakness areas"]
}

Guidelines:
- grammarIssues: Find 0-5 real grammar, spelling, or phrasing issues
- suggestions: Provide 3-6 actionable improvement suggestions with priority levels
- strengths: Highlight 3-5 specific things done well
- weaknesses: Identify 3-5 specific areas needing improvement`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this resume for ATS optimization:\n\n${resumeText}` },
    ],
    thinking: { type: 'disabled' },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';

  // Try to parse the JSON response
  try {
    // Strip any markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AiAnalysis;

    // Validate and sanitize
    return {
      grammarIssues: Array.isArray(parsed.grammarIssues)
        ? parsed.grammarIssues.slice(0, 8).filter(i => i.message)
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 8).filter(s => s.message && ['high', 'medium', 'low'].includes(s.priority))
        : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 6) : [],
    };
  } catch {
    // If parsing fails, return empty analysis
    return {
      grammarIssues: [],
      suggestions: [],
      strengths: ['Resume content was received and processed.'],
      weaknesses: ['Unable to generate detailed AI analysis at this time.'],
    };
  }
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 },
      );
    }

    // 2. Parse body
    const body = await request.json();
    const { resumeId, resumeText, jobDescription } = body as {
      resumeId?: string;
      resumeText?: string;
      jobDescription?: string;
    };

    if (!resumeId && !resumeText) {
      return NextResponse.json(
        { success: false, error: 'Provide either resumeId or resumeText.' },
        { status: 400 },
      );
    }

    // 3. Check BASIC_ATS_SCORE access (all authenticated users should have this)
    const basicAccess = await checkAndIncrementUsage(authUser.userId, FEATURE_KEYS.BASIC_ATS_SCORE, false);
    if (!basicAccess.allowed) {
      return NextResponse.json(
        { success: false, error: 'ATS scoring is not available on your current plan.' },
        { status: 403 },
      );
    }

    // 4. Check ATS_CHECKER (Pro) access
    const proAccess = await checkAndIncrementUsage(authUser.userId, FEATURE_KEYS.ATS_CHECKER, true);
    const isPremium = proAccess.allowed;

    if (!isPremium && proAccess.reason === 'limit_reached') {
      // User is Pro but hit the limit — still get basic scoring
    }

    // 5. Get resume text
    let text = resumeText ?? '';
    let resumeData: ResumeData | null = null;

    if (resumeId) {
      const resume = await db.resume.findFirst({
        where: {
          id: resumeId,
          user_id: authUser.userId,
        },
      });

      if (!resume) {
        return NextResponse.json(
          { success: false, error: 'Resume not found.' },
          { status: 404 },
        );
      }

      try {
        resumeData = JSON.parse(resume.data_json) as ResumeData;
        text = resumeDataToText(resumeData);
      } catch {
        // If JSON parsing fails, use raw text
        text = resume.data_json;
      }
    }

    // 6. Run local scoring
    const contactInfo = scoreContactInfo(text, resumeData);
    const summary = scoreSummary(text, resumeData);
    const workExp = scoreWorkExperience(text, resumeData);
    const education = scoreEducation(text, resumeData);
    const skills = scoreSkills(text, resumeData);
    const formatting = scoreFormatting(text, resumeData);
    const length = scoreLength(text);

    // Keyword matching (only if jobDescription provided)
    let keywordCategory: CategoryResult = { score: 10, maxScore: 10, label: 'Keyword Match', issues: [] };
    let keywordMatch: KeywordMatchResult | undefined;

    if (jobDescription?.trim()) {
      const kwResult = scoreKeywords(text, jobDescription.trim());
      keywordCategory = kwResult.category;
      keywordMatch = kwResult.matchResult;
    }

    const totalScore =
      contactInfo.score +
      summary.score +
      workExp.score +
      education.score +
      skills.score +
      formatting.score +
      length.score +
      keywordCategory.score;

    const categories = {
      contactInfo,
      summary,
      workExperience: workExp,
      education,
      skills,
      formatting,
      length,
      keywords: keywordCategory,
    };

    // 7. AI Analysis for Pro users
    let aiAnalysis: AiAnalysis | undefined;

    if (isPremium && text.length > 0) {
      try {
        aiAnalysis = await runAiAnalysis(text);
      } catch {
        // AI analysis failed — still return scoring
        aiAnalysis = {
          grammarIssues: [],
          suggestions: [],
          strengths: ['Resume scoring completed successfully.'],
          weaknesses: ['AI analysis encountered an issue.'],
        };
      }
    }

    // 8. Build response
    const response: Record<string, unknown> = {
      success: true,
      score: totalScore,
      categories,
      isPremium,
    };

    if (aiAnalysis) {
      response.aiAnalysis = aiAnalysis;
    }

    if (keywordMatch) {
      response.keywordMatch = keywordMatch;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}