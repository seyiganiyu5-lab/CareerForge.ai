'use client';

import { createElement, lazy, Suspense } from 'react';
import { useTranslations } from '@/i18n/provider';
import type { ResumeData } from '@/types/resume';
import type { TemplateId, TemplateCustomization } from '@/types/template';
import { isValidTemplateId } from '@/lib/templates/registry';
import { PAGE_DIMENSIONS } from '@/types/template';

interface TemplateEngineProps {
  data: ResumeData;
  templateId: TemplateId;
  customization: TemplateCustomization;
}

function TemplateFallback() {
  const t = useTranslations('a11y');
  return (
    <div className="flex items-center justify-center h-32 bg-white">
      <div className="flex items-center gap-2 text-gray-400">
        <div className="size-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm">{t('loadingTemplate')}</span>
      </div>
    </div>
  );
}

// Module-level map ensures stable component references
const templateComponentMap = {
  'ats-classic': lazy(() => import('@/components/resume/templates/ats-classic')),
  'professional-blue': lazy(() => import('@/components/resume/templates/professional-blue')),
  'executive': lazy(() => import('@/components/resume/templates/executive')),
  'modern-minimal': lazy(() => import('@/components/resume/templates/modern-minimal')),
  'contemporary': lazy(() => import('@/components/resume/templates/contemporary')),
  'chronological': lazy(() => import('@/components/resume/templates/chronological')),
  'functional': lazy(() => import('@/components/resume/templates/functional')),
  'combination': lazy(() => import('@/components/resume/templates/combination')),
  'tech-professional': lazy(() => import('@/components/resume/templates/tech-professional')),
  'graduate': lazy(() => import('@/components/resume/templates/graduate')),
} as const;

export function TemplateEngine({ data, templateId, customization }: TemplateEngineProps) {
  const validId = isValidTemplateId(templateId) ? templateId : 'ats-classic';
  const page = PAGE_DIMENSIONS[customization.pageSize];
  const Component = templateComponentMap[validId] ?? templateComponentMap['ats-classic'];

  return (
    <Suspense fallback={<TemplateFallback />}>
      <div
        style={{
          width: page.width,
          minHeight: page.height,
          boxSizing: 'border-box',
          background: '#ffffff',
        }}
      >
        {createElement(Component, { data, customization })}
      </div>
    </Suspense>
  );
}