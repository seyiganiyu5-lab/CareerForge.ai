import type { TemplateCustomization, TemplateId } from '@/types/template';
import { SECTION_KEYS, type SectionKey } from '@/types/resume';

export function createDefaultCustomization(templateId?: TemplateId): TemplateCustomization {
  const base: TemplateCustomization = {
    accentColor: '#0d9488',
    primaryFont: 'Inter, system-ui, sans-serif',
    headingFont: 'Poppins, system-ui, sans-serif',
    fontSize: 1.0,
    sectionSpacing: 1.0,
    pageMargins: 56,
    lineHeight: 1.5,
    headerAlignment: 'left',
    sectionDividers: true,
    sectionOrder: [...SECTION_KEYS] as SectionKey[],
    hiddenSections: [],
    pageSize: 'a4',
  };

  if (!templateId) return base;

  switch (templateId) {
    case 'professional-blue':
      base.accentColor = '#2563eb';
      base.headingFont = 'Inter, system-ui, sans-serif';
      base.headerAlignment = 'center';
      break;
    case 'executive':
      base.accentColor = '#1e3a5f';
      base.headingFont = 'Georgia, serif';
      base.primaryFont = 'Cambria, Georgia, serif';
      base.headerAlignment = 'center';
      base.sectionDividers = false;
      break;
    case 'modern-minimal':
      base.accentColor = '#000000';
      base.headingFont = 'Inter, system-ui, sans-serif';
      base.sectionDividers = false;
      base.sectionSpacing = 1.3;
      break;
    case 'contemporary':
      base.accentColor = '#4f46e5';
      base.headerAlignment = 'left';
      base.sectionSpacing = 0.9;
      break;
    case 'chronological':
      base.accentColor = '#475569';
      base.headingFont = 'Georgia, serif';
      base.sectionDividers = true;
      break;
    case 'functional':
      base.accentColor = '#059669';
      base.sectionSpacing = 0.8;
      break;
    case 'combination':
      base.accentColor = '#2563eb';
      base.sectionSpacing = 0.9;
      break;
    case 'tech-professional':
      base.accentColor = '#0d9488';
      base.primaryFont = 'Inter, system-ui, sans-serif';
      base.headingFont = 'Inter, system-ui, sans-serif';
      base.sectionDividers = false;
      base.sectionSpacing = 0.8;
      break;
    case 'graduate':
      base.accentColor = '#4f46e5';
      base.headerAlignment = 'center';
      base.sectionSpacing = 0.9;
      break;
    default:
      break;
  }

  return base;
}