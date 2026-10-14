'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createAward } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';

interface AwardsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function AwardsForm({ resumeData, setResumeData }: AwardsFormProps) {
  const items = resumeData.awards;
  const t = useTranslations('app.resumeForms');

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      awards: [...prev.awards, createAward()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.filter((a) => a.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('awardsTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('awardsDescription')}
      </p>

      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {t('noEntries')}
            </p>
          </div>
        )}

        {items.map((item) => (
          <Card key={item.id} className="relative py-4 transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label className="font-body">{t('awardName')}</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder={t('awardNamePlaceholder')}
                      className="mt-1.5 font-body"
                    />
                  </div>
                  <div>
                    <Label className="font-body">{t('year')}</Label>
                    <Input
                      type="number"
                      value={item.year}
                      onChange={(e) => updateItem(item.id, 'year', e.target.value)}
                      placeholder="2024"
                      className="mt-1.5 font-body"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6 size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('deleteAward')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="mt-4">
                <Label className="font-body">{t('organization')}</Label>
                <Input
                  value={item.organization}
                  onChange={(e) => updateItem(item.id, 'organization', e.target.value)}
                  placeholder={t('awardOrganizationPlaceholder')}
                  className="mt-1.5 font-body"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addItem}
          className="w-full font-body"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('addAward')}
        </Button>
      </div>
    </div>
  );
}