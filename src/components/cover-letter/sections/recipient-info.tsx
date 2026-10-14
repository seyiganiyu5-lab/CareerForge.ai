'use client';

import { SectionCard } from './section-card';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CoverLetterData } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';

interface RecipientInfoSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
}

export function RecipientInfoSection({ data, onChange }: RecipientInfoSectionProps) {
  const t = useTranslations('app.coverLetterEditor');
  return (
    <SectionCard
      icon={<Building2 className="w-4 h-4" />}
      title={t('recipientTitle')}
      description={t('recipientDescription')}
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            {t('hiringManager')} <span className="text-muted-foreground font-normal">{t('optional')}</span>
          </Label>
          <Input
            value={data.hiringManager}
            onChange={(e) => onChange({ hiringManager: e.target.value })}
            placeholder={t('hiringManagerPlaceholder')}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('companyName')}</Label>
          <Input
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder={t('companyPlaceholder')}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            {t('companyAddress')} <span className="text-muted-foreground font-normal">{t('optional')}</span>
          </Label>
          <Input
            value={data.companyAddress}
            onChange={(e) => onChange({ companyAddress: e.target.value })}
            placeholder={t('companyAddressPlaceholder')}
            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-brand/50 transition-colors"
          />
        </div>
      </div>
    </SectionCard>
  );
}
