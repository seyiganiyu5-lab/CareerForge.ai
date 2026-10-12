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
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
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
              Generate with AI
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Fill in the details and AI will write a professional cover letter for you.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Developer"
                  className="pl-10 h-9 text-sm bg-muted/30 border-border/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="pl-10 h-9 text-sm bg-muted/30 border-border/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Hiring Manager <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              placeholder="Jane Smith"
              className="h-9 text-sm bg-muted/30 border-border/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Job Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description..."
              className="min-h-[100px] text-sm bg-muted/30 border-border/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'fr')}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
                  <SelectValue
                    placeholder={resumesLoading ? 'Loading...' : resumes.length === 0 ? 'None' : 'Choose...'}
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
            Cancel
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
                Generating...
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Cover Letter
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
