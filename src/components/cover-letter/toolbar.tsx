'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  FileDown,
  Printer,
  Maximize2,
  Globe,
  Palette,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  Wand2,
  LayoutTemplate,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COVER_LETTER_TEMPLATES } from '@/lib/cover-letter/template-registry';
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/types/cover-letter';
import type { CoverLetterTemplateId, ToneType, AutosaveStatus } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';
import { useCoverLetterOptionLabels } from './ai-generate-dialog';

interface ToolbarProps {
  title: string;
  templateId: CoverLetterTemplateId;
  language: string;
  tone: ToneType;
  letterId: string | null;
  autosaveStatus: AutosaveStatus;
  onTitleChange: (title: string) => void;
  onTemplateChange: (id: CoverLetterTemplateId) => void;
  onLanguageChange: (lang: string) => void;
  onToneChange: (tone: ToneType) => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onPrint: () => void;
  onFullscreen: () => void;
  onCopyAll: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerateAI: () => void;
}

export function Toolbar({
  title,
  templateId,
  language,
  tone,
  letterId,
  autosaveStatus,
  onTitleChange,
  onTemplateChange,
  onLanguageChange,
  onToneChange,
  onExportPDF,
  onExportDOCX,
  onPrint,
  onFullscreen,
  onCopyAll,
  onDelete,
  onDuplicate,
  onGenerateAI,
}: ToolbarProps) {
  const t = useTranslations('app.coverLetterEditor');
  const tc = useTranslations('app.common');
  const labels = useCoverLetterOptionLabels();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const handleStartRename = () => {
    setTitleInput(title);
    setEditingTitle(true);
  };

  const handleFinishRename = () => {
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
    setEditingTitle(false);
  };

  const currentTemplateName = COVER_LETTER_TEMPLATES.find(tpl => tpl.id === templateId)?.name;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/50">
        {/* Main Toolbar Row — overflow-hidden prevents buttons from leaking out */}
        <div className="flex items-center h-12 px-2 sm:px-3 gap-0.5 overflow-hidden">
          {/* Left: Document Name */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0 mr-1 sm:mr-2">
            <FileText className="w-4 h-4 text-brand shrink-0" />
            {editingTitle ? (
              <div className="flex items-center gap-1">
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
                  className="h-7 text-sm font-heading w-36 sm:w-48 bg-muted/50"
                  autoFocus
                  onBlur={handleFinishRename}
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleFinishRename}>
                  <Check className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTitle(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={handleStartRename}
                className="text-sm font-heading font-semibold truncate max-w-[120px] sm:max-w-[160px] hover:text-brand transition-colors text-left"
              >
                {title || tc('untitledCoverLetter')}
              </button>
            )}
          </div>

          {/* Template Selector — desktop only (≥1024px), otherwise in dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <Select value={templateId} onValueChange={(v) => onTemplateChange(v as CoverLetterTemplateId)}>
              <SelectTrigger className="h-7 text-xs w-[150px] bg-muted/30 border-transparent hover:border-border/50 transition-colors">
                <LayoutTemplate className="w-3 h-3 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COVER_LETTER_TEMPLATES.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>{labels.template(tpl.name)}</span>
                      {tpl.tier === 'pro' && (
                        <Badge className="text-[8px] px-1 py-0 h-3 bg-violet-100 text-violet-700">{tc('pro')}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5 lg:mx-1 shrink-0" />

          {/* Language & Tone — large desktop only (≥1280px) */}
          <div className="hidden xl:flex items-center gap-1.5">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-7 text-xs w-[120px] bg-muted/30 border-transparent hover:border-border/50 transition-colors">
                <Globe className="w-3 h-3 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">{labels.language(l.value, l.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tone} onValueChange={(v) => onToneChange(v as ToneType)}>
              <SelectTrigger className="h-7 text-xs w-[140px] bg-muted/30 border-transparent hover:border-border/50 transition-colors">
                <Palette className="w-3 h-3 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{labels.tone(o.value, o.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flexible spacer — takes up remaining space */}
          <div className="flex-1 min-w-0" />

          {/* Right Actions — always visible, shrink-0 to prevent compression */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* AI Generate — always visible */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-brand hover:text-brand hover:bg-brand/10"
                  onClick={onGenerateAI}
                >
                  <Wand2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('generateWithAI')}</span></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-0.5 shrink-0" />

            {/* Autosave indicator — hide on very small screens */}
            <div className="hidden sm:flex items-center gap-1 px-1.5 min-w-0">
              <AnimatePresence mode="wait">
                {autosaveStatus === 'saving' && (
                  <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-brand shrink-0" />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">{t('autosaveSaving')}</span>
                  </motion.div>
                )}
                {autosaveStatus === 'saved' && (
                  <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">{tc('saved')}</span>
                  </motion.div>
                )}
                {autosaveStatus === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                    <span className="text-[10px] sm:text-[11px] text-destructive whitespace-nowrap">{t('autosaveError')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export PDF — visible sm+ (≥640px) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex" onClick={onExportPDF}>
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('exportPdf')}</span></TooltipContent>
            </Tooltip>

            {/* Export DOCX — visible lg+ (≥1024px) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:inline-flex" onClick={onExportDOCX}>
                  <FileDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('exportDocx')}</span></TooltipContent>
            </Tooltip>

            {/* Print — visible lg+ (≥1024px) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:inline-flex" onClick={onPrint}>
                  <Printer className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('print')}</span></TooltipContent>
            </Tooltip>

            {/* Fullscreen — visible xl+ (≥1280px) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden xl:inline-flex" onClick={onFullscreen}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('fullscreenPreview')}</span></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-0.5 shrink-0" />

            {/* More Actions dropdown — always visible, contains hidden items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Template — show in dropdown on tablet (below lg) */}
                <DropdownMenuItem className="text-xs gap-2 lg:hidden" onClick={() => {}}>
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>{t('templateCurrent', { name: currentTemplateName ? labels.template(currentTemplateName) : t('templateDefault') })}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="lg:hidden" />

                {/* Export PDF — show in dropdown on mobile (below sm) */}
                <DropdownMenuItem className="text-xs gap-2 sm:hidden" onClick={onExportPDF}>
                  <Download className="w-3.5 h-3.5" /> {t('exportPdf')}
                </DropdownMenuItem>
                {/* Export DOCX — show in dropdown below lg */}
                <DropdownMenuItem className="text-xs gap-2 lg:hidden" onClick={onExportDOCX}>
                  <FileDown className="w-3.5 h-3.5" /> {t('exportDocx')}
                </DropdownMenuItem>
                {/* Print — show in dropdown below lg */}
                <DropdownMenuItem className="text-xs gap-2 lg:hidden" onClick={onPrint}>
                  <Printer className="w-3.5 h-3.5" /> {t('print')}
                </DropdownMenuItem>
                {/* Fullscreen — show in dropdown below xl */}
                <DropdownMenuItem className="text-xs gap-2 xl:hidden" onClick={onFullscreen}>
                  <Maximize2 className="w-3.5 h-3.5" /> {t('fullscreen')}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuItem className="text-xs gap-2" onClick={onCopyAll}>
                  <Copy className="w-3.5 h-3.5" /> {t('copyAllText')}
                </DropdownMenuItem>
                {letterId && (
                  <DropdownMenuItem className="text-xs gap-2" onClick={onDuplicate}>
                    <FileText className="w-3.5 h-3.5" /> {tc('duplicate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {letterId && (
                  <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive" onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5" /> {tc('delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
