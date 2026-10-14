'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createEducation } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';

interface EducationFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function EducationForm({ resumeData, setResumeData }: EducationFormProps) {
  const items = resumeData.education;
  const t = useTranslations('app.resumeForms');

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, createEducation()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('educationTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('educationDescription')}
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
            <CardContent className="space-y-4">
              <div className="flex items-start justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('deleteEducation')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">{t('school')}</Label>
                  <Input
                    value={item.school}
                    onChange={(e) => updateItem(item.id, 'school', e.target.value)}
                    placeholder={t('schoolPlaceholder')}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('location')}</Label>
                  <Input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    placeholder={t('schoolLocationPlaceholder')}
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">{t('degree')}</Label>
                  <Input
                    value={item.degree}
                    onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                    placeholder={t('degreePlaceholder')}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('fieldOfStudy')}</Label>
                  <Input
                    value={item.fieldOfStudy}
                    onChange={(e) => updateItem(item.id, 'fieldOfStudy', e.target.value)}
                    placeholder={t('fieldOfStudyPlaceholder')}
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="font-body">{t('startDate')}</Label>
                  <Input
                    type="month"
                    value={item.startDate}
                    onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('endDate')}</Label>
                  <Input
                    type="month"
                    value={item.endDate}
                    onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('grade')}</Label>
                  <Input
                    value={item.grade}
                    onChange={(e) => updateItem(item.id, 'grade', e.target.value)}
                    placeholder="3.8 / 4.0"
                    className="mt-1.5 font-body"
                  />
                </div>
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
          {t('addEducation')}
        </Button>
      </div>
    </div>
  );
}