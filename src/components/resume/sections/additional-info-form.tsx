'use client';

import { Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AdditionalInfoFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

export function AdditionalInfoForm({ resumeData, setResumeData, onAiAssist }: AdditionalInfoFormProps) {
  const value = resumeData.additionalInfo.text;

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Additional Information
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Add any additional information that does not fit in other sections, such as hobbies, interests, or publications.
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="additionalInfo" className="font-body">
            Additional Details
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
            onClick={() => onAiAssist?.({
              section: 'additionalInfo',
              content: resumeData.additionalInfo.text,
            })}
            aria-label="AI Assist"
          >
            <Sparkles className="size-4" />
          </Button>
        </div>
        <Textarea
          id="additionalInfo"
          value={value}
          onChange={(e) =>
            setResumeData((prev) => ({
              ...prev,
              additionalInfo: { text: e.target.value },
            }))
          }
          placeholder="Publications, conferences, hobbies, or any other relevant information..."
          className="mt-1.5 min-h-[200px] resize-y font-body"
        />
      </div>
    </div>
  );
}