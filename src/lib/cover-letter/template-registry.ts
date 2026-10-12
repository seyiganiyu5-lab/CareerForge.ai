import type { CoverLetterTemplateId, CoverLetterTemplateMeta, CoverLetterCustomization } from '@/types/cover-letter';
import { COVER_LETTER_TEMPLATE_IDS } from '@/types/cover-letter';

// ─── Template Metadata ────────────────────────────────────────

export const COVER_LETTER_TEMPLATES: CoverLetterTemplateMeta[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Classic business letter format with clean lines and traditional styling',
    tier: 'free',
    tags: ['Business', 'Corporate', 'ATS'],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with accent color header and clean typography',
    tier: 'free',
    tags: ['Contemporary', 'Creative', 'Stylish'],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Formal and authoritative design with navy tones and serif fonts',
    tier: 'free',
    tags: ['Leadership', 'Management', 'Senior'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design with maximum whitespace and sans-serif fonts',
    tier: 'pro',
    tags: ['Clean', 'Simple', 'Modern'],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Standard business letterhead style with professional branding',
    tier: 'pro',
    tags: ['Business', 'Formal', 'Enterprise'],
  },
  {
    id: 'ats-friendly',
    name: 'ATS Friendly',
    description: 'Plain text format optimized for ATS systems with no fancy formatting',
    tier: 'free',
    tags: ['ATS', 'Simple', 'Compatible'],
  },
];

export function getTemplateMeta(id: CoverLetterTemplateId): CoverLetterTemplateMeta | undefined {
  return COVER_LETTER_TEMPLATES.find((t) => t.id === id);
}

export function isTemplateFree(id: CoverLetterTemplateId): boolean {
  const meta = getTemplateMeta(id);
  return meta?.tier === 'free';
}

export function isValidTemplateId(id: string): id is CoverLetterTemplateId {
  return COVER_LETTER_TEMPLATE_IDS.includes(id as CoverLetterTemplateId);
}

// ─── Default Customization ────────────────────────────────────

export function createDefaultCustomization(
  templateId?: CoverLetterTemplateId,
): CoverLetterCustomization {
  const base: CoverLetterCustomization = {
    accentColor: '#0d9488',
    primaryFont: 'Inter, system-ui, sans-serif',
    fontSize: 1.0,
    lineSpacing: 1.6,
    pageMargins: 56,
    headerStyle: 'full',
    signature: 'typed',
    dateFormat: 'full',
  };

  if (!templateId) return base;

  switch (templateId) {
    case 'professional':
      base.accentColor = '#0d9488';
      base.primaryFont = 'Calibri, "Segoe UI", sans-serif';
      base.headerStyle = 'full';
      break;
    case 'modern':
      base.accentColor = '#0d9488';
      base.primaryFont = 'Inter, system-ui, sans-serif';
      base.headerStyle = 'compact';
      break;
    case 'executive':
      base.accentColor = '#1e3a5f';
      base.primaryFont = 'Georgia, serif';
      base.headerStyle = 'full';
      base.lineSpacing = 1.5;
      break;
    case 'minimal':
      base.accentColor = '#000000';
      base.primaryFont = 'Inter, system-ui, sans-serif';
      base.headerStyle = 'minimal';
      base.lineSpacing = 1.8;
      base.pageMargins = 64;
      break;
    case 'corporate':
      base.accentColor = '#2563eb';
      base.primaryFont = 'Calibri, "Segoe UI", sans-serif';
      base.headerStyle = 'full';
      break;
    case 'ats-friendly':
      base.accentColor = '#000000';
      base.primaryFont = 'Arial, Helvetica, sans-serif';
      base.headerStyle = 'minimal';
      base.lineSpacing = 1.5;
      break;
  }

  return base;
}

// ─── Font Options ─────────────────────────────────────────────

export const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Cambria, Georgia, serif', label: 'Cambria' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Calibri, "Segoe UI", sans-serif', label: 'Calibri' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: '"Garamond", "Times New Roman", serif', label: 'Garamond' },
] as const;

// ─── Color Presets ────────────────────────────────────────────

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

// ─── Date Formatting ─────────────────────────────────────────

export function formatDate(dateStr: string, format: 'full' | 'short' | 'iso'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    switch (format) {
      case 'full':
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'short':
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      case 'iso':
        return dateStr;
      default:
        return dateStr;
    }
  } catch {
    return dateStr;
  }
}
