'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Upload,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
  Zap,
  Loader2,
  Sparkles,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────

interface CategoryResult {
  score: number;
  maxScore: number;
  label: string;
  issues: string[];
}

interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchRate: number;
}

interface AiAnalysis {
  grammarIssues: { message: string; suggestion: string }[];
  suggestions: { message: string; priority: 'high' | 'medium' | 'low' };
  strengths: string[];
  weaknesses: string[];
}

interface AtsResult {
  score: number;
  categories: Record<string, CategoryResult>;
  aiAnalysis?: AiAnalysis;
  keywordMatch?: KeywordMatchResult;
  isPremium: boolean;
}

interface ResumeOption {
  id: string;
  title: string;
  template: string;
  updated_at: string;
}

// ─── Score Ring Component ─────────────────────────────────────────

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : score >= 40 ? 'text-orange-500' : 'text-red-500';
  const bgColor = score >= 80 ? 'bg-emerald-500/10' : score >= 60 ? 'bg-amber-500/10' : score >= 40 ? 'bg-orange-500/10' : 'bg-red-500/10';
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={strokeColor} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className={cn('text-4xl font-bold font-heading', color)}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-body">/ 100</span>
        <Badge variant="secondary" className={cn('mt-1 text-[10px] font-medium', bgColor, color)}>
          {label}
        </Badge>
      </div>
    </div>
  );
}

// ─── Category Bar Component ───────────────────────────────────────

