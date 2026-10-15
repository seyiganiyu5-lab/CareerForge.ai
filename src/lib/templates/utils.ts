import type { PersonalInfo, SectionKey, ResumeData } from '@/types/resume';
import { docText, monthName, sectionLabel, type DocLanguage } from './labels';

export { docLanguage, docText, levelLabel, type DocLanguage } from './labels';

// ─── Date Formatting ──────────────────────────────────────────

export function formatDate(dateStr: string, lang: DocLanguage = 'en'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr; // not a standard YYYY-MM format, return as-is
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex)) return dateStr;
  return `${monthName(monthIndex, lang)} ${year}`;
}

export function formatDateRange(start: string, end: string, current: boolean, lang: DocLanguage = 'en'): string {
  const s = formatDate(start, lang);
  const e = current ? docText(lang).present : formatDate(end, lang);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

/** Format a date range as "Jan 2024 – Mar 2026". Used for education. */
export function formatDateRangeRaw(start: string, end: string, lang: DocLanguage = 'en'): string {
  const s = formatDate(start, lang);
  const e = formatDate(end, lang);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

// ─── Contact Items ────────────────────────────────────────────

export function getContactItems(info: PersonalInfo): string[] {
  return [
    info.email,
    info.phone,
    info.location,
    info.website && info.website !== 'https://' ? info.website : '',
    info.linkedin,
    info.github,
  ].filter(Boolean);
}

// ─── Section Visibility ───────────────────────────────────────

export function getVisibleSections(
  data: ResumeData,
  hiddenSections: SectionKey[],
  sectionOrder: SectionKey[]
): SectionKey[] {
  return sectionOrder.filter(key => {
    if (hiddenSections.includes(key)) return false;
    return sectionHasContent(data, key);
  });
}

export function sectionHasContent(data: ResumeData, key: SectionKey): boolean {
  switch (key) {
    case 'personalInfo':
      return !!data.personalInfo.fullName;
    case 'professionalSummary':
      return !!data.professionalSummary.trim();
    case 'workExperience':
      return data.workExperience.some(e => e.company || e.position);
    case 'education':
      return data.education.some(e => e.school || e.degree);
    case 'skills':
      return data.skills.length > 0;
    case 'projects':
      return data.projects.some(p => p.name);
    case 'certifications':
      return data.certifications.some(c => c.name);
    case 'languages':
      return data.languages.some(l => l.language);
    case 'awards':
      return data.awards.some(a => a.name);
    case 'volunteerExperience':
      return data.volunteerExperience.some(v => v.organization);
    case 'references':
      return data.references.some(r => r.name);
    case 'additionalInfo':
      return !!data.additionalInfo.text.trim();
    default:
      return false;
  }
}

// ─── Section Labels ───────────────────────────────────────────

export function getSectionLabel(key: SectionKey, lang: DocLanguage = 'en'): string {
  return sectionLabel(key, lang);
}

// ─── Hex to RGBA helper ───────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Computed Styles ──────────────────────────────────────────

export function getTemplateStyles(c: import('@/types/template').TemplateCustomization) {
  return {
    container: {
      fontFamily: c.primaryFont,
      fontSize: `${11 * c.fontSize}px`,
      lineHeight: c.lineHeight,
      color: '#1f2937',
      padding: `${c.pageMargins}px`,
      boxSizing: 'border-box' as const,
    },
    heading: {
      fontFamily: c.headingFont,
      color: c.accentColor,
    },
    body: {
      fontFamily: c.primaryFont,
      color: '#1f2937',
    },
    divider: {
      borderColor: c.accentColor,
    },
    accent: {
      color: c.accentColor,
    },
    sectionGap: `${20 * c.sectionSpacing}px`,
  };
}