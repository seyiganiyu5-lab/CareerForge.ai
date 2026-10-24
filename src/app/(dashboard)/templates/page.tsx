'use client';

import { useRouter } from 'next/navigation';
import { FadeInUp, FadeIn, StaggerItem } from '@/lib/motion';
import {
  FileText, Crown, Lock, Eye, ArrowRight, LayoutTemplate, Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n/provider';

// ---------------------------------------------------------------------------
// Template Data
// ---------------------------------------------------------------------------

interface TemplateCard {
  id: string;
  i18nKey: string;
  name: string;
  description: string;
  tier: 'Free' | 'Pro';
  gradient: string;
  accentLine: string;
}

const TEMPLATES: TemplateCard[] = [
  {
    id: 'modern-minimal',
    i18nKey: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with bold headings and generous whitespace.',
    tier: 'Free',
    gradient: 'from-rose-50 via-orange-50 to-amber-50',
    accentLine: 'bg-rose-400',
  },
  {
    id: 'ats-classic',
    i18nKey: 'professional',
    name: 'Professional',
    description: 'Traditional, ATS-friendly layout trusted by recruiters worldwide.',
    tier: 'Free',
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    accentLine: 'bg-emerald-500',
  },
  {
    id: 'executive',
    i18nKey: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior leaders and C-suite professionals.',
    tier: 'Pro',
    gradient: 'from-stone-100 via-neutral-100 to-zinc-100',
    accentLine: 'bg-stone-700',
  },
  {
    id: 'chronological',
    i18nKey: 'minimal',
    name: 'Minimal',
    description: 'Sleek, stripped-back layout that lets your experience speak.',
    tier: 'Free',
    gradient: 'from-gray-50 via-slate-50 to-zinc-50',
    accentLine: 'bg-gray-800',
  },
  {
    id: 'tech-professional',
    i18nKey: 'creative',
    name: 'Creative',
    description: 'Eye-catching layout with a modern edge for creative industries.',
    tier: 'Pro',
    gradient: 'from-fuchsia-50 via-pink-50 to-rose-50',
    accentLine: 'bg-fuchsia-500',
  },
  {
    id: 'ats-classic',
    i18nKey: 'atsFriendly',
    name: 'ATS-Friendly',
    description: 'Optimized for applicant tracking systems with maximum keyword visibility.',
    tier: 'Free',
    gradient: 'from-lime-50 via-green-50 to-emerald-50',
    accentLine: 'bg-lime-600',
  },
];

// ---------------------------------------------------------------------------
// Template Preview Placeholder
// ---------------------------------------------------------------------------

function TemplatePreview({ template }: { template: TemplateCard }) {
  return (
    <div className={`relative w-full aspect-[3/4] rounded-lg bg-gradient-to-br ${template.gradient} p-4 overflow-hidden`}>
      {/* Fake resume lines */}
      <div className="space-y-2.5">
        {/* Header area */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/60" />
          <div className="flex-1 space-y-1.5">
            <div className={`h-2.5 w-3/4 rounded-full ${template.accentLine} opacity-30`} />
            <div className="h-1.5 w-1/2 rounded-full bg-black/10" />
          </div>
        </div>

        {/* Summary */}
        <div className="h-1 w-12 rounded-full bg-black/15 mb-1.5" />
        <div className="space-y-1">
          <div className="h-1 rounded-full bg-black/8" style={{ width: '90%' }} />
          <div className="h-1 rounded-full bg-black/8" style={{ width: '95%' }} />
          <div className="h-1 rounded-full bg-black/8" style={{ width: '70%' }} />
        </div>

        {/* Experience */}
        <div className="h-1 w-16 rounded-full bg-black/15 mb-1.5" />
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1">
            <div className={`h-2 w-2/5 rounded-full ${template.accentLine} opacity-25`} />
            <div className="flex gap-1.5">
              <div className="h-1 w-1/4 rounded-full bg-black/10" />
              <div className="h-1 w-1/3 rounded-full bg-black/8" />
            </div>
            <div className="space-y-0.5">
              <div className="h-1 rounded-full bg-black/6" style={{ width: '100%' }} />
              <div className="h-1 rounded-full bg-black/6" style={{ width: '88%' }} />
            </div>
          </div>
        ))}

        {/* Skills */}
        <div className="h-1 w-10 rounded-full bg-black/15 mb-1.5" />
        <div className="flex flex-wrap gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-black/8"
              style={{ width: `${40 + Math.random() * 30}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const router = useRouter();
  const t = useTranslations('app.templatesPage');
  const tc = useTranslations('app.common');
  const { user } = useAuth();

  // Templates the member's organisation recommends come first
  const recommended = user?.organization?.recommended_templates ?? [];
  const rank = (id: string) => (recommended.includes(id) ? recommended.indexOf(id) : recommended.length);
  const templates = [...TEMPLATES].sort((a, b) => rank(a.id) - rank(b.id));

  const handleUseTemplate = (templateId: string) => {
    router.push(`/resume-builder?template=${templateId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp duration={0.4}>
        <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5 text-brand" />
          </div>
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1.5 font-body text-sm">
          {t('subtitle')}
        </p>
      </FadeInUp>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, idx) => (
          <StaggerItem
            key={template.name}
            delay={0.08 * idx}
            duration={0.35}
          >
            <Card className="group overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Preview */}
                <div className="relative">
                  <TemplatePreview template={template} />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                  {/* Lock icon for Pro */}
                  {template.tier === 'Pro' && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold font-heading text-sm">
                      {t(`${template.i18nKey}Name`)}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        template.tier === 'Pro'
                          ? 'border-amber-300 text-amber-700 bg-amber-50'
                          : 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {template.tier === 'Pro' && <Crown className="w-2.5 h-2.5 mr-0.5" />}
                      {template.tier === 'Pro' ? tc('pro') : t('free')}
                    </Badge>
                  </div>

                  {recommended.includes(template.id) && user?.organization && (
                    <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-brand font-body">
                      <Building2 className="w-3 h-3 shrink-0" /> {t('recommendedBy', { organization: user.organization.name })}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3 flex-1">
                    {t(`${template.i18nKey}Desc`)}
                  </p>

                  <Button
                    onClick={() => handleUseTemplate(template.id)}
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 font-body text-xs group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors duration-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('useTemplate')}
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </div>

      {/* Bottom note */}
      <FadeIn delay={0.5} duration={0.4} className="text-center">
        <p className="text-xs text-muted-foreground font-body">
          <FileText className="w-3 h-3 inline mr-1" />
          {t('customizableNote')}
        </p>
      </FadeIn>
    </div>
  );
}