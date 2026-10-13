'use client';

import { useState, useCallback, useRef, useEffect, type ElementType } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  Replace,
  ArrowDownToLine,
  Wand2,
  ChevronDown,
  Loader2,
  X,
  History,
  Lightbulb,
  Type,
  AlignLeft,
  Shrink,
  Expand,
  GraduationCap,
  Briefcase,
  Wrench,
  Target,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from '@/i18n/provider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiAssistPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  section: string;
  content: string;
  itemId?: string;
  field?: string;
  resumeData: Record<string, unknown>;
  onApply: (text: string) => void;
  onInsertBelow?: (text: string) => void;
  locale?: string;
}

interface ResultItem {
  id: string;
  text: string;
  action: string;
  loading: boolean;
  error?: string;
  copied: boolean;
}

// ---------------------------------------------------------------------------
// Section-action mapping
// ---------------------------------------------------------------------------

const SECTION_ACTIONS: Record<
  string,
  Array<{ action: string; icon: ElementType; label: string }>
> = {
  professionalSummary: [
    { action: 'generate', icon: Wand2, label: 'Generate' },
    { action: 'rewrite', icon: RotateCcw, label: 'Rewrite' },
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
    { action: 'shorten', icon: Shrink, label: 'Shorten' },
    { action: 'expand', icon: Expand, label: 'Expand' },
    { action: 'more_professional', icon: Briefcase, label: 'More Professional' },
    { action: 'more_technical', icon: Wrench, label: 'More Technical' },
    { action: 'simplify', icon: Type, label: 'Simplify' },
    { action: 'keywords', icon: Search, label: 'Keywords' },
    { action: 'grammar', icon: ShieldCheck, label: 'Grammar Check' },
  ],
  workExperience: [
    { action: 'generate', icon: Wand2, label: 'Generate Bullets' },
    { action: 'rewrite', icon: RotateCcw, label: 'Rewrite' },
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
    { action: 'expand', icon: Expand, label: 'Expand' },
    { action: 'condense', icon: Shrink, label: 'Condense' },
    { action: 'achievement', icon: Target, label: 'Achievements' },
    { action: 'more_professional', icon: Briefcase, label: 'More Professional' },
    { action: 'more_technical', icon: Wrench, label: 'More Technical' },
    { action: 'simplify', icon: Type, label: 'Simplify' },
    { action: 'grammar', icon: ShieldCheck, label: 'Grammar Check' },
  ],
  education: [
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
    { action: 'rewrite', icon: RotateCcw, label: 'Rewrite' },
    { action: 'grammar', icon: ShieldCheck, label: 'Grammar Check' },
  ],
  skills: [
    { action: 'skills_suggest', icon: Wand2, label: 'Suggest Skills' },
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
  ],
  projects: [
    { action: 'generate', icon: Wand2, label: 'Generate' },
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
    { action: 'achievement', icon: Target, label: 'Achievements' },
    { action: 'grammar', icon: ShieldCheck, label: 'Grammar Check' },
  ],
};

// ---------------------------------------------------------------------------
// Section display names
// ---------------------------------------------------------------------------

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  professionalSummary: 'Professional Summary',
  workExperience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  volunteerExperience: 'Volunteer Experience',
  references: 'References',
  additionalInfo: 'Additional Info',
};

// ---------------------------------------------------------------------------
// Loading messages
// ---------------------------------------------------------------------------

