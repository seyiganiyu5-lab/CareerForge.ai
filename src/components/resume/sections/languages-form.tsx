'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { PROFICIENCY_LEVELS } from '@/types/resume';
import { createLanguage } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LANGUAGE_LEVEL_KEYS: Record<string, string> = {
  Native: 'levelNative',
  Fluent: 'levelFluent',
  Advanced: 'levelAdvanced',
  Intermediate: 'levelIntermediate',
  Beginner: 'levelBeginner',
};

interface LanguagesFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function LanguagesForm({ resumeData, setResumeData }: LanguagesFormProps) {
  const items = resumeData.languages;
  const t = useTranslations('app.resumeForms');

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, createLanguage()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('languagesTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('languagesDescription')}
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
                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="font-body">{t('language')}</Label>
                    <Input
                      value={item.language}
                      onChange={(e) => updateItem(item.id, 'language', e.target.value)}
                      placeholder={t('languagePlaceholder')}
                      className="mt-1.5 font-body"
                    />
                  </div>
                  <div>
                    <Label className="font-body">{t('proficiency')}</Label>
                    <Select
                      value={item.proficiency}
                      onValueChange={(v) => updateItem(item.id, 'proficiency', v)}
                    >
                      <SelectTrigger className="mt-1.5 w-full font-body">
                        <SelectValue placeholder={t('selectLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {LANGUAGE_LEVEL_KEYS[level] ? t(LANGUAGE_LEVEL_KEYS[level]) : level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6 size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('deleteLanguage')}
                >
                  <Trash2 className="size-4" />
                </Button>
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
          {t('addLanguage')}
        </Button>
      </div>
    </div>
  );
}