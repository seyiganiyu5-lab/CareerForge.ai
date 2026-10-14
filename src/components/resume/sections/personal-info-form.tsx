'use client';

import type { ResumeData } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/provider';

interface PersonalInfoFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function PersonalInfoForm({ resumeData, setResumeData }: PersonalInfoFormProps) {
  const { personalInfo } = resumeData;
  const t = useTranslations('app.resumeForms');

  const update = (field: keyof typeof personalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const fields: { key: keyof typeof personalInfo; label: string; type?: string; required?: boolean; placeholder: string }[] = [
    { key: 'fullName', label: t('fullName'), required: true, placeholder: t('fullNamePlaceholder') },
    { key: 'professionalTitle', label: t('professionalTitle'), placeholder: t('professionalTitlePlaceholder') },
    { key: 'email', label: t('email'), type: 'email', placeholder: 'john@example.com' },
    { key: 'phone', label: t('phone'), type: 'tel', placeholder: '+1 (555) 123-4567' },
    { key: 'location', label: t('location'), placeholder: t('locationPlaceholder') },
    { key: 'website', label: t('website'), type: 'url', placeholder: 'https://johndoe.com' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/johndoe' },
    { key: 'github', label: 'GitHub', placeholder: 'github.com/johndoe' },
    { key: 'portfolio', label: t('portfolio'), type: 'url', placeholder: 'https://portfolio.johndoe.com' },
  ];

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t('personalInfoTitle')}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        {t('personalInfoDescription')}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={field.key === 'fullName' ? 'sm:col-span-2' : ''}>
            <Label htmlFor={field.key} className="font-body">
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type || 'text'}
              value={personalInfo[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 font-body"
            />
          </div>
        ))}
      </div>
    </div>
  );
}