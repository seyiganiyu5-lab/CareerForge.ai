import type { PersonalInfo, SectionKey, ResumeData } from '@/types/resume';

// ─── Date Formatting ──────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr; // not a standard YYYY-MM format, return as-is
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex)) return dateStr;
  return `${MONTHS[monthIndex]} ${year}`;
}

export function formatDateRange(start: string, end: string, current: boolean): string {
  const s = formatDate(start);
  const e = current ? 'Present' : formatDate(end);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

/** Format a date range as "Jan 2024 – Mar 2026". Used for education. */
export function formatDateRangeRaw(start: string, end: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
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

const SECTION_LABELS: Record<SectionKey, string> = {
  personalInfo: '',
  professionalSummary: 'Professional Summary',
  workExperience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  volunteerExperience: 'Volunteer Experience',
  references: 'References',
  additionalInfo: 'Additional Information',
};

export function getSectionLabel(key: SectionKey): string {
  return SECTION_LABELS[key];
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