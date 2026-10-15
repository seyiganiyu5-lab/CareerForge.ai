import type { ResumeData } from '@/types/resume';

/**
 * Rule-based ATS checks. They work the same on a resume built in CareerForge
 * (structured data) and on pasted text, and understand English and French.
 * Messages are English here; the route translates them (see ./localize).
 */

export interface CategoryResult {
  score: number;
  maxScore: number;
  label: string;
  issues: string[];
}

export interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchRate: number;
}

// ── Text helpers ─────────────────────────────────────────────────────

/** Lowercase without accents, so "Expérience" and "experience" compare equal. */
export function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word / whole-phrase test on folded text. */
function hasTerm(foldedText: string, term: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escapeRe(term)}($|[^a-z0-9+#])`).test(foldedText);
}

// Stems of action verbs (English + French), matched at the start of a word on folded text
const ACTION_STEMS = [
  'manag', 'led', 'lead', 'develop', 'achiev', 'improv', 'built', 'build', 'deliver', 'drove', 'drive',
  'increas', 'reduc', 'implement', 'creat', 'design', 'launch', 'optimi', 'coordinat', 'establish',
  'generat', 'streamlin', 'spearhead', 'negotiat', 'supervis', 'organi', 'train', 'mentor', 'grew',
  'dirig', 'gere', 'gerer', 'developp', 'concu', 'cree', 'lance', 'amelior', 'realis', 'coordonn',
  'mis en place', 'pilot', 'augment', 'redui', 'negoci', 'encadr', 'accompagn', 'forme', 'optimise',
];
const ACTION_RE = new RegExp(`(^|[^a-z])(${ACTION_STEMS.map(escapeRe).join('|')})`);

// Numbers that show impact (not just years): %, money, or counts of people/projects/etc.
const METRIC_RE = /\d+(?:[.,]\d+)?\s?%|[$€£]\s?\d|\d[\d\s.,]*\s?(?:k|m|millions?|milliards?)?\s?(?:€|\$|£|eur\b|usd\b)|\b\d+\+?\s*(?:years?|ans|users?|utilisateurs|clients?|customers?|people|personnes|projects?|projets|members?|membres|employees|salaries|collaborateurs|team|equipe|countries|pays|stores|magasins|students|eleves|etudiants|patients|leads|deals|contrats?)\b|\bx\d+\b|\b\d+x\b/;

const YEAR_RE = /\b(19|20)\d{2}\b/g;
const MONTH_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|janv|fevr|mars|avr|mai|juin|juil|aout|déc)[a-z]*\.?\s+\d{4}\b|\b\d{1,2}\/\d{4}\b/gi;

const BULLET_LINE_RE = /^\s*[-•●▪▶◆*–]\s+/;

// ── Sections in pasted text ──────────────────────────────────────────

type SectionKind = 'summary' | 'experience' | 'education' | 'skills' | 'other';

