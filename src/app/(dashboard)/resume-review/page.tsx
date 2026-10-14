'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/provider';
import {
  Sparkles, FileSearch, RefreshCw, CheckCircle2, AlertTriangle,
  ChevronRight, Loader2, ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureGate } from '@/components/billing/feature-gate';

interface ResumeOption {
  id: string;
  title: string;
  template: string;
  status: string;
}

interface SectionReview {
  name: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

interface ReviewResult {
  score: number;
  sections: SectionReview[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 60) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function ScoreCircle({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-4xl font-bold font-heading ${getScoreColor(score)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-body">/100</span>
      </div>
    </div>
  );
}

function SectionCard({ section, index }: { section: SectionReview; index: number }) {
  const t = useTranslations('app.resumeReview');
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 + index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left"
          aria-expanded={open}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold font-heading ${getScoreBgColor(section.score)} ${getScoreColor(section.score)}`}>
              {section.score}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold font-heading text-sm">{section.name}</h4>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${section.score >= 80 ? 'border-emerald-500/30 text-emerald-600' : section.score >= 60 ? 'border-amber-500/30 text-amber-600' : 'border-red-500/30 text-red-600'}`}
                >
                  {section.score >= 80 ? t('good') : section.score >= 60 ? t('fair') : t('needsWork')}
                </Badge>
              </div>
              <Progress value={section.score} className="mt-2 h-1.5" />
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-body">
                {section.feedback}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          </CardContent>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Separator />
              <div className="p-4 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 font-heading">{t('feedback')}</h5>
                  <p className="text-sm text-foreground/80 font-body leading-relaxed">{section.feedback}</p>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 font-heading flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    {t('suggestions')}
                  </h5>
                  <ul className="space-y-1.5">
                    {section.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function ResumeReviewContent() {
  const t = useTranslations('app.resumeReview');
  const tc = useTranslations('app.common');
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState<'select' | 'paste'>('select');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch('/api/resumes', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setResumes(data.resumes);
      }
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setIsLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    if (inputMode === 'select') {
      fetchResumes();
    }
  }, [inputMode, fetchResumes]);

  const handleAnalyze = async () => {
    const hasResume = inputMode === 'select' && selectedResumeId;
    const hasText = inputMode === 'paste' && pastedText.trim();

    if (!hasResume && !hasText) {
      toast.error(inputMode === 'select' ? t('selectError') : t('pasteError'));
      return;
    }

    setIsAnalyzing(true);
    setReview(null);

    try {
      const body: { resumeId?: string; resumeText?: string } = {};
      if (inputMode === 'select') {
        body.resumeId = selectedResumeId;
      } else {
        body.resumeText = pastedText;
      }

      const res = await fetch('/api/resume-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || t('analysisFailed'));
        return;
      }

      setReview(data.review);
      toast.success(t('analyzed'));
    } catch {
      toast.error(tc('somethingWrong'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerate = () => {
    setReview(null);
    handleAnalyze();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand" />
          </div>
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1.5 font-body text-sm">
          {t('subtitle')}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!review && !isAnalyzing && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-heading">{t('selectTitle')}</CardTitle>
                <CardDescription className="font-body text-sm">
                  {t('selectSub')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'select' | 'paste')} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="select" className="flex-1 gap-1.5 text-xs sm:text-sm font-body">
                      <FileSearch className="w-3.5 h-3.5" />
                      {t('tabSelect')}
                    </TabsTrigger>
                    <TabsTrigger value="paste" className="flex-1 gap-1.5 text-xs sm:text-sm font-body">
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      {t('tabPaste')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="select" className="mt-4 space-y-3">
                    {isLoadingResumes ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ) : resumes.length === 0 ? (
                      <div className="text-center py-6">
                        <FileSearch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-body">
                          {t('noResumes')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="font-body text-sm">{t('chooseResume')}</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                          <SelectTrigger className="w-full font-body">
                            <SelectValue placeholder={t('selectPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {resumes.map((r) => (
                              <SelectItem key={r.id} value={r.id} className="font-body">
                                {r.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="font-body text-sm">{t('resumeText')}</Label>
                      <Textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder={t('pastePlaceholder')}
                        className="min-h-[200px] font-body text-sm"
                      />
                      <p className="text-xs text-muted-foreground font-body">
                        {t('pasteHint')}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (inputMode === 'select' && !selectedResumeId) || (inputMode === 'paste' && !pastedText.trim())}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-body"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {t('analyze')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-10 h-10 text-brand" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-semibold font-heading">{t('analyzingTitle')}</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-body">
                    {t('analyzingBody')}
                  </p>
                </div>
                <div className="w-48">
                  <Skeleton className="h-1.5 w-full" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {review && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Score overview */}
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <ScoreCircle score={review.score} />
                  <div className="text-center sm:text-left space-y-2">
                    <h2 className="text-xl font-bold font-heading text-foreground">
                      {t('overallScore', { score: review.score })}
                    </h2>
                    <p className="text-sm text-muted-foreground font-body max-w-sm">
                      {review.score >= 80
                        ? t('score80')
                        : review.score >= 60
                          ? t('score60')
                          : t('score0')}
                    </p>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      size="sm"
                      disabled={isAnalyzing}
                      className="mt-2 font-body"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {t('regenerate')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section breakdown */}
            <div>
              <h3 className="text-lg font-semibold font-heading mb-3 flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-brand" />
                {t('sectionBreakdown')}
              </h3>
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3 pr-2">
                  {review.sections.map((section, i) => (
                    <SectionCard key={section.name} section={section} index={i} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResumeReviewPage() {
  return (
    <FeatureGate featureKey="AI_RESUME_REVIEW">
      <ResumeReviewContent />
    </FeatureGate>
  );
}