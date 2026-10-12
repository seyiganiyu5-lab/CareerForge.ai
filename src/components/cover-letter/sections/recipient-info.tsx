'use client';

import { SectionCard } from './section-card';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CoverLetterData } from '@/types/cover-letter';

interface RecipientInfoSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function RecipientInfoSection({ data, onChange }: RecipientInfoSectionProps) {
  return (
    <SectionCard
      icon={<Building2 className="w-4 h-4" />}
      title="Recipient Information"
      description="Who you're addressing the letter to"
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Hiring Manager <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            value={data.hiringManager}
            onChange={(e) => onChange({ hiringManager: e.target.value })}
            placeholder="e.g. Jane Smith"
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Company Name</Label>
          <Input
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="e.g. Acme Corp"
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Company Address <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            value={data.companyAddress}
            onChange={(e) => onChange({ companyAddress: e.target.value })}
            placeholder="123 Business St, City, State"
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>
      </div>
    </SectionCard>
  );
}
