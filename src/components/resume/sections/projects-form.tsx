'use client';

import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createProject } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';

interface ProjectsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

export function ProjectsForm({ resumeData, setResumeData, onAiAssist }: ProjectsFormProps) {
  const items = resumeData.projects;
  const t = useTranslations('app.resumeForms');

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, createProject()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('projectsTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('projectsDescription')}
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
                  aria-label={t('deleteProject')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
                <div>
                  <Label className="font-body">{t('projectName')}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder={t('projectNamePlaceholder')}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('technologies')}</Label>
                  <Input
                    value={item.technologies}
                    onChange={(e) => updateItem(item.id, 'technologies', e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div>
              <div className="flex items-center justify-between">
                <Label className="font-body">{t('description')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
                  onClick={() => onAiAssist?.({
                    section: 'projects',
                    content: item.description,
                    itemId: item.id,
                    field: 'description',
                  })}
                  aria-label={t('aiAssist')}
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder={t('projectDescriptionPlaceholder')}
                  className="mt-1.5 min-h-[80px] resize-y font-body"
                />
              </div>

              <div>
              <div className="flex items-center justify-between">
                <Label className="font-body">{t('businessImpact')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
                  onClick={() => onAiAssist?.({
                    section: 'projects',
                    content: item.results,
                    itemId: item.id,
                    field: 'results',
                  })}
                  aria-label={t('aiAssistResults')}
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
                <Textarea
                  value={item.results}
                  onChange={(e) => updateItem(item.id, 'results', e.target.value)}
                  placeholder={t('businessImpactPlaceholder')}
                  className="mt-1.5 min-h-[80px] resize-y font-body"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
                <div>
                  <Label className="font-body">{t('githubUrl')}</Label>
                  <Input
                    type="url"
                    value={item.githubUrl}
                    onChange={(e) => updateItem(item.id, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('liveUrl')}</Label>
                  <Input
                    type="url"
                    value={item.liveUrl}
                    onChange={(e) => updateItem(item.id, 'liveUrl', e.target.value)}
                    placeholder="https://myproject.com"
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
          {t('addProject')}
        </Button>
      </div>
    </div>
  );
}