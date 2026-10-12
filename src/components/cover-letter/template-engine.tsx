'use client';

import type { CoverLetterTemplateId, CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';

import Professional from './templates/professional';
import Modern from './templates/modern';
import Executive from './templates/executive';
import Minimal from './templates/minimal';
import Corporate from './templates/corporate';
import AtsFriendly from './templates/ats-friendly';

const TEMPLATE_MAP: Record<CoverLetterTemplateId, React.ComponentType<{
  data: CoverLetterData;
  customization: CoverLetterCustomization;
}>> = {
  professional: Professional,
  modern: Modern,
  executive: Executive,
  minimal: Minimal,
  corporate: Corporate,
  'ats-friendly': AtsFriendly,
};

interface CoverLetterTemplateEngineProps {
  data: CoverLetterData;
  customization: CoverLetterCustomization;
  templateId: CoverLetterTemplateId;
}

export function CoverLetterTemplateEngine({
  data,
  customization,
  templateId,
}: CoverLetterTemplateEngineProps) {
  const TemplateComponent = TEMPLATE_MAP[templateId] || TEMPLATE_MAP.professional;

  return (
    <div
      style={{
        width: 794,
        minHeight: 1122,
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <TemplateComponent data={data} customization={customization} />
    </div>
  );
}
