'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createCertification } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';

interface CertificationsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function CertificationsForm({ resumeData, setResumeData }: CertificationsFormProps) {
  const items = resumeData.certifications;
  const t = useTranslations('app.resumeForms');

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, createCertification()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('certificationsTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('certificationsDescription')}
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
                  aria-label={t('deleteCertification')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">{t('certificateName')}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="AWS Solutions Architect"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('issuer')}</Label>
                  <Input
                    value={item.issuer}
                    onChange={(e) => updateItem(item.id, 'issuer', e.target.value)}
                    placeholder="Amazon Web Services"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">{t('issueDate')}</Label>
                  <Input
                    type="month"
                    value={item.issueDate}
                    onChange={(e) => updateItem(item.id, 'issueDate', e.target.value)}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">{t('credentialUrl')}</Label>
                  <Input
                    type="url"
                    value={item.credentialUrl}
                    onChange={(e) => updateItem(item.id, 'credentialUrl', e.target.value)}
                    placeholder="https://credly.com/badges/..."
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
          {t('addCertification')}
        </Button>
      </div>
    </div>
  );
}