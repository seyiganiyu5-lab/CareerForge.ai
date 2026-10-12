import { lazy, type ComponentType } from 'react';
import type { TemplateId, TemplateMeta, TemplateComponentProps } from '@/types/template';

// ─── Lazy-loaded Template Components ──────────────────────────

const templateComponents: Record<TemplateId, ComponentType<TemplateComponentProps>> = {
  'ats-classic': lazy(() => import('@/components/resume/templates/ats-classic')),
  'professional-blue': lazy(() => import('@/components/resume/templates/professional-blue')),
  graduate: lazy(() => import('@/components/resume/templates/graduate')),
  executive: lazy(() => import('@/components/resume/templates/executive')),
  'modern-minimal': lazy(() => import('@/components/resume/templates/modern-minimal')),
  contemporary: lazy(() => import('@/components/resume/templates/contemporary')),
  chronological: lazy(() => import('@/components/resume/templates/chronological')),
  functional: lazy(() => import('@/components/resume/templates/functional')),
  combination: lazy(() => import('@/components/resume/templates/combination')),
  'tech-professional': lazy(() => import('@/components/resume/templates/tech-professional')),
};

// ─── Template Metadata ────────────────────────────────────────
// Free templates are listed first so they appear at the top of the gallery.

const templateMetadata: Record<TemplateId, TemplateMeta> = {
  'ats-classic': {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Clean, single-column layout optimized for maximum ATS compatibility.',
    atsRating: 5,
    tier: 'free',
    tags: ['ATS Friendly', 'Simple', 'Single Column'],
  },
  'professional-blue': {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Modern corporate style with blue accents and clean typography.',
    atsRating: 4,
    tier: 'free',
    tags: ['Corporate', 'Modern', 'Blue'],
  },
  graduate: {
    id: 'graduate',
    name: 'Graduate',
    description: 'Optimized for students and recent graduates with education-first layout.',
    atsRating: 4,
    tier: 'free',
    tags: ['Student', 'Graduate', 'Education-First'],
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Elegant, leadership-focused layout with a premium appearance.',
    atsRating: 3,
    tier: 'pro',
    tags: ['Elegant', 'Leadership', 'Premium'],
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Large headings, minimalist design with excellent white space.',
    atsRating: 4,
    tier: 'pro',
    tags: ['Minimal', 'Clean', 'White Space'],
  },
  contemporary: {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Modern layout with professional typography and balanced spacing.',
    atsRating: 4,
    tier: 'pro',
    tags: ['Modern', 'Professional', 'Balanced'],
  },
  chronological: {
    id: 'chronological',
    name: 'Chronological',
    description: 'Traditional recruiter-friendly layout with employment history first.',
    atsRating: 5,
    tier: 'pro',
    tags: ['Traditional', 'Recruiter-Friendly', 'Timeline'],
  },
  functional: {
    id: 'functional',
    name: 'Functional',
    description: 'Skills-first layout ideal for career changers and diverse backgrounds.',
    atsRating: 3,
    tier: 'pro',
    tags: ['Skills-First', 'Career Change', 'Functional'],
  },
  combination: {
    id: 'combination',
    name: 'Combination',
    description: 'Balanced mix of skills and experience sections for versatile professionals.',
    atsRating: 4,
    tier: 'pro',
    tags: ['Hybrid', 'Versatile', 'Balanced'],
  },
  'tech-professional': {
    id: 'tech-professional',
    name: 'Tech Professional',
    description: 'Designed for software engineers, developers, and IT professionals.',
    atsRating: 4,
    tier: 'pro',
    tags: ['Tech', 'Engineering', 'Developer'],
  },
};

// ─── Public API ───────────────────────────────────────────────

export function getTemplateMeta(id: TemplateId): TemplateMeta {
  return templateMetadata[id];
}

export function getTemplateComponent(id: TemplateId): ComponentType<TemplateComponentProps> {
  return templateComponents[id];
}

export function getAllTemplates(): TemplateMeta[] {
  return Object.values(templateMetadata);
}

export function getTemplatesByTier(tier: 'free' | 'pro'): TemplateMeta[] {
  return Object.values(templateMetadata).filter(t => t.tier === tier);
}

export function isTemplateFree(id: TemplateId): boolean {
  return templateMetadata[id].tier === 'free';
}

export function isValidTemplateId(id: string): id is TemplateId {
  return id in templateMetadata;
}