const HEADINGS: [SectionKind, RegExp][] = [
  ['summary', /^(professional |career |executive )?(summary|profile|objective)$|^about( me)?$|^(resume|profil)( professionnel)?$|^a propos( de moi)?$|^objectif( professionnel)?$|^presentation$/],
  ['experience', /^((work|professional|relevant) )?experiences?$|^employment( history)?$|^work history$|^career history$|^experiences? professionnelles?$|^parcours( professionnel)?$/],
  ['education', /^education( and training)?$|^academic (background|qualifications)$|^qualifications$|^formations?$|^etudes$|^diplomes?$|^cursus( scolaire| universitaire)?$|^formation et diplomes$/],
  ['skills', /^((technical|key|core|professional) )?(skills|competencies|competences)$|^skills (and|&) (abilities|tools)$|^competences( techniques| cles)?$|^savoir[- ]faire$|^aptitudes$|^outils$/],
  ['other', /^(projects?|projets|certifications?|certificats?|languages?|langues|awards?|distinctions|prix|volunteer(ing)?( experience)?|benevolat|references?|interests|hobbies|centres d'interet|loisirs|additional information|informations complementaires|publications)$/],
];

/** The text of each main section, found by its heading (English or French). */
export function splitSections(text: string): Partial<Record<Exclude<SectionKind, 'other'>, string>> {
  const out: Partial<Record<SectionKind, string[]>> = {};
  let current: SectionKind | null = null;
  for (const line of text.split(/\r?\n/)) {
    const candidate = fold(line).replace(/[:•\-–—|#*_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const heading = candidate.length > 0 && candidate.length <= 45
      ? HEADINGS.find(([, re]) => re.test(candidate))?.[0]
      : undefined;
    if (heading) {
      current = heading;
      out[current] = out[current] ?? [];
      continue;
    }
    if (current) out[current]!.push(line);
  }
  const result: Partial<Record<Exclude<SectionKind, 'other'>, string>> = {};
  for (const k of ['summary', 'experience', 'education', 'skills'] as const) {
    const body = out[k]?.join('\n').trim();
    if (body) result[k] = body;
  }
  return result;
}

// ── Categories ───────────────────────────────────────────────────────

export function scoreContactInfo(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const top = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const nameLine = /^[\p{Lu}][\p{L}'’.-]+(?:\s+[\p{L}'’.-]+){1,3}$/u;
  const hasName = data ? !!data.personalInfo?.fullName?.trim() : top.slice(0, 3).some((l) => nameLine.test(l) && !/[@\d]/.test(l));
  const hasEmail = data?.personalInfo?.email?.trim() ? true : /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = data?.personalInfo?.phone?.trim() ? true : /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}([-.\s]?\d{2,4})?/.test(text);
  const head = top.slice(0, 15).join('\n');
  const hasLocation = data
    ? !!data.personalInfo?.location?.trim()
    : /[\p{Lu}][\p{L}' -]+,\s*[\p{Lu}][\p{L} -]+/u.test(head) || /\b\d{5}\b/.test(head);

  if (hasName) score += 4; else issues.push('Full name is missing or incomplete.');
  if (hasEmail) score += 4; else issues.push('Email address is missing.');
  if (hasPhone) score += 4; else issues.push('Phone number is missing.');
  if (hasLocation) score += 3; else issues.push('Location/city is missing. Adding one helps with local job matching.');

  return { score, maxScore: 15, label: 'Contact Information', issues };
}

export function scoreSummary(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;
  const summary = (data ? data.professionalSummary : splitSections(text).summary)?.trim() ?? '';

  if (!summary) {
    issues.push('Professional summary is missing. Add a 2-3 sentence summary to make a strong first impression.');
    return { score: 0, maxScore, label: 'Professional Summary', issues };
  }

  if (summary.length >= 50) score += 5;
  else issues.push(`Summary is too short (${summary.length} chars). Aim for 50+ characters.`);

  if (summary.length >= 150) score += 3;
  else if (summary.length >= 100) score += 2;
  else issues.push('Consider expanding your summary to 100-200 characters for better impact.');

  const folded = fold(summary);
  if (ACTION_RE.test(folded) || METRIC_RE.test(folded)) score += 2;
  else issues.push('Use action-oriented language with metrics in your summary (e.g., "led a team of 5", "increased revenue by 20%").');

  return { score, maxScore, label: 'Professional Summary', issues };
}

export function scoreWorkExperience(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  const maxScore = 20;
  let score = 0;

  // Pasted text: judge the Experience section as a whole
  if (!data) {
    const exp = splitSections(text).experience;
    if (!exp) {
      issues.push('Work experience section is missing. This is one of the most important sections for ATS.');
      return { score: 0, maxScore, label: 'Work Experience', issues };
    }
    const folded = fold(exp);
    score += 5;
    if ((exp.match(YEAR_RE) || []).length >= 1) score += 4;
    else issues.push('Add dates to each role (e.g. "Jan 2021 – Mar 2023").');
    const lines = exp.split(/\r?\n/);
    const bullets = lines.filter((l) => BULLET_LINE_RE.test(l)).length;
    const detailLines = lines.filter((l) => l.trim().length > 40).length;
    if (bullets >= 3 || detailLines >= 3) score += 4;
    else if (bullets >= 1 || detailLines >= 1) { score += 2; issues.push('Use more bullet points to describe your achievements and responsibilities.'); }
    else issues.push('Use bullet points (•, -, etc.) to format your experience descriptions.');
    if (ACTION_RE.test(folded)) score += 3;
    else issues.push('Use action verbs (e.g., "led", "developed", "achieved") in your work descriptions.');
    if (METRIC_RE.test(folded)) score += 4;
    else issues.push('Add measurable results (numbers, percentages, amounts) to show your impact.');
    return { score: Math.min(score, maxScore), maxScore, label: 'Work Experience', issues };
  }

  const entries = data.workExperience ?? [];
  if (entries.length === 0) {
    issues.push('Work experience section is missing. This is one of the most important sections for ATS.');
    return { score: 0, maxScore, label: 'Work Experience', issues };
  }

  score += 5;
  let goodEntryCount = 0;

  for (const entry of entries) {
    let entryScore = 0;
    if (entry.company?.trim()) entryScore += 1; else issues.push('Work entry is missing a company name.');
    if (entry.position?.trim()) entryScore += 1; else issues.push('Work entry is missing a job title/position.');
    if (entry.startDate?.trim()) entryScore += 1; else issues.push('Work entry is missing a start date.');

    const desc = entry.description?.trim() ?? '';
    if (desc.length > 0) {
      entryScore += 1;
      const hasBullets = desc.split(/\r?\n/).some((l) => BULLET_LINE_RE.test(l)) || desc.split(/\r?\n/).filter((l) => l.trim().length > 10).length >= 2;
      if (hasBullets) entryScore += 1;
      if (METRIC_RE.test(fold(desc))) entryScore += 1;
    } else {
      issues.push('Work entry is missing a description. Add bullet points with achievements.');
    }
    if (entryScore >= 4) goodEntryCount++;
  }

  if (goodEntryCount >= 1) score += 5;
  else issues.push('No work experience entry has all required fields (company, position, dates, description).');

  if (goodEntryCount === entries.length) score += 3;
  else issues.push('Ensure all work experience entries have complete details.');

  const allDescs = fold(entries.map((e) => e.description ?? '').join('\n'));
  if (ACTION_RE.test(allDescs)) score += 3;
  else issues.push('Use action verbs (e.g., "led", "developed", "achieved") in your work descriptions.');
  if (METRIC_RE.test(allDescs)) score += 4;
  else if (allDescs.trim()) issues.push('Add measurable results (numbers, percentages, amounts) to show your impact.');

  return { score: Math.min(score, maxScore), maxScore, label: 'Work Experience', issues };
}

const DEGREE_RE = /\b(bachelor|master|licence|license|bsc|b\.sc|ba|b\.a|msc|m\.sc|mba|phd|ph\.d|doctorat|doctorate|diplome|diploma|degree|bts|dut|but|bac|baccalaureat|certificate|certificat|associate|hnd|ond|wassce|ssce|beng|b\.eng|meng|ingenieur|engineering degree|cap|bep|deug|dea|dess|llb|llm|md)\b/;

export function scoreEducation(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  if (!data) {
    const edu = splitSections(text).education;
    if (!edu) {
      issues.push('Education section is missing. Most ATS systems expect this section.');
      return { score: 0, maxScore, label: 'Education', issues };
    }
    score += 5;
    if (DEGREE_RE.test(fold(edu))) score += 3;
    else issues.push('Education entry is missing a degree.');
    if ((edu.match(YEAR_RE) || []).length >= 1) score += 2;
    return { score, maxScore, label: 'Education', issues };
  }

  const entries = data.education ?? [];
  if (entries.length === 0) {
    issues.push('Education section is missing. Most ATS systems expect this section.');
    return { score: 0, maxScore, label: 'Education', issues };
  }

  for (const entry of entries) {
    if (entry.school?.trim() && entry.degree?.trim()) {
      score += 5;
      if (entry.fieldOfStudy?.trim() || entry.startDate || entry.endDate) score += 3;
      if (score >= maxScore) break;
    } else {
      if (!entry.school?.trim()) issues.push('Education entry is missing a school/university name.');
      if (!entry.degree?.trim()) issues.push('Education entry is missing a degree.');
      score += 2;
    }
  }

  return { score: Math.min(score, maxScore), maxScore, label: 'Education', issues };
}

const SOFT_SKILL_RE = /leadership|communication|teamwork|team work|team player|problem.?solving|analytical|creativ|adaptab|organi[sz]|detail.?oriented|collaborat|empath|time management|negotiat|public speaking|critical thinking|autonom|rigueur|rigoureu|travail en equipe|esprit d'equipe|sens de l'organisation|gestion du temps|adaptabilite|creativite|esprit d'analyse|relationnel|ecoute|prise de parole|resolution de problemes|polyvalen|curiosite|dynamisme|ponctualite|patience|bienveillance/;

export function scoreSkills(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  const items: { name: string; soft: boolean }[] = data
    ? (data.skills ?? []).filter((s) => s.name?.trim()).map((s) => ({
      name: s.name,
      soft: s.type ? s.type === 'soft' : SOFT_SKILL_RE.test(fold(s.name)),
    }))
    : (splitSections(text).skills ?? '')
      .split(/[,;•|·\n●▪]/)
      .map((s) => s.replace(BULLET_LINE_RE, '').trim())
      .filter((s) => s.length >= 2 && s.length <= 50)
      .map((name) => ({ name, soft: SOFT_SKILL_RE.test(fold(name)) }));

  if (items.length === 0) {
    issues.push('Skills section is missing. Add at least 3 skills relevant to your target role.');
    return { score: 0, maxScore, label: 'Skills', issues };
  }

  // How many skills (up to 6 points)
  const n = items.length;
  if (n >= 10) score += 6;
  else if (n >= 6) score += 5;
  else if (n >= 4) score += 4;
  else if (n >= 3) score += 3;
  else { score += 1; issues.push('Add at least 3 more skills to strengthen this section.'); }

  // A mix of hard and soft skills (up to 4 points); no field is favoured over another
  const soft = items.filter((s) => s.soft).length;
  const hard = n - soft;
  if (hard > 0 && soft > 0) score += 4;
  else if (hard > 0) { score += 2; issues.push('Consider adding soft skills (e.g., leadership, communication) alongside your technical skills.'); }
  else { score += 2; issues.push('Include more technical/hard skills relevant to your target role.'); }

  return { score: Math.min(score, maxScore), maxScore, label: 'Skills', issues };
}

export function scoreFormatting(text: string, data: ResumeData | null): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 15;

  // Standard section headings an ATS can recognise
  const sections = splitSections(text);
  const found = (['experience', 'education', 'skills'] as const).filter((k) => sections[k] !== undefined).length;
  if (found >= 3) score += 4;
  else if (found === 2) { score += 3; issues.push('Consider adding more standard section headers (Experience, Education, Skills).'); }
  else issues.push('Standard section headers (Experience, Education, Skills) are missing or hard to detect.');

  // Dates
  const structuredDates = data?.workExperience?.flatMap((e) => [e.startDate, e.endDate].filter(Boolean)) ?? [];
  const textDates = (text.match(YEAR_RE) || []).length + (text.match(MONTH_RE) || []).length;
  if (structuredDates.length >= 2 || (!data && textDates >= 2)) score += 3;
  else if (structuredDates.length > 0 || (!data && textDates > 0)) score += 2;
  else issues.push('Add employment dates to your work experience entries.');

  // Bullet points in the experience descriptions
  const desc = data ? data.workExperience?.map((e) => e.description ?? '').join('\n') ?? '' : sections.experience ?? '';
  const lines = desc.split(/\r?\n/);
  const bulletCount = lines.filter((l) => BULLET_LINE_RE.test(l)).length;
  const lineCount = lines.filter((l) => l.trim().length > 10).length;
  if (bulletCount >= 3 || lineCount >= 3) score += 3;
  else if (bulletCount >= 1 || lineCount >= 1) { score += 2; issues.push('Use more bullet points to describe your achievements and responsibilities.'); }
  else if (desc.length > 0) issues.push('Use bullet points (•, -, etc.) to format your experience descriptions.');

  // Characters that ATS parsers can't read
  if (!/[│║═╔╗╚╝┌┐└┘├┤┬┴┼]/.test(text)) score += 2;
  else issues.push('Remove box-drawing or special characters that ATS systems cannot parse.');

  // Not shouting in capitals (headings excluded: short lines)
  const words = text.split(/\r?\n/).filter((l) => l.trim().split(/\s+/).length > 4).join(' ').split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 0) {
    const caps = words.filter((w) => w === w.toUpperCase() && /\p{Lu}/u.test(w)).length / words.length;
    if (caps < 0.1) score += 3;
    else if (caps < 0.3) { score += 2; issues.push('Avoid using excessive ALL CAPS text. Reserve uppercase for section headers only.'); }
    else { score += 1; issues.push('Too much uppercase text detected. Use standard capitalization for better readability.'); }
  } else {
    score += 3;
  }

  return { score: Math.min(score, maxScore), maxScore, label: 'Formatting Quality', issues };
}

export function scoreLength(text: string): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

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
    score = 10;
  } else if (wordCount <= 2000) {
    issues.push('Resume is slightly long. Consider trimming to keep it within 2 pages.');
    score = 7;
  } else {
    issues.push('Resume is too long (over 2000 words). Most recruiters prefer 1-2 page resumes. Trim less relevant content.');
    score = 4;
  }
  return { score, maxScore: 10, label: 'Resume Length', issues };
}