const LOADING_MESSAGES = [
  'Thinking...',
  'Generating...',
  'Improving...',
  'Analyzing...',
  'Crafting...',
  'Polishing...',
];

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const resultVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AiAssistPanel({
  open,
  onOpenChange,
  resumeId,
  section,
  content,
  itemId,
  field,
  resumeData,
  onApply,
  onInsertBelow,
}: AiAssistPanelProps) {
  // ---- i18n ----
  const t = useTranslations('ai.assistant');

  // ---- State ----
  const [results, setResults] = useState<ResultItem[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestInProgressRef = useRef(false);

  const actions = SECTION_ACTIONS[section] ?? [
    { action: 'improve', icon: Lightbulb, label: 'Improve' },
    { action: 'rewrite', icon: RotateCcw, label: 'Rewrite' },
    { action: 'grammar', icon: ShieldCheck, label: 'Grammar Check' },
  ];

  const sectionDisplayName = SECTION_DISPLAY_NAMES[section] ?? section;

  // ---- Loading message cycling ----
  useEffect(() => {
    if (!isSending) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isSending]);

  // ---- Clear state when panel closes ----
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setResults([]);
        setCustomPrompt('');
        setIsSending(false);
        setLoadingMessage(LOADING_MESSAGES[0]);
        requestInProgressRef.current = false;
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  // ---- Send AI request ----
  const sendAiRequest = useCallback(
    async (action: string, customPromptText?: string) => {
      if (requestInProgressRef.current) return;
      requestInProgressRef.current = true;
      setIsSending(true);

      const resultId = Date.now().toString(36);
      setResults((prev) => [
        ...prev,
        { id: resultId, text: '', action, loading: true, copied: false },
      ]);

      // Scroll to bottom after the new result is rendered
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);

      try {
        const res = await fetch(`/api/resumes/${resumeId}/ai-assist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section,
            action,
            content,
            itemId,
            field,
            customPrompt: customPromptText,
            resumeContext: resumeData,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error === 'limit_reached' || data.error === 'upgrade_required') {
            setResults((prev) => prev.filter((r) => r.id !== resultId));
            onOpenChange(false);
            window.dispatchEvent(
              new CustomEvent('ai-limit-reached', { detail: data }),
            );
            return;
          }
          throw new Error(data.error || 'Failed to generate suggestion');
        }

        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, text: data.result, loading: false }
              : r,
          ),
        );
      } catch (err) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? {
                  ...r,
                  loading: false,
                  error:
                    err instanceof Error
                      ? err.message
                      : 'An error occurred',
                }
              : r,
          ),
        );
      } finally {
        setIsSending(false);
        requestInProgressRef.current = false;
      }
    },
    [resumeId, section, content, itemId, field, resumeData, onOpenChange],
  );

  // ---- Copy to clipboard ----
  const copyToClipboard = useCallback(
    async (text: string, resultId: string) => {
      await navigator.clipboard.writeText(text);
      setResults((prev) =>
        prev.map((r) => (r.id === resultId ? { ...r, copied: true } : r)),
      );
      setTimeout(() => {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId ? { ...r, copied: false } : r,
          ),
        );
      }, 2000);
    },
    [],
  );

  // ---- Apply result ----
  const handleApply = useCallback(
    (text: string) => {
      onApply(text);
      onOpenChange(false);
    },
    [onApply, onOpenChange],
  );

  // ---- Handle custom prompt submit ----
  const handleCustomSubmit = useCallback(() => {
    const trimmed = customPrompt.trim();
    if (!trimmed || requestInProgressRef.current) return;
    sendAiRequest('custom', trimmed);
    setCustomPrompt('');
  }, [customPrompt, sendAiRequest]);

  // ---- Handle action button click ----
  const handleActionClick = useCallback(
    (action: string) => {
      if (requestInProgressRef.current) return;
      sendAiRequest(action);
    },
    [sendAiRequest],
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={300}>
        <SheetContent
          side="right"
          className="sm:max-w-[480px] p-0 gap-0 [&>button.absolute]:hidden"
        >
          {/* =========================================================== */}
          {/* Header                                                      */}
          {/* =========================================================== */}
          <div className="relative flex items-center justify-between border-b border-border px-5 py-4">
            {/* Gradient accent line */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand via-violet to-emerald" />

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                <Sparkles className="size-5 text-brand" />
              </div>
              <div>
                <SheetTitle className="font-heading text-base font-semibold text-foreground">
                  AI Resume Assistant
                </SheetTitle>
                <p className="mt-0.5 text-xs text-muted-foreground font-body">
                  {t('subtitle') || 'Powered by AI'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              onClick={() => handleOpenChange(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* =========================================================== */}
          {/* Scrollable body                                             */}
          {/* =========================================================== */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            {/* --- Section badge & context --- */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-brand/10 text-brand border-brand/20 font-body font-medium text-xs"
                >
                  {sectionDisplayName}
                </Badge>
                {content && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground font-body text-[11px]"
                  >
                    {content.length > 50
                      ? `${content.length} chars`
                      : `"${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
                {t('description') ||
                  'Select a quick action below or type a custom request to enhance this section.'}
              </p>
            </div>

            <Separator className="mx-5 w-auto" />

            {/* --- Quick actions grid --- */}
            <div className="px-5 pt-4 pb-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">
                {t('quickActions') || 'Quick Actions'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence mode="popLayout">
                  {actions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.action}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleActionClick(item.action)}
                        disabled={isSending}
                        className="group flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-brand/40 hover:bg-brand/5 disabled:pointer-events-none disabled:opacity-50 font-body"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
                        <span className="truncate">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <Separator className="mx-5 w-auto" />

            {/* --- Custom prompt --- */}
            <div className="px-5 pt-4 pb-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">
                {t('customPrompt') || 'Or ask AI anything'}
              </p>
              <div className="relative">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={
                    t('placeholder') ||
                    'Type your request... e.g., "Make it more concise and action-oriented"'
                  }
                  rows={3}
                  className="resize-none rounded-lg border-border bg-card pr-12 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:ring-brand/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={handleCustomSubmit}
                      disabled={!customPrompt.trim() || isSending}
                      className="absolute bottom-2 right-2 size-8 rounded-md bg-brand text-primary-foreground shadow-sm hover:bg-brand/90 disabled:opacity-40"
                    >
                      {isSending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      <span className="sr-only">Send</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    {t('sendTooltip') || 'Send (⌘+Enter)'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Separator className="mx-5 w-auto" />

            {/* --- Results --- */}
            <div className="px-5 pt-4 pb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">
                {t('results') || 'Results'}
              </p>

              <AnimatePresence mode="popLayout">
                {results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center"
                  >
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand/10">
                      <Sparkles className="size-5 text-brand" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground font-body">
                      {t('noResults') || 'No suggestions yet'}
                    </p>
                    <p className="mt-1 max-w-[200px] text-xs text-muted-foreground/70 font-body">
                      {t('noResultsHint') ||
                        'Click a quick action or type a request to get started'}
                    </p>
                  </motion.div>
                )}

                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    variants={resultVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="mb-4 last:mb-0"
                  >
                    {/* ---- Loading state ---- */}
                    {result.loading && (
                      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin text-brand" />
                          <span className="text-sm font-medium text-brand font-body">
                            {loadingMessage}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          <Skeleton className="h-4 w-full rounded-md" />
                          <Skeleton className="h-4 w-11/12 rounded-md" />
                          <Skeleton className="h-4 w-4/5 rounded-md" />
                          <Skeleton className="h-4 w-9/12 rounded-md" />
                        </div>
                      </div>
                    )}

                    {/* ---- Error state ---- */}
                    {!result.loading && result.error && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                        <p className="mb-3 text-sm font-medium text-destructive font-body">
                          {result.error}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendAiRequest(result.action)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-body"
                        >
                          <RotateCcw className="size-3.5" />
                          {t('retry') || 'Retry'}
                        </Button>
                      </div>
                    )}

                    {/* ---- Success state ---- */}
                    {!result.loading && !result.error && result.text && (
                      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                        {/* Left accent border */}
                        <div className="flex">
                          <div className="w-1 shrink-0 bg-gradient-to-b from-brand to-violet" />

                          <div className="flex flex-1 flex-col">
                            {/* Result text */}
                            <div className="px-4 pt-4 pb-3">
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-body">
                                {result.text}
                              </p>
                            </div>

                            <Separator />

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
                              {/* Apply — primary brand */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApply(result.text)}
                                    className="h-8 rounded-md bg-brand px-3 text-xs font-medium text-primary-foreground shadow-sm hover:bg-brand/90 font-body"
                                  >
                                    <Check className="size-3.5" />
                                    {t('apply') || 'Apply'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {t('applyTooltip') ||
                                    'Replace current content with this'}
                                </TooltipContent>
                              </Tooltip>

                              {/* Replace */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApply(result.text)}
                                    className="h-8 rounded-md px-3 text-xs font-body"
                                  >
                                    <Replace className="size-3.5" />
                                    {t('replace') || 'Replace'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {t('replaceTooltip') ||
                                    'Replace the current field content'}
                                </TooltipContent>
                              </Tooltip>

                              {/* Insert Below */}
                              {onInsertBelow && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        onInsertBelow(result.text);
                                        handleOpenChange(false);
                                      }}
                                      className="h-8 rounded-md px-3 text-xs font-body"
                                    >
                                      <ArrowDownToLine className="size-3.5" />
                                      {t('insertBelow') || 'Insert Below'}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    {t('insertBelowTooltip') ||
                                      'Insert this content below the current field'}
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Spacer */}
                              <div className="flex-1" />

                              {/* Copy */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(result.text, result.id)
                                    }
                                    className="h-8 rounded-md px-3 text-xs font-body"
                                  >
                                    {result.copied ? (
                                      <>
                                        <Check className="size-3.5 text-emerald" />
                                        <span className="text-emerald">
                                          {t('copied') || 'Copied!'}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="size-3.5" />
                                        {t('copy') || 'Copy'}
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {t('copyTooltip') || 'Copy to clipboard'}
                                </TooltipContent>
                              </Tooltip>

                              {/* Regenerate */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      sendAiRequest(result.action)
                                    }
                                    disabled={isSending}
                                    className="h-8 rounded-md px-3 text-xs font-body"
                                  >
                                    <RotateCcw className="size-3.5" />
                                    {t('regenerate') || 'Regenerate'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {t('regenerateTooltip') ||
                                    'Generate a new variation'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* =========================================================== */}
          {/* Footer                                                      */}
          {/* =========================================================== */}
          <div className="border-t border-border px-5 py-3">
            <p className="text-center text-[11px] text-muted-foreground/70 font-body">
              {t('footer') ||
                'AI suggestions may not be perfect. Always review before applying.'}
            </p>
          </div>
        </SheetContent>
      </TooltipProvider>
    </Sheet>
  );
}