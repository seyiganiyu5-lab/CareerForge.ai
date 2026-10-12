'use client';

import { SectionCard } from './section-card';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CoverLetterData } from '@/types/cover-letter';

interface SenderInfoSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function SenderInfoSection({ data, onChange }: SenderInfoSectionProps) {
  return (
    <SectionCard
      icon={<User className="w-4 h-4" />}
      title="Personal Information"
      description="Your contact details for the letter header"
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Full Name</Label>
          <Input
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. John Smith"
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email</Label>
            <Input
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="john@email.com"
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Phone</Label>
            <Input
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+1 234 567 890"
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address / City</Label>
            <Input
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="New York, NY"
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">LinkedIn</Label>
            <Input
              value={data.linkedIn}
              onChange={(e) => onChange({ linkedIn: e.target.value })}
              placeholder="linkedin.com/in/..."
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