function CategoryBar({ category }: { category: CategoryResult }) {
  const pct = Math.round((category.score / category.maxScore) * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium font-body text-foreground">{category.label}</span>
        <span className="text-sm font-semibold font-body text-muted-foreground">
          {category.score}/{category.maxScore}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {category.issues.length > 0 && (
        <ul className="space-y-1 mt-2">
          {category.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-body">
              <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Skeleton className="w-40 h-40 rounded-full" />
      </div>
      <div className="grid gap-4 max-w-2xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-12" /></div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function AtsCheckerPage() {
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [inputMode, setInputMode] = useState<'select' | 'paste'>('select');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subLoaded, setSubLoaded] = useState(false);

  // Fetch user's resumes and premium status
  useEffect(() => {
    const load = async () => {
      try {
        const [resRes, usageRes] = await Promise.all([
          fetch('/api/resumes', { credentials: 'include' }),
          fetch('/api/usage/me', { credentials: 'include' }),
        ]);
        if (resRes.ok) {
          const data = await resRes.json();
          if (data.success) setResumes(data.resumes || []);
        }
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          if (usageData.success) setIsPremium(usageData.isPremium || false);
        }
      } catch { /* silent */ }
      setSubLoaded(true);
    };
    load();
  }, []);

  const handleAnalyze = useCallback(async () => {
    const hasText = inputMode === 'paste' ? resumeText.trim().length > 50 : !!selectedResumeId;
    if (!hasText) {
      setError('Please select a resume or paste your resume text.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, string> = { jobDescription: jobDescription.trim() };
      if (inputMode === 'select') {
        body.resumeId = selectedResumeId;
      } else {
        body.resumeText = resumeText.trim();
      }

      const res = await fetch('/api/ats-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'limit_reached' || data.error === 'upgrade_required') {
          setUpgradeOpen(true);
          return;
        }
        setError(data.error || 'Analysis failed. Please try again.');
        return;
      }

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [inputMode, resumeText, selectedResumeId, jobDescription]);

  const categories = result ? Object.values(result.categories) : [];

  return (
    <div className="min-h-[calc(100vh-64px)] pb-8">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                ATS Compatibility Checker
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Analyze your resume against ATS standards and get actionable improvement tips
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <AnimatePresence mode="wait">
          {!result && !analyzing && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* Input Section */}
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-heading">Select Your Resume</CardTitle>
                  <CardDescription className="text-sm font-body">
                    Choose an existing resume or paste your resume text below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                    {(['select', 'paste'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setInputMode(mode)}
                        className={cn(
                          'px-4 py-1.5 rounded-md text-sm font-medium font-body transition-all',
                          inputMode === mode
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {mode === 'select' ? 'My Resumes' : 'Paste Text'}
                      </button>
                    ))}
                  </div>

                  {/* Resume Select */}
                  {inputMode === 'select' ? (
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Choose a resume</Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Select a resume..." />
                        </SelectTrigger>
                        <SelectContent>
                          {resumes.length === 0 ? (
                            <SelectItem value="__none" disabled>No resumes found</SelectItem>
                          ) : (
                            resumes.map((r) => (
                              <SelectItem key={r.id} value={r.id} className="font-body">
                                {r.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {resumes.length === 0 && (
                        <p className="text-xs text-muted-foreground font-body">
                          No resumes yet.{' '}
                          <a href="/resume-builder" className="text-brand underline underline-offset-2">Create one first</a>.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Paste your resume text</Label>
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your full resume text here..."
                        className="min-h-[200px] font-body text-sm"
                      />
                      <p className="text-xs text-muted-foreground font-body">
                        {resumeText.trim().length} characters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base font-heading">Job Description (Optional)</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-body">
                    Paste a job description to get keyword matching analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for keyword analysis..."
                    className="min-h-[120px] font-body text-sm"
                  />
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                >
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-body">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Analyze Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  size="lg"
                  className="gap-2 px-8 font-body bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Analyze Resume
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Pro badge notice — only show after subscription data loads to prevent flash */}
              {subLoaded && !isPremium && (
                <p className="text-center text-xs text-muted-foreground mt-3 font-body">
                  Basic scoring is free.{' '}
                  <button onClick={() => setUpgradeOpen(true)} className="text-brand hover:underline">
                    Upgrade to Pro
                  </button>{' '}
                  for AI-powered grammar, suggestions, and detailed analysis.
                </p>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {analyzing && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisSkeleton />
            </motion.div>
          )}

          {/* Results */}
          {result && !analyzing && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
              {/* Score Overview */}
              <Card>
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <ScoreRing score={result.score} />
                    <div className="flex-1 text-center sm:text-left space-y-4">
                      <div>
                        <h2 className="text-lg font-bold font-heading text-foreground">
                          ATS Compatibility Score
                        </h2>
                        <p className="text-sm text-muted-foreground font-body mt-1">
                          {result.score >= 80
                            ? 'Great job! Your resume is well-optimized for ATS systems.'
                            : result.score >= 60
                              ? 'Your resume has a good foundation. A few improvements can make a big difference.'
                              : result.score >= 40
                                ? 'Your resume needs some work to pass ATS screening. Focus on the areas below.'
                                : 'Your resume has significant ATS issues. Address the critical areas first.'}
                        </p>
                      </div>
                      {result.isPremium && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Pro Analysis
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {categories.map((cat) => (
                    <CategoryBar key={cat.label} category={cat} />
                  ))}
                </CardContent>
              </Card>

              {/* Keyword Match */}
              {result.keywordMatch && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Keyword Match Analysis
                    </CardTitle>
                    <CardDescription className="text-sm font-body">
                      {Math.round(result.keywordMatch.matchRate * 100)}% of job keywords found in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.keywordMatch.matched.length > 0 && (
                      <div>
                        <p className="text-sm font-medium font-body mb-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                          Found ({result.keywordMatch.matched.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.matched.map((kw) => (
                            <Badge key={kw} variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 font-body text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.keywordMatch.missing.length > 0 && (
                      <div>
                        <p className="text-sm font-medium font-body mb-2 text-red-600 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />
                          Missing ({result.keywordMatch.missing.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.missing.map((kw) => (
                            <Badge key={kw} variant="secondary" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 font-body text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI Analysis (Pro only) */}
              {result.aiAnalysis && (
                <>
                  {/* Strengths & Weaknesses */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Star className="w-4 h-4" /> Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.aiAnalysis.strengths.length > 0 ? (
                          <ul className="space-y-2">
                            {result.aiAnalysis.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground font-body">No specific strengths identified.</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-4 h-4" /> Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.aiAnalysis.weaknesses.length > 0 ? (
                          <ul className="space-y-2">
                            {result.aiAnalysis.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground font-body">No major weaknesses found.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Suggestions */}
                  {result.aiAnalysis.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          AI-Powered Suggestions
                        </CardTitle>
                        <CardDescription className="text-sm font-body">
                          Smart recommendations to improve your resume
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.aiAnalysis.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'shrink-0 text-[10px] font-semibold border-0 font-body',
                                s.priority === 'high' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                                s.priority === 'medium' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                                s.priority === 'low' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                              )}
                            >
                              {s.priority.toUpperCase()}
                            </Badge>
                            <p className="text-sm font-body text-foreground leading-relaxed">{s.message}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Grammar Issues */}
                  {result.aiAnalysis.grammarIssues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Grammar & Style Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.aiAnalysis.grammarIssues.map((g, i) => (
                          <div key={i} className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                            <p className="text-sm font-body text-foreground">{g.message}</p>
                            {g.suggestion && (
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-body">
                                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                                {g.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Upgrade Prompt for Free Users */}
              {!result.isPremium && (
                <Card className="border-dashed border-2 border-brand/30 bg-brand/5">
                  <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-brand" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold font-heading text-foreground">
                        Unlock Full AI Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground font-body mt-1">
                        Get grammar checking, AI suggestions, strengths/weaknesses analysis, and more with Pro.
                      </p>
                    </div>
                    <Button onClick={() => setUpgradeOpen(true)} className="shrink-0 font-body">
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Run Again */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setResult(null); setError(null); }}
                  className="gap-2 font-body"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Run Another Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName="ATS Checker Pro Analysis"
      />
    </div>
  );
}