'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, RotateCcw, Trash2, ChevronRight, Sparkles, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface AiHistoryPanelProps {
  resumeId: string;
  onRestore: (text: string, section: string, action: string) => void;
}

const SECTION_LABELS: Record<string, string> = {
  professionalSummary: 'Professional Summary',
  workExperience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  volunteerExperience: 'Volunteer',
  references: 'References',
  additionalInfo: 'Additional Info',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffS = Math.floor(diffMs / 1000);
  if (diffS < 60) return `${diffS}s ago`;
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function AiHistoryPanel({ resumeId, onRestore }: AiHistoryPanelProps) {
  const [history, setHistory] = useState<Array<{
    id: string;
    section: string;
    action: string;
    result: string;
    original_text: string;
    is_applied: boolean;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded || !resumeId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/resumes/${resumeId}/ai-history`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.success) setHistory(data.history);
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [expanded, resumeId]);

  const handleRestore = useCallback(async (historyId: string, result: string, section: string, action: string) => {
    await fetch(`/api/resumes/${resumeId}/ai-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ historyId }),
    });
    onRestore(result, section, action);
  }, [resumeId, onRestore]);

  const handleClear = useCallback(async () => {
    await fetch(`/api/resumes/${resumeId}/ai-history`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setHistory([]);
  }, [resumeId]);

  return (
    <>
      {/* Collapsed toggle button */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-4 z-30"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(true)}
              className="relative gap-2 rounded-full shadow-md bg-background/90 backdrop-blur-sm border-border/60 hover:bg-accent/80"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">AI History</span>
              {history.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 text-[10px] font-semibold flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  {history.length}
                </Badge>
              )}
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-4 left-4 top-4 z-30 w-80 rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold font-heading">
                  AI History
                </h2>
                {history.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold rounded-full">
                    {history.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(false)}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {loading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center justify-between pt-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-7 w-16 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted/50 p-3 mb-3">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground font-body">
                      No AI suggestions yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1 font-body">
                      Use the AI assist panel to generate content
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                        className="group rounded-lg border border-border/40 p-3 hover:border-border/80 hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground border-border/60 shrink-0"
                          >
                            {SECTION_LABELS[item.section] ?? item.section}
                          </Badge>
                          <span className="text-xs font-medium text-foreground/80 font-body">
                            {item.action}
                          </span>
                          {item.is_applied && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-5 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                            >
                              <Check className="h-2.5 w-2.5 mr-0.5" />
                              Applied
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground font-body line-clamp-2 leading-relaxed mb-2">
                          {item.result}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(item.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(item.id, item.result, item.section, item.action)}
                            className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}