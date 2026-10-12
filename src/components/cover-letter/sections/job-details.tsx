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

interface JobDetailsSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function JobDetailsSection({ data, onChange }: JobDetailsSectionProps) {
  return (
    <SectionCard
      icon={<Briefcase className="w-4 h-4" />}
      title="Job Details"
      description="Information about the position you're applying for"
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Job Title</Label>
          <Input
            value={data.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Job Description</Label>
          <Textarea
            value={data.jobDescription}
            onChange={(e) => onChange({ jobDescription: e.target.value })}
            placeholder="Paste the full job description here..."
            className="min-h-[100px] text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Language</Label>
            <Select value={data.language} onValueChange={(v) => onChange({ language: v as 'en' | 'fr' })}>
              <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Writing Tone</Label>
            <Select value={data.tone} onValueChange={(v) => onChange({ tone: v as ToneType })}>
              <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
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
