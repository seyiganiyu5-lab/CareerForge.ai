// ─── Tone / Writing Style ──────────────────────────────────────

export type ToneType =
  | 'professional'
  | 'executive'
  | 'technical'
  | 'friendly'
  | 'entry-level'
  | 'graduate'
  | 'creative';

export const TONE_OPTIONS: { value: ToneType; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Polished and business-appropriate' },
  { value: 'executive', label: 'Executive', description: 'Authoritative and leadership-focused' },
  { value: 'technical', label: 'Technical', description: 'Detail-oriented with technical depth' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'entry-level', label: 'Entry-Level', description: 'Enthusiastic with growth mindset' },
  { value: 'graduate', label: 'Graduate', description: 'Academic and achievement-focused' },
  { value: 'creative', label: 'Creative', description: 'Unique and expressive' },
];

// ─── Language ─────────────────────────────────────────────────

export type CoverLetterLanguage = 'en' | 'fr';

export const LANGUAGE_OPTIONS: { value: CoverLetterLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
];

// ─── Cover Letter Data ────────────────────────────────────────

export interface CoverLetterData {
  // Sender information
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  website: string;

  // Recipient information
  hiringManager: string;
  companyName: string;
  companyAddress: string;

  // Job details
  jobTitle: string;
  jobDescription: string;

  // Letter content — structured paragraphs
  salutation: string;
  opening: string;
  body: string;
  closing: string;
  signOff: string;

  // Metadata
  language: CoverLetterLanguage;
  tone: ToneType;
  date: string; // ISO date string
}

// ─── Template IDs ────────────────────────────────────────────

export const COVER_LETTER_TEMPLATE_IDS = [
  'professional',
  'modern',
  'executive',
  'minimal',
  'corporate',
  'ats-friendly',
] as const;

export type CoverLetterTemplateId = (typeof COVER_LETTER_TEMPLATE_IDS)[number];

// ─── Template Metadata ────────────────────────────────────────

export interface CoverLetterTemplateMeta {
  id: CoverLetterTemplateId;
  name: string;
  description: string;
  tier: 'free' | 'pro';
  tags: string[];
}

// ─── Template Customization ───────────────────────────────────

export type HeaderStyle = 'full' | 'compact' | 'minimal';
export type SignatureStyle = 'typed' | 'script';
export type DateFormat = 'full' | 'short' | 'iso';

export interface CoverLetterCustomization {
  accentColor: string;
  primaryFont: string;
  fontSize: number; // 0.8 - 1.4
  lineSpacing: number; // 1.2 - 2.0
  pageMargins: number; // 30 - 80 (px)
  headerStyle: HeaderStyle;
  signature: SignatureStyle;
  dateFormat: DateFormat;
}

// ─── AI Edit Actions ─────────────────────────────────────────

export type AIEditAction =
  | 'rewrite'
  | 'expand'
  | 'shorten'
  | 'improve_grammar'
  | 'improve_tone'
  | 'replace_paragraph'
  | 'regenerate_section';

export const AI_EDIT_ACTIONS: { value: AIEditAction; label: string; icon: string; description: string }[] = [
  { value: 'rewrite', label: 'AI Rewrite', icon: 'Sparkles', description: 'Rewrite with AI' },
  { value: 'expand', label: 'Expand', icon: 'ChevronsDown', description: 'Add more detail' },
  { value: 'shorten', label: 'Shorten', icon: 'ChevronsUp', description: 'Make more concise' },
  { value: 'improve_grammar', label: 'Fix Grammar', icon: 'CheckCircle', description: 'Fix grammar & spelling' },
  { value: 'improve_tone', label: 'Improve Tone', icon: 'Smile', description: 'Improve writing tone' },
  { value: 'replace_paragraph', label: 'Replace', icon: 'Replace', description: 'Replace this section' },
  { value: 'regenerate_section', label: 'Regenerate', icon: 'RefreshCw', description: 'Regenerate this section' },
];

// ─── Autosave Status ─────────────────────────────────────────

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Section Keys for Editor ─────────────────────────────────

export const COVER_LETTER_SECTIONS = [
  'sender-info',
  'recipient-info',
  'job-details',
  'ai-generate',
  'content',
  'customization',
] as const;

export type CoverLetterSectionKey = (typeof COVER_LETTER_SECTIONS)[number];

// ─── Default Cover Letter Data Factory ───────────────────────

export function createDefaultCoverLetterData(): CoverLetterData {
  return {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    website: '',
    hiringManager: '',
    companyName: '',
    companyAddress: '',
    jobTitle: '',
    jobDescription: '',
    salutation: 'Dear Hiring Manager,',
    opening: '',
    body: '',
    closing: '',
    signOff: 'Sincerely,',
    language: 'en',
    tone: 'professional',
    date: new Date().toISOString().split('T')[0],
  };
}