// ── Keywords from the job description ────────────────────────────────

// Common words (English + French) and generic job-ad words that aren't skills
const STOP_WORDS = new Set(`
the a an and or but in on at to for of with by from is are was were be been being have has had do does did will would could should may might can shall must need
you your yours our ours we they them their this that these those it its as if not no nor so than too very just about also then there here each every all both few more most other some such only own same
what which who whom how when where why while up out into through during before after above below between under again further once per via within across among along etc ie eg
work working works experience experienced required requirement requirements preferred qualification qualifications skill skills ability able strong excellent good great looking join team teams role roles
position positions job jobs company companies opportunity opportunities responsibilities responsibility include includes including well new plus years year like minimum maximum least candidate candidates
apply application applications salary benefits benefit bonus offer offers office location full time part day days week weeks month months hours remote hybrid onsite site environment culture
knowledge understanding proven track record seeking ideal successful environment fast paced dynamic passionate motivated highly equal employer opportunity
hiring hire hires small large big wide range various related relevant based key main own owning use using used ensure ensuring provide providing help helping make making
get take want wants manage managing report reports day-to-day ongoing across closely together alongside currently immediately start asap
le la les un une des du de d l au aux et ou mais en dans sur sous pour par avec sans chez vers entre ce cet cette ces son sa ses leur leurs notre nos votre vos mon ma mes
je tu il elle on nous vous ils elles qui que quoi dont ou est sont etre avoir a ont fait faire plus moins tres bien tout tous toute toutes aussi ainsi comme si ne pas
poste postes entreprise societe equipe equipes candidat candidats candidate profil profils mission missions experience experiences competence competences connaissance connaissances
maitrise capacite capacites qualite qualites souhaite souhaitee requis requise atout atouts minimum annee annees ans an mois semaine jour jours salaire avantages avantage
temps plein partiel contrat cdi cdd stage alternance lieu teletravail hybride sein rejoindre recherchons recherche cherchons offre offres type niveau bonne bon bonnes excellente
`.split(/\s+/).filter(Boolean));

const KEY_PHRASES = [
  'machine learning', 'deep learning', 'data science', 'data analysis', 'data analyst', 'project management', 'product management',
  'full stack', 'front end', 'back end', 'ci/cd', 'cloud computing', 'software development', 'rest api', 'user experience', 'ui/ux',
  'natural language processing', 'computer vision', 'big data', 'supply chain', 'quality assurance', 'continuous integration',
  'cross-functional', 'stakeholder management', 'business development', 'customer experience', 'customer service', 'a/b testing',
  'unit testing', 'power bi', 'google ads', 'paid media', 'email marketing', 'content marketing', 'google analytics', 'social media', 'digital marketing', 'financial analysis', 'account management',
  'gestion de projet', 'service client', 'relation client', 'analyse de donnees', 'chef de projet', 'marketing digital', 'reseaux sociaux',
  'controle de gestion', 'ressources humaines', 'developpement commercial', 'gestion des stocks', 'conduite du changement',
];

/** The most important terms of a job description (single words and known phrases), at most 25. */
export function extractKeywords(jobDescription: string): { key: string; display: string }[] {
  const folded = fold(jobDescription);
  const counts = new Map<string, { display: string; count: number }>();
  const add = (key: string, display: string, weight = 1) => {
    const prev = counts.get(key);
    counts.set(key, { display: prev?.display ?? display, count: (prev?.count ?? 0) + weight });
  };

  for (const phrase of KEY_PHRASES) {
    const n = (folded.match(new RegExp(`(^|[^a-z0-9])${escapeRe(phrase)}($|[^a-z0-9])`, 'g')) || []).length;
    if (n) add(phrase, phrase, n + 1); // phrases are strong signals
  }

  // Words, keeping things like c++, c#, node.js, .net
  const tokens = jobDescription.match(/[\p{L}\p{N}][\p{L}\p{N}+#.]*[\p{L}\p{N}+#]|[\p{L}]{2,}/gu) || [];
  for (const raw of tokens) {
    const display = raw.toLowerCase().replace(/\.$/, '');
    const key = fold(display);
    if (key.length < 3 && !/[+#]/.test(key)) continue;
    if (/^\d+$/.test(key) || STOP_WORDS.has(key)) continue;
    if (KEY_PHRASES.some((p) => p.split(' ').includes(key) && counts.has(p))) continue; // already in a phrase
    add(key, display);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 25)
    .map(([key, v]) => ({ key, display: v.display }));
}

export function scoreKeywords(resumeText: string, jobDescription: string): { category: CategoryResult; matchResult: KeywordMatchResult } {
  const issues: string[] = [];
  const maxScore = 10;
  const keywords = extractKeywords(jobDescription);
  const resume = fold(resumeText);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const { key, display } of keywords) {
    // Accept simple plurals both ways (developer/developers, projet/projets)
    const found = hasTerm(resume, key) || (key.endsWith('s') && hasTerm(resume, key.slice(0, -1))) || hasTerm(resume, `${key}s`);
    (found ? matched : missing).push(display);
  }

  const displayMissing = missing.slice(0, 10);
  const matchRate = keywords.length > 0 ? matched.length / keywords.length : 1;
  let score: number;

  if (keywords.length === 0 || matchRate >= 0.7) {
    score = 10;
  } else if (matchRate >= 0.5) {
    score = 7;
    issues.push(`${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
  } else if (matchRate >= 0.3) {
    score = 5;
    issues.push(`${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
  } else if (matchRate >= 0.15) {
    score = 3;
    issues.push(`Only ${matched.length} of ${keywords.length} job keywords found. Consider adding: ${displayMissing.join(', ')}`);
  } else {
    score = 1;
    issues.push(`Very few keywords matched (${matched.length}/${keywords.length}). Strongly consider incorporating: ${displayMissing.join(', ')}`);
  }

  return {
    category: { score, maxScore, label: 'Keyword Match', issues },
    matchResult: { matched, missing: displayMissing, matchRate: Math.round(matchRate * 100) / 100 },
  };
}

// ── Everything together ──────────────────────────────────────────────

export function scoreResume(text: string, data: ResumeData | null, jobDescription?: string) {
  const categories: Record<string, CategoryResult> = {
    contactInfo: scoreContactInfo(text, data),
    summary: scoreSummary(text, data),
    workExperience: scoreWorkExperience(text, data),
    education: scoreEducation(text, data),
    skills: scoreSkills(text, data),
    formatting: scoreFormatting(text, data),
    length: scoreLength(text),
  };

  let keywordMatch: KeywordMatchResult | undefined;
  if (jobDescription?.trim()) {
    const kw = scoreKeywords(text, jobDescription.trim());
    categories.keywords = kw.category;
    keywordMatch = kw.matchResult;
  }

  // Score out of 100 from whatever was checked (no free points for keywords
  // when there is no job description)
  const got = Object.values(categories).reduce((s, c) => s + c.score, 0);
  const max = Object.values(categories).reduce((s, c) => s + c.maxScore, 0);
  const totalScore = Math.round((got / max) * 100);

  return { totalScore, categories, keywordMatch };
}
