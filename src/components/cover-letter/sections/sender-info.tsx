'use client';

import { SectionCard } from './section-card';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CoverLetterData } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';

interface SenderInfoSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function SenderInfoSection({ data, onChange }: SenderInfoSectionProps) {
  const t = useTranslations('app.coverLetterEditor');
  return (
    <SectionCard
      icon={<User className="w-4 h-4" />}
      title={t('senderTitle')}
      description={t('senderDescription')}
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('fullName')}</Label>
          <Input
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={t('fullNamePlaceholder')}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('email')}</Label>
            <Input
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="john@email.com"
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('phone')}</Label>
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
            <Label className="text-xs font-medium">{t('addressCity')}</Label>
            <Input
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder={t('addressPlaceholder')}
              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('linkedIn')}</Label>
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
