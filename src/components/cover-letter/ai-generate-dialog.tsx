'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Briefcase,
  Building2,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/types/cover-letter';
import type { ToneType } from '@/types/cover-letter';
import { useLocale, useTranslations } from '@/i18n/provider';

const toPascal = (value: string) =>
  value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

/** Translated display labels for tone/language/template options (values stay unchanged). */
export function useCoverLetterOptionLabels() {
  const t = useTranslations('app.coverLetterEditor');
  const lookup = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  return {
    tone: (value: string, fallback: string = value) => lookup(`tone${toPascal(value)}`, fallback),
    language: (value: string, fallback: string = value) => lookup(`language${toPascal(value)}`, fallback),
    template: (name: string) => lookup(`template${name.replace(/[^A-Za-z]/g, '')}`, name),
    tag: (tag: string) => lookup(`tag${tag.replace(/[^A-Za-z]/g, '')}`, tag),
    color: (label: string) => lookup(`color${label.replace(/[^A-Za-z]/g, '')}`, label),
  };
}

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (params: {
    jobTitle: string;
    companyName: string;
    hiringManager?: string;
    jobDescription: string;
    resumeId?: string;
    tone?: string;
    language?: 'en' | 'fr';
  }) => Promise<void>;
  isGenerating: boolean;
}

export function AIGenerateDialog({ open, onOpenChange, onGenerate, isGenerating }: AIGenerateDialogProps) {
  const t = useTranslations('app.coverLetterEditor');
  const tc = useTranslations('app.common');
  const labels = useCoverLetterOptionLabels();
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const { locale } = useLocale();
  // Default the letter language to the site language; the user can still change it
  const [language, setLanguage] = useState<'en' | 'fr'>(locale);
  const [resumeId, setResumeId] = useState('');
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      async function fetchResumes() {
        setResumesLoading(true);
        try {
          const res = await fetch('/api/resumes', { credentials: 'include' });
          const json = await res.json();
          if (json.success) setResumes(json.resumes || []);
        } catch { /* silent */ }
        finally { setResumesLoading(false); }
      }
      fetchResumes();
    }
  }, [open]);

  const isValid = jobTitle.trim() && companyName.trim() && jobDescription.trim();

  const handleGenerate = async () => {
    await onGenerate({
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      hiringManager: hiringManager.trim() || undefined,
      jobDescription: jobDescription.trim(),
      resumeId: resumeId || undefined,
      tone,
      language,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand/10 via-brand/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg font-heading">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-white shadow-md shadow-brand/30">
                <Sparkles className="w-4 h-4" />
              </div>
              {t('generateWithAI')}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              {t('aiDialogDescription')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {t('jobTitle')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder={t('jobTitlePlaceholderShort')}
                  className="pl-10 h-9 text-sm bg-muted/30 border-border/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {t('companyName')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('companyPlaceholderShort')}
                  className="pl-10 h-9 text-sm bg-muted/30 border-border/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {t('hiringManager')} <span className="text-muted-foreground font-normal">{t('optional')}</span>
            </Label>
            <Input
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              placeholder={t('hiringManagerPlaceholderShort')}
              className="h-9 text-sm bg-muted/30 border-border/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {t('jobDescription')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t('jobDescriptionPlaceholderShort')}
              className="min-h-[100px] text-sm bg-muted/30 border-border/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('tone')}</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{labels.tone(o.value, o.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('language')}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'fr')}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="text-xs">{labels.language(l.value, l.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('resume')}</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue
                    placeholder={resumesLoading ? tc('loading') : resumes.length === 0 ? t('resumeNone') : t('resumeChoose')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/30 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-sm"
            disabled={isGenerating}
          >
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className="bg-brand hover:bg-brand/90 text-white text-sm shadow-md shadow-brand/20 min-w-[160px]"
          >
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('generating')}
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('generateCoverLetter')}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
