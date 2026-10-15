import type { SectionKey } from './resume';

// ─── Template IDs ──────────────────────────────────────────────

export const TEMPLATE_IDS = [
  'ats-classic',
  'professional-blue',
  'graduate',
  'executive',
  'modern-minimal',
  'contemporary',
  'chronological',
  'functional',
  'combination',
  'tech-professional',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

// ─── Template Tier ─────────────────────────────────────────────

export type TemplateTier = 'free' | 'pro';

// ─── ATS Rating ───────────────────────────────────────────────

export type AtsRating = 1 | 2 | 3 | 4 | 5;

// ─── Template Metadata ────────────────────────────────────────

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  atsRating: AtsRating;
  tier: TemplateTier;
  tags: string[];
}

// ─── Template Customization ───────────────────────────────────

export interface TemplateCustomization {
  accentColor: string;
  primaryFont: string;
  headingFont: string;
  fontSize: number;          // 0.8 - 1.4
  sectionSpacing: number;    // 0.5 - 2.0
  pageMargins: number;       // 30 - 80 (px)
  lineHeight: number;        // 1.2 - 2.0
  headerAlignment: 'left' | 'center' | 'right';
  sectionDividers: boolean;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  pageSize: 'a4' | 'letter';
  /** Language of the CV's headings, dates and labels (defaults to English) */
  language?: 'en' | 'fr';
}

// ─── Template Component Props ─────────────────────────────────

export interface TemplateComponentProps {
  data: import('./resume').ResumeData;
  customization: TemplateCustomization;
}

// ─── Free Templates ───────────────────────────────────────────

export const FREE_TEMPLATE_IDS: TemplateId[] = [
  'ats-classic',
  'professional-blue',
  'graduate',
];

// ─── Page Dimensions ──────────────────────────────────────────

export const PAGE_DIMENSIONS = {
  a4: { width: 794, height: 1122 },     // 210mm × 297mm at 96dpi (1122.52 rounded down to prevent 2-page overflow)
  letter: { width: 816, height: 1056 },  // 8.5" × 11" at 96dpi
} as const;

// ─── Font Options ─────────────────────────────────────────────

export const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Cambria, Georgia, serif', label: 'Cambria' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Calibri, "Segoe UI", sans-serif', label: 'Calibri' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
] as const;

// ─── Accent Color Presets ─────────────────────────────────────

export const ACCENT_PRESETS = [
  { value: '#0d9488', label: 'Teal' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#4f46e5', label: 'Indigo' },
  { value: '#7c3aed', label: 'Violet' },
  { value: '#e11d48', label: 'Rose' },
  { value: '#059669', label: 'Emerald' },
  { value: '#d97706', label: 'Amber' },
  { value: '#475569', label: 'Slate' },
  { value: '#1e3a5f', label: 'Navy' },
  { value: '#000000', label: 'Black' },
] as const;