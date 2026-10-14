'use client';

import { Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/provider';

interface SummaryFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

const MAX_CHARS = 2000;

export function SummaryForm({ resumeData, setResumeData, onAiAssist }: SummaryFormProps) {
  const value = resumeData.professionalSummary;
  const t = useTranslations('app.resumeForms');

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('summaryTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('summaryDescription')}
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="professionalSummary" className="font-body">
            {t('summaryLabel')}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
            onClick={() => onAiAssist?.({
              section: 'professionalSummary',
              content: resumeData.professionalSummary,
            })}
            aria-label={t('aiAssist')}
          >
            <Sparkles className="size-4" />
          </Button>
        </div>
        <Textarea
          id="professionalSummary"
          value={value}
          onChange={(e) =>
            setResumeData((prev) => ({
              ...prev,
              professionalSummary: e.target.value,
            }))
          }
          placeholder={t('summaryPlaceholder')}
          className="mt-1.5 min-h-[200px] resize-y font-body"
          maxLength={MAX_CHARS}
        />
        <div className="mt-1.5 flex justify-end">
          <span className="font-body text-xs text-muted-foreground">
            {t('charCount', { count: value.length, max: MAX_CHARS })}
          </span>
        </div>
      </div>
    </div>
  );
}