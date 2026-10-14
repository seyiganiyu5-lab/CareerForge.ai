'use client';

import { SectionCard } from './section-card';
import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/types/cover-letter';
import type { CoverLetterData, ToneType } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';
import { useCoverLetterOptionLabels } from '../ai-generate-dialog';

interface JobDetailsSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function JobDetailsSection({ data, onChange }: JobDetailsSectionProps) {
  const t = useTranslations('app.coverLetterEditor');
  const labels = useCoverLetterOptionLabels();
  return (
    <SectionCard
      icon={<Briefcase className="w-4 h-4" />}
      title={t('jobDetailsTitle')}
      description={t('jobDetailsDescription')}
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('jobTitle')}</Label>
          <Input
            value={data.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
            placeholder={t('jobTitlePlaceholder')}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('jobDescription')}</Label>
          <Textarea
            value={data.jobDescription}
            onChange={(e) => onChange({ jobDescription: e.target.value })}
            placeholder={t('jobDescriptionPlaceholder')}
            className="min-h-[100px] text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('language')}</Label>
            <Select value={data.language} onValueChange={(v) => onChange({ language: v as 'en' | 'fr' })}>
              <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{labels.language(l.value, l.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('writingTone')}</Label>
            <Select value={data.tone} onValueChange={(v) => onChange({ tone: v as ToneType })}>
              <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{labels.tone(o.value, o.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('date')}</Label>
          <Input
            type="date"
            value={data.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>
      </div>
    </SectionCard>
  );
}
