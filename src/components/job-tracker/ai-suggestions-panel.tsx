'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb, FileText, BookOpen, Clock, TrendingUp, Loader2, RefreshCw,
} from 'lucide-react';
import type { AiSuggestion } from '@/hooks/use-job-tracker';
import { useTranslations, useLocale } from '@/i18n/provider';

interface AiSuggestionsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
  applicationTitle: string;
  companyName: string;
  existingSuggestions: AiSuggestion[];
  generateSuggestions: (id: string, types?: string[]) => Promise<AiSuggestion[] | null>;
}

const SUGGESTION_CONFIG: Record<string, { labelKey: string; icon: typeof Lightbulb; color: string }> = {
  interview_tips: { labelKey: 'tipInterview', icon: Lightbulb, color: 'text-amber-600' },
  resume_improvements: { labelKey: 'tipResume', icon: FileText, color: 'text-blue-600' },
  cover_letter_tips: { labelKey: 'tipCoverLetter', icon: BookOpen, color: 'text-violet-600' },
  follow_up_advice: { labelKey: 'tipFollowUp', icon: Clock, color: 'text-emerald-600' },
  negotiation_tips: { labelKey: 'tipNegotiation', icon: TrendingUp, color: 'text-orange-600' },
};

export function AiSuggestionsPanel({
  open, onOpenChange, applicationId, applicationTitle, companyName,
  existingSuggestions, generateSuggestions,
}: AiSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>(existingSuggestions);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('dashboard.jobTracker');
  const { locale } = useLocale();

  const handleGenerate = useCallback(async (types?: string[]) => {
    if (!applicationId) return;
    setLoading(true);
    const result = await generateSuggestions(applicationId, types);
    if (result) {
      setSuggestions(prev => [...prev, ...result].slice(-20));
    }
    setLoading(false);
  }, [applicationId, generateSuggestions]);

  // Refresh suggestions from existing when panel opens
  const isOpen = open;
  const refreshFromExisting = useCallback(() => {
    setSuggestions(existingSuggestions);
  }, [existingSuggestions]);

  // Reset when opening
  if (isOpen && suggestions !== existingSuggestions && existingSuggestions.length > 0) {
    refreshFromExisting();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand" />
            {t('aiSuggestions')}
          </SheetTitle>
          <p className="text-xs text-muted-foreground font-body">
            {companyName} — {applicationTitle}
          </p>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Generate Buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUGGESTION_CONFIG).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="text-xs font-body gap-1.5 h-8"
                  onClick={() => handleGenerate([type])}
                  disabled={loading}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  {t(config.labelKey)}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs font-body gap-1.5 h-8 w-full"
            onClick={() => handleGenerate()}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {t('generateAll')}
          </Button>

          {/* Suggestions List */}
          <ScrollArea className="max-h-[calc(100vh-300px)]">
            <div className="space-y-3 pr-1">
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardContent className="p-3 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {suggestions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-body">{t('noSuggestions')}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {t('noSuggestionsHint')}
                  </p>
                </div>
              )}

              {[...suggestions].reverse().map(suggestion => {
                const config = SUGGESTION_CONFIG[suggestion.type];
                const Icon = config?.icon || Lightbulb;
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {config && <Icon className={`w-3.5 h-3.5 ${config.color}`} />}
                          <span className="text-xs font-medium font-heading">
                            {config ? t(config.labelKey) : suggestion.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto font-body">
                            {new Date(suggestion.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 font-body whitespace-pre-wrap leading-relaxed">
                          {suggestion.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
