'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  PenLine,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useCoverLetter } from '@/hooks/use-cover-letter';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import { exportToPDF } from '@/lib/export/pdf';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { ProBadge } from '@/components/billing/pro-badge';
import { useUsage } from '@/lib/usage/context';
import { Toolbar } from './toolbar';
import { PreviewPanel } from './preview-panel';
import { StatusBar } from './status-bar';
import { StepNav, STEPS } from './step-nav';
import { AIGenerateDialog } from './ai-generate-dialog';
import { SenderInfoSection } from './sections/sender-info';
import { RecipientInfoSection } from './sections/recipient-info';
import { JobDetailsSection } from './sections/job-details';
import { LetterContentSection } from './sections/letter-content';
import { CustomizationSection } from './sections/customization-section';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AIEditAction, ToneType } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';

// ─── Animation Variants ──────────────────────────────────────

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: 12, transition: { duration: 0.2, ease: 'easeIn' } },
};

// ─── Main Workspace Component ────────────────────────────────

export default function CoverLetterWorkspace() {
  const { user } = useAuth();
  const t = useTranslations('app.coverLetterEditor');
  const tc = useTranslations('app.common');
  // Pro-only parts of the editor (shown with a Pro badge on Free)
  const { data: plan } = useUsage();
  const isLocked = (key: string) => plan?.usage[key]?.enabled === false;
  const aiLocked = isLocked('AI_COVER_LETTER');
  const docxLocked = isLocked('DOCX_EXPORT');
  const openGenerator = () => (aiLocked ? setShowUpgrade(true) : setShowGeneratorDialog(true));
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
  // Compact = mobile or tablet portrait — use tab-switching layout
  const isCompact = isMobile || isTablet;
  const {
    data, letterId, title, templateId, customization,
    setData, setTitle, setTemplateId, setCustomization,
    loading, error, autosaveStatus, saveNow,
    createLetter, deleteLetter, duplicateLetter,
    generateWithAI, aiEdit,
  } = useCoverLetter();

  // UI State
  const [activeStep, setActiveStep] = useState(3); // Start at AI Generate
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  // Default to 'editor' on compact screens so users see content (not tiny preview)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-create blank letter if none exists
  const [hasAutoCreated, setHasAutoCreated] = useState(false);
  useEffect(() => {
    if (!loading && !letterId && !hasAutoCreated) {
      createLetter().then(() => setHasAutoCreated(true));
    }
  }, [loading, letterId, hasAutoCreated, createLetter]);

  // Handle limit reached (sync check after render instead of effect)
  if (error === 'limit_reached' && !showUpgrade) {
    setShowUpgrade(true);
  }

  // ─── Handlers ──────────────────────────────────────────

  const handleAIEdit = async (section: string, action: AIEditAction) => {
    const text = data[section as keyof typeof data] as string;
    if (!text || !letterId) return;
    if (aiLocked) { setShowUpgrade(true); return; }

    setAiActionLoading(true);
    setLoadingSection(section);
    const result = await aiEdit({
      action,
      section,
      text,
      tone: data.tone,
      language: data.language,
    });
    setAiActionLoading(false);
    setLoadingSection(null);

    if (result.success) {
      toast.success(t('sectionUpdated'));
    } else {
      if (result.error === 'limit_reached' || result.error === 'upgrade_required') setShowUpgrade(true);
      else toast.error(result.error || t('aiEditFailed'));
    }
  };

  const handleGenerate = async (params: Parameters<typeof generateWithAI>[0]) => {
    let id = letterId;
    if (!id) {
      id = await createLetter({ title: t('defaultLetterTitle', { jobTitle: params.jobTitle, companyName: params.companyName }) });
      if (!id) {
        if (error === 'limit_reached') { setShowUpgrade(true); return; }
        return;
      }
    }

    const result = await generateWithAI(params);
    if (result.success) {
      toast.success(t('letterGenerated'));
      setShowGeneratorDialog(false);
      setActiveStep(4); // Move to Letter Content
    } else {
      if (result.error === 'limit_reached' || result.error === 'upgrade_required') setShowUpgrade(true);
      else toast.error(result.error || t('generationFailed'));
    }
  };

  const handleExportPDF = useCallback(async () => {
    if (!letterId || !previewRef.current) return;
    try {
      await exportToPDF({
        element: previewRef.current,
        filename: `cover-letter-${(data.companyName || 'draft').toLowerCase().replace(/\s+/g, '-')}.pdf`,
      });
      toast.success(t('pdfExported'));
    } catch {
      toast.error(t('pdfExportFailed'));
    }
  }, [letterId, data.companyName, t]);

  const handleExportDOCX = useCallback(async () => {
    if (!letterId) return;
    if (docxLocked) { setShowUpgrade(true); return; }
    try {
      const res = await fetch(`/api/cover-letters/${letterId}/export-docx`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json();
        if (json.error === 'limit_reached' || json.error === 'upgrade_required') { setShowUpgrade(true); return; }
        toast.error(t('exportFailed'));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter-${(data.companyName || 'draft').toLowerCase().replace(/\s+/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('docxExported'));
    } catch {
      toast.error(t('docxExportFailed'));
    }
  }, [letterId, data.companyName, t, docxLocked, setShowUpgrade]);

  const handlePrint = useCallback(() => {
    if (!previewRef.current) return;
    const clone = previewRef.current.firstElementChild?.cloneNode(true) as HTMLElement;
    if (!clone) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${t('printWindowTitle')}</title>
      <style>body{margin:0;display:flex;justify-content:center;}</style>
      </head><body></body></html>
    `);
    printWindow.document.body.appendChild(clone);
    printWindow.document.close();
    printWindow.print();
  }, [t]);

  const handleCopyAll = useCallback(() => {
    const { salutation, opening, body, closing, signOff, fullName } = data;
    const text = [salutation, '', opening, '', body, '', closing, '', signOff, '', fullName].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text)
      .then(() => toast.success(t('copiedToClipboard')))
      .catch(() => toast.error(t('copyFailed')));
  }, [data, t]);

  const handleDelete = async () => {
    if (!letterId) return;
    await deleteLetter(letterId);
    setDeleteDialogOpen(false);
    toast.success(t('letterDeleted'));
  };

  const handleFullscreen = useCallback(() => {
    const el = document.querySelector('[data-preview-area]');
    if (el) el.requestFullscreen?.();
  }, []);

  // ─── Step-based Editor Content ────────────────────────

  const renderEditorContent = () => {
    const currentStep = STEPS[activeStep];
    if (!currentStep) return null;

    switch (currentStep.key) {
      case 'sender-info':
        return (
          <motion.div key="sender" variants={slideIn} initial="hidden" animate="visible" exit="exit">
            <SenderInfoSection data={data} onChange={(patch) => setData((p) => ({ ...p, ...patch }))} />
          </motion.div>
        );
      case 'recipient-info':
        return (
          <motion.div key="recipient" variants={slideIn} initial="hidden" animate="visible" exit="exit">
            <RecipientInfoSection data={data} onChange={(patch) => setData((p) => ({ ...p, ...patch }))} />
          </motion.div>
        );
      case 'job-details':
        return (
          <motion.div key="job" variants={slideIn} initial="hidden" animate="visible" exit="exit">
            <JobDetailsSection data={data} onChange={(patch) => setData((p) => ({ ...p, ...patch }))} />
          </motion.div>
        );
      case 'ai-generate':
        return (
          <motion.div key="ai" variants={fadeIn} initial="hidden" animate="visible">
            <AIPlaceholder onStartGenerate={openGenerator} locked={aiLocked} />
          </motion.div>
        );
      case 'content':
        return (
          <motion.div key="content" variants={slideIn} initial="hidden" animate="visible" exit="exit">
            <LetterContentSection
              data={data}
              onChange={(patch) => setData((p) => ({ ...p, ...patch }))}
              letterId={letterId}
              onAIEdit={handleAIEdit}
              aiLoading={aiActionLoading}
              loadingSection={loadingSection}
            />
          </motion.div>
        );
      case 'customization':
        return (
          <motion.div key="custom" variants={slideIn} initial="hidden" animate="visible" exit="exit">
            <CustomizationSection
              customization={customization}
              templateId={templateId}
              onChange={(patch) => setCustomization({ ...customization, ...patch })}
              onTemplateChange={setTemplateId}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // ─── Loading State ────────────────────────────────────

  if (loading) {
    return (
      <div className="h-[calc(100vh-96px)] md:h-[calc(100vh-112px)] lg:h-[calc(100vh-128px)] flex flex-col">
        <Skeleton className="h-14 w-full" />
        <div className="flex-1 flex gap-0">
          <Skeleton className="w-[42%] hidden lg:block" />
          <Skeleton className="flex-1" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  // ─── Compact Layout (Mobile + Tablet Portrait <1024px) ──
  // Uses tab-switching between Editor and Preview to avoid cramped split view

  if (isCompact) {
    return (
      <div className="h-[calc(100dvh-96px)] md:h-[calc(100dvh-112px)] flex flex-col overflow-x-hidden">
        {/* Toolbar (compact) */}
        <Toolbar
          title={title}
          templateId={templateId}
          language={data.language}
          tone={data.tone}
          letterId={letterId}
          autosaveStatus={autosaveStatus}
          onTitleChange={setTitle}
          onTemplateChange={setTemplateId}
          onLanguageChange={(v) => setData((p) => ({ ...p, language: v as 'en' | 'fr' }))}
          onToneChange={(v) => setData((p) => ({ ...p, tone: v as ToneType }))}
          onExportPDF={handleExportPDF}
          onExportDOCX={handleExportDOCX}
          onPrint={handlePrint}
          onFullscreen={handleFullscreen}
          onCopyAll={handleCopyAll}
          onDelete={() => setDeleteDialogOpen(true)}
          onDuplicate={letterId ? () => duplicateLetter(letterId) : () => {}}
          onGenerateAI={openGenerator}
          aiLocked={aiLocked}
          docxLocked={docxLocked}
        />

        {/* Mobile Tab Switcher */}
        <div className="flex border-b border-border/50 bg-background shrink-0">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mobileView === 'editor' ? 'text-brand border-b-2 border-brand' : 'text-muted-foreground'
            }`}
          >
            {t('editorTab')}
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mobileView === 'preview' ? 'text-brand border-b-2 border-brand' : 'text-muted-foreground'
            }`}
          >
            {tc('preview')}
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {mobileView === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="px-3 py-3 shrink-0">
                  <StepNav activeStep={activeStep} onStepChange={setActiveStep} isMobile />
                </div>
                <ScrollArea className="flex-1 min-h-0 px-3 pb-4">
                  {renderEditorContent()}
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PreviewPanel
                  data={data}
                  customization={customization}
                  templateId={templateId}
                  previewRef={previewRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <StatusBar data={data} />

        {/* Dialogs */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteDialogTitle')}</DialogTitle>
              <DialogDescription>{t('deleteDialogDescriptionShort')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{tc('cancel')}</Button>
              <Button variant="destructive" onClick={handleDelete}>{tc('delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AIGenerateDialog
          open={showGeneratorDialog}
          onOpenChange={setShowGeneratorDialog}
          onGenerate={handleGenerate}
          isGenerating={false}
        />

        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </div>
    );
  }

  // ─── Desktop Layout (>=1024px) ─────────────────────────
  // Side-by-side editor + preview split

  return (
    <div className="h-[calc(100vh-128px)] flex flex-col overflow-x-hidden">
      {/* Top Toolbar */}
      <Toolbar
        title={title}
        templateId={templateId}
        language={data.language}
        tone={data.tone}
        letterId={letterId}
        autosaveStatus={autosaveStatus}
        onTitleChange={setTitle}
        onTemplateChange={setTemplateId}
        onLanguageChange={(v) => setData((p) => ({ ...p, language: v as 'en' | 'fr' }))}
        onToneChange={(v) => setData((p) => ({ ...p, tone: v as ToneType }))}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onPrint={handlePrint}
        onFullscreen={handleFullscreen}
        onCopyAll={handleCopyAll}
        onDelete={() => setDeleteDialogOpen(true)}
        onDuplicate={letterId ? () => duplicateLetter(letterId) : () => {}}
        onGenerateAI={openGenerator}
        aiLocked={aiLocked}
        docxLocked={docxLocked}
      />

      {/* Step Navigation */}
      <div className="border-b border-border/30 bg-background/50 px-4 py-2.5">
        <StepNav activeStep={activeStep} onStepChange={setActiveStep} />
      </div>

      {/* Main Content: Editor + Preview Split */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Editor Panel (42%) */}
        <div className="w-[42%] shrink-0 border-r border-border/30 flex flex-col min-h-0 bg-background/30">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-4">
              <AnimatePresence mode="wait">
                {renderEditorContent()}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Preview Panel (58%) */}
        <PreviewPanel
          data={data}
          customization={customization}
          templateId={templateId}
          previewRef={previewRef}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar data={data} />

      {/* Dialogs */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialogTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDialogDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{tc('cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{tc('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIGenerateDialog
        open={showGeneratorDialog}
        onOpenChange={setShowGeneratorDialog}
        onGenerate={handleGenerate}
        isGenerating={false}
      />

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}

// ─── AI Generate Placeholder (Step 3) ─────────────────────

function AIPlaceholder({ onStartGenerate, locked }: { onStartGenerate: () => void; locked?: boolean }) {
  const t = useTranslations('app.coverLetterEditor');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg shadow-brand/20 mb-4 sm:mb-5">
        <PenLine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      <h3 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-2 text-center">
        {t('placeholderTitle')}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs sm:max-w-sm mb-5 sm:mb-6 leading-relaxed">
        {t('placeholderDescription')}
      </p>
      {/* CTA Button — always visible above the fold */}
      <button
        onClick={onStartGenerate}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-medium text-sm shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:bg-brand/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <PenLine className="w-4 h-4" />
        {t('startGenerating')}
        {locked && <ProBadge className="bg-white/20 text-white" />}
      </button>
      {/* Feature highlights — only on large screens, below the button */}
      <div className="hidden lg:grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
        {[
          { label: t('featureAtsLabel'), desc: t('featureAtsDesc') },
          { label: t('featureProfessionalLabel'), desc: t('featureProfessionalDesc') },
          { label: t('featureCustomizableLabel'), desc: t('featureCustomizableDesc') },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-xs font-medium text-foreground">{item.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
