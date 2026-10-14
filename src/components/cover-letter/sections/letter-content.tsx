'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageSquare,
  Wand2,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { SectionCard, AIActionButton } from './section-card';
import { PenLine } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CoverLetterData, AIEditAction } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';

interface LetterContentSectionProps {
  data: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
  letterId: string | null;
  onAIEdit: (section: string, action: AIEditAction) => void;
  aiLoading: boolean;
  loadingSection: string | null;
}

const CONTENT_FIELDS = [
  { key: 'salutation', labelKey: 'fieldSalutation', placeholderKey: 'fieldSalutationPlaceholder', rows: 1, aiEnabled: false },
  { key: 'opening', labelKey: 'fieldOpening', placeholderKey: 'fieldOpeningPlaceholder', rows: 4, aiEnabled: true },
  { key: 'body', labelKey: 'fieldBody', placeholderKey: 'fieldBodyPlaceholder', rows: 6, aiEnabled: true },
  { key: 'closing', labelKey: 'fieldClosing', placeholderKey: 'fieldClosingPlaceholder', rows: 4, aiEnabled: true },
  { key: 'signOff', labelKey: 'fieldSignOff', placeholderKey: 'fieldSignOffPlaceholder', rows: 1, aiEnabled: false },
] as const;

const AI_ACTIONS: { action: AIEditAction; labelKey: string; icon: React.ElementType }[] = [
  { action: 'rewrite', labelKey: 'aiRewrite', icon: Sparkles },
  { action: 'expand', labelKey: 'aiExpand', icon: ChevronDown },
  { action: 'shorten', labelKey: 'aiShorten', icon: ChevronUp },
  { action: 'improve_grammar', labelKey: 'aiFixGrammar', icon: CheckCircle2 },
  { action: 'improve_tone', labelKey: 'aiBetterTone', icon: MessageSquare },
  { action: 'regenerate_section', labelKey: 'aiRegenerate', icon: Wand2 },
];

export function LetterContentSection({
  data,
  onChange,
  letterId,
  onAIEdit,
  aiLoading,
  loadingSection,
}: LetterContentSectionProps) {
  const t = useTranslations('app.coverLetterEditor');
  const [expandedField, setExpandedField] = useState<string | null>('opening');
  const aiActions = AI_ACTIONS.map(({ action, labelKey, icon }) => ({ action, label: t(labelKey), icon }));

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <SectionCard
      icon={<PenLine className="w-4 h-4" />}
      title={t('letterContentTitle')}
      description={t('letterContentDescription')}
      defaultOpen={true}
      aiActions={aiActions}
      onAIAction={(action) => {
        // Apply to the currently expanded content field that supports AI
        const targetField = expandedField && CONTENT_FIELDS.find(f => f.key === expandedField && f.aiEnabled);
        if (targetField) {
          onAIEdit(targetField.key, action);
        }
      }}
      aiLoading={aiLoading}
      loadingSection={loadingSection}
    >
      <div className="space-y-4">
        {CONTENT_FIELDS.map(({ key, labelKey, placeholderKey, rows, aiEnabled }) => {
          const value = data[key as keyof CoverLetterData] as string;
          const isExpanded = expandedField === key;

          return (
            <motion.div
              key={key}
              layout
              className={`rounded-lg border transition-all duration-200 ${
                isExpanded
                  ? 'border-brand/30 bg-brand/3 shadow-sm'
                  : 'border-border/30 bg-muted/20'
              }`}
            >
              {/* Field Header */}
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer"
                onClick={() => setExpandedField(isExpanded ? null : key)}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </motion.div>
                  <Label className="text-xs font-medium cursor-pointer">{t(labelKey)}</Label>
                </div>
                <div className="flex items-center gap-2">
                  {value && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal">
                      {t('wordsCount', { count: getWordCount(value) })}
                    </Badge>
                  )}
                  {/* Per-field AI actions */}
                  {aiEnabled && letterId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-brand hover:text-brand hover:bg-brand/10"
                          onClick={(e) => e.stopPropagation()}
                          disabled={aiLoading}
                        >
                          <Sparkles className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {aiActions.map(({ action, label: al, icon: Icon }) => (
                          <DropdownMenuItem
                            key={action}
                            className="text-xs gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAIEdit(key, action);
                            }}
                            disabled={aiLoading}
                          >
                            <Icon className="w-3 h-3 text-brand" />
                            <span>{al}</span>
                            {aiLoading && loadingSection === key && (
                              <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Field Content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-3 pb-3">
                    <Textarea
                      value={value}
                      onChange={(e) => onChange({ [key]: e.target.value })}
                      placeholder={t(placeholderKey)}
                      className="text-sm bg-background border-border/40 focus:border-brand/50 transition-colors resize-y"
                      rows={rows}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}
