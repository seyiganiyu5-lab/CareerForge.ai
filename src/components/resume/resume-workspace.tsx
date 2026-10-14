'use client';

import { useState, useEffect, useRef, useCallback, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  MoreVertical,
  PencilLine,
  Copy,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenLine,
  Download,
  FileDown,
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Globe,
  Trophy,
  Heart,
  Users,
  FileText,
  LayoutTemplate,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-breakpoints';
import { useResume } from '@/hooks/use-resume';
import { SECTIONS, type SectionKey, type AutosaveStatus } from '@/types/resume';
import { type TemplateId } from '@/types/template';
import { isTemplateFree } from '@/lib/templates/registry';
import { exportToPDF } from '@/lib/export/pdf';
import { ResumeSidebar } from './resume-sidebar';
import { SectionEditor } from './section-editor';
import { TemplateEngine } from './template-engine';
import { PreviewContainer } from './preview-container';
import { TemplateGallery } from './template-gallery';
import { CustomizationPanel } from './customization-panel';
import { ResumeEmptyState } from './resume-empty-state';
import { AiAssistPanel } from '@/components/ai/ai-assist-panel';
import { AiHistoryPanel } from '@/components/ai/ai-history-panel';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslations } from '@/i18n/provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// ─── Icon Map ─────────────────────────────────────────────────

const SIDEBAR_ICON_MAP: Record<string, ElementType> = {
  User, AlignLeft, Briefcase, GraduationCap, Wrench, FolderGit2,
  Award, Globe, Trophy, Heart, Users, FileText,
};

// ─── Error Keys ───────────────────────────────────────────────

const ERROR_KEYS: Record<string, string> = {
  load_failed: 'errorLoadFailed',
  network_error: 'errorNetwork',
  create_failed: 'errorCreateFailed',
};

// ─── Tablet Detection ─────────────────────────────────────────

// Below this width the live preview moves into a sheet, so the form keeps enough room
const TABLET_BREAKPOINT = 1280;

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: 768px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const update = () => setIsTablet(mql.matches);
    mql.addEventListener('change', update);
    update();
    return () => mql.removeEventListener('change', update);
  }, []);
  return isTablet;
}

// ─── Autosave Indicator ─────────────────────────────────────────

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  if (status === 'idle') return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="inline-flex items-center gap-1.5 text-xs font-body"
      >
        {status === 'saving' && (
          <>
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">{tc('saving')}</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">{tc('saved')}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="size-3 text-destructive" />
            <span className="text-destructive">{t('saveFailed')}</span>
          </>
        )}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Resume Header ──────────────────────────────────────────────

interface ResumeHeaderProps {
  title: string;
  templateName: string;
  onRename: (title: string) => void;
  autosaveStatus: AutosaveStatus;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePreview?: () => void;
  onOpenGallery: () => void;
  onOpenCustomization: () => void;
  onDownload?: () => void;
  downloading?: boolean;
  onDownloadDocx?: () => void;
  downloadingDocx?: boolean;
  isProUser?: boolean;
  showPreviewButton?: boolean;
}

function ResumeHeader({
  title, templateName, onRename, autosaveStatus, onDuplicate, onDelete,
  onTogglePreview, onOpenGallery, onOpenCustomization, onDownload, downloading,
  onDownloadDocx, downloadingDocx, isProUser, showPreviewButton,
}: ResumeHeaderProps) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditValue(title); }, [title]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    else setEditValue(title);
    setEditing(false);
  };

  return (
    <div className="@container flex h-12 items-center gap-2 border-b border-border/50 px-4 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {editing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') { setEditValue(title); setEditing(false); }
            }}
            className="h-8 max-w-[260px] text-sm font-heading font-semibold"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 min-w-0 group"
            aria-label={t('editTitleAria')}
          >
            <span className="font-heading text-sm font-semibold text-foreground truncate">
              {title || tc('untitledResume')}
            </span>
            <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Template name badge */}
      <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-body h-6 px-2 shrink-0">
        {templateName}
      </Badge>

      <AutosaveIndicator status={autosaveStatus} />

      {/* Template gallery button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenGallery}
        title={t('templates')}
        className="hidden md:inline-flex items-center gap-1.5 text-muted-foreground h-8"
      >
        <LayoutTemplate className="size-3.5" />
        <span className="hidden @4xl:inline font-body text-xs">{t('templates')}</span>
      </Button>

      {/* Customize button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenCustomization}
        title={t('customize')}
        className="hidden md:inline-flex items-center gap-1.5 text-muted-foreground h-8"
      >
        <Settings2 className="size-3.5" />
        <span className="hidden @4xl:inline font-body text-xs">{t('customize')}</span>
      </Button>

      {/* Preview button (tablet) */}
      {showPreviewButton && onTogglePreview && (
        <Button variant="ghost" size="sm" onClick={onTogglePreview} title={tc('preview')} className="flex items-center gap-1.5 text-muted-foreground h-8">
          <Eye className="size-4" />
          <span className="hidden @4xl:inline font-body text-xs">{tc('preview')}</span>
        </Button>
      )}

      {/* Download DOCX button (Pro only) */}
      {onDownloadDocx && isProUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownloadDocx}
          disabled={downloadingDocx}
          className="hidden sm:inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 h-8 font-body text-xs"
        >
          {downloadingDocx ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileDown className="size-3.5" />
          )}
          {downloadingDocx ? t('exporting') : 'DOCX'}
        </Button>
      )}
      {/* Download PDF button */}
      {onDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          disabled={downloading}
          className="hidden sm:inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 h-8 font-body text-xs"
        >
          {downloading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          {downloading ? t('exporting') : (
            <>
              <span className="@4xl:hidden">PDF</span>
              <span className="hidden @4xl:inline">{t('downloadPdf')}</span>
            </>
          )}
        </Button>
      )}

      {/* Management menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
            <span className="sr-only">{t('resumeActions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <PencilLine className="size-4" /> {t('rename')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenGallery}>
            <LayoutTemplate className="size-4" /> {t('changeTemplate')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenCustomization}>
            <Settings2 className="size-4" /> {t('customizeDesign')}
          </DropdownMenuItem>
          {onDownload && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDownload} disabled={downloading}>
                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {downloading ? t('exporting') : t('downloadPdf')}
              </DropdownMenuItem>
            </>
          )}
          {onDownloadDocx && isProUser && (
            <DropdownMenuItem onClick={onDownloadDocx} disabled={downloadingDocx}>
              {downloadingDocx ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              {downloadingDocx ? t('exporting') : t('downloadDocx')}
              <span className="ml-auto text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">PRO</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="size-4" /> {tc('duplicate')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" /> {tc('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Mobile Tab Bar ─────────────────────────────────────────────

type MobileTab = 'editor' | 'preview' | 'templates' | 'customize';

function MobileTabBar({ activeTab, onTabChange }: { activeTab: MobileTab; onTabChange: (tab: MobileTab) => void }) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  const tabs: { key: MobileTab; icon: ElementType; label: string }[] = [
    { key: 'editor', icon: PenLine, label: t('tabEditor') },
    { key: 'preview', icon: Eye, label: tc('preview') },
    { key: 'templates', icon: LayoutTemplate, label: t('templates') },
    { key: 'customize', icon: Settings2, label: t('tabDesign') },
  ];
  return (
    <div className="flex h-14 shrink-0 border-t border-border/50 bg-card/80 backdrop-blur-sm">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === tab.key ? 'text-brand' : 'text-muted-foreground'
            }`}
          >
            <Icon className="size-4.5" />
            <span className="font-body text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Delete Dialog ──────────────────────────────────────────────

function DeleteDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void }) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t('deleteTitle')}</DialogTitle>
          <DialogDescription className="font-body">
            {t('deleteBody')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">{tc('cancel')}</Button>
          <Button variant="destructive" onClick={onConfirm} className="font-body">{tc('delete')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mobile Section Nav ─────────────────────────────────────────

function MobileSectionNav({ activeSection, onSectionChange }: { activeSection: SectionKey; onSectionChange: (s: SectionKey) => void }) {
  const t = useTranslations('app.resumeEditor');
  return (
    <div className="w-14 shrink-0 border-r border-border/50 bg-card/50 overflow-y-auto">
      <nav className="flex flex-col gap-0.5 p-1.5" aria-label={t('sectionsAria')}>
        {SECTIONS.map(section => {
          const Icon = SIDEBAR_ICON_MAP[section.icon];
          return (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={`flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                activeSection === section.key ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:bg-accent'
              }`}
              title={t(`section_${section.key}`)}
            >
              {Icon && <Icon className="size-4" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Main Workspace ─────────────────────────────────────────────

export default function ResumeWorkspace() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const {
    resumeData, resumeId, resumeTitle, templateId, customization,
    setResumeData, setResumeTitle, setTemplateId, setCustomization,
    loading, error, autosaveStatus, createResume, duplicateResume, deleteResume,
  } = useResume();

  const [activeSection, setActiveSection] = useState<SectionKey>('personalInfo');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [pdfRenderReady, setPdfRenderReady] = useState(false);
  const hiddenRenderRef = useRef<HTMLDivElement>(null);

  // AI Assistant state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPanelParams, setAiPanelParams] = useState<{ section: string; content: string; itemId?: string; field?: string } | null>(null);
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');

  // Listen for AI limit-reached events
  useEffect(() => {
    const handler = () => setUpgradeOpen(true);
    window.addEventListener('ai-limit-reached', handler);
    return () => window.removeEventListener('ai-limit-reached', handler);
  }, []);

  const handleAiAssist = useCallback((params: { section: string; content: string; itemId?: string; field?: string }) => {
    setAiPanelParams(params);
    setAiPanelOpen(true);
  }, []);

  const handleAiApply = useCallback((text: string) => {
    if (!aiPanelParams) return;
    const { section, itemId, field } = aiPanelParams;

    setResumeData(prev => {
      const next = { ...prev };
      if (section === 'professionalSummary' && !field) {
        next.professionalSummary = text;
      } else if (section === 'additionalInfo' && !field) {
        next.additionalInfo = { ...next.additionalInfo, text };
      } else if (section === 'workExperience' && itemId && field) {
        next.workExperience = next.workExperience.map(e =>
          e.id === itemId ? { ...e, [field]: text } : e
        );
      } else if (section === 'projects' && itemId && field) {
        next.projects = next.projects.map(e =>
          e.id === itemId ? { ...e, [field]: text } : e
        );
      } else if (section === 'volunteerExperience' && itemId && field) {
        next.volunteerExperience = next.volunteerExperience.map(e =>
          e.id === itemId ? { ...e, [field]: text } : e
        );
      } else if (section === 'skills') {
        // Parse skills, handling "Technical:" and "Soft:" prefixes
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const newSkills: Array<{ id: string; name: string; type?: 'technical' | 'soft' }> = [];
        let currentType: 'technical' | 'soft' = 'technical';

        for (const line of lines) {
          const techMatch = line.match(/^technical\s*:\s*(.+)/i);
          const softMatch = line.match(/^soft\s*:\s*(.+)/i);

          if (techMatch) {
            currentType = 'technical';
            const names = techMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            names.forEach(name => {
              newSkills.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name,
                type: 'technical',
              });
            });
          } else if (softMatch) {
            currentType = 'soft';
            const names = softMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            names.forEach(name => {
              newSkills.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name,
                type: 'soft',
              });
            });
          } else {
            // Fallback: comma-separated without prefix, use current type
            const names = line.split(',').map(s => s.trim()).filter(Boolean);
            names.forEach(name => {
              newSkills.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name,
                type: currentType,
              });
            });
          }
        }
        if (newSkills.length > 0) {
          next.skills = newSkills;
        }
      }
      return next;
    });
  }, [aiPanelParams, setResumeData]);

  const handleAiInsertBelow = useCallback((text: string) => {
    if (!aiPanelParams) return;
    const { section, itemId, field } = aiPanelParams;

    setResumeData(prev => {
      const next = { ...prev };
      if (section === 'professionalSummary' && !field) {
        next.professionalSummary = prev.professionalSummary ? `${prev.professionalSummary}\n\n${text}` : text;
      } else if (section === 'workExperience' && itemId && field) {
        next.workExperience = next.workExperience.map(e =>
          e.id === itemId ? { ...e, [field]: e[field as keyof typeof e] ? `${e[field as keyof typeof e]}\n${text}` : text } : e
        );
      }
      return next;
    });
  }, [aiPanelParams, setResumeData]);

  const handleAiRestore = useCallback((text: string, section: string) => {
    // Restore into the field the AI panel is open for
    if (aiPanelParams?.section === section) {
      handleAiApply(text);
    } else if (section === 'professionalSummary') {
      setResumeData(prev => ({ ...prev, professionalSummary: text }));
    }
  }, [aiPanelParams, handleAiApply, setResumeData]);

  // Check subscription status for template gating
  useEffect(() => {
    fetch('/api/usage/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setIsProUser(data.isPremium || false); })
      .catch(() => {});
  }, []);

  const templateName = (() => {
    const names: Record<string, string> = {
      'ats-classic': 'ATS Classic',
      'professional-blue': 'Professional Blue',
      'executive': 'Executive',
      'modern-minimal': 'Modern Minimal',
      'contemporary': 'Contemporary',
      'chronological': 'Chronological',
      'functional': 'Functional',
      'combination': 'Combination',
      'tech-professional': 'Tech Professional',
      'graduate': 'Graduate',
    };
    return names[templateId] || templateId;
  })();

  // Loading
  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <p className="font-body text-sm text-muted-foreground">{t('loadingResume')}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!resumeId) {
    return <ResumeEmptyState error={error} onCreateResume={createResume} />;
  }

  // Non-limit error
  if (error && error !== 'limit_reached') {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <p className="font-body text-sm text-muted-foreground">{ERROR_KEYS[error] ? t(ERROR_KEYS[error]) : error}</p>
          <Button variant="outline" onClick={createResume}>{tc('tryAgain')}</Button>
        </div>
      </div>
    );
  }

  const handleTemplateSelect = (id: TemplateId) => {
    if (!isTemplateFree(id) && !isProUser) {
      setUpgradeOpen(true);
      return;
    }
    setTemplateId(id);
  };

  const handleDownload = async () => {
    if (!resumeId) return;

    setDownloading(true);
    setPdfRenderReady(true);

    // Wait for the hidden render div to mount with current data
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    if (!hiddenRenderRef.current) {
      setDownloading(false);
      setPdfRenderReady(false);
      return;
    }

    try {
      // Check feature access
      const exportRes = await fetch(`/api/resumes/${resumeId}/export`, {
        method: 'POST',
        credentials: 'include',
      });
      const exportData = await exportRes.json();

      if (!exportRes.ok) {
        if (exportData.error === 'limit_reached') {
          setUpgradeOpen(true);
        }
        return;
      }

      // Generate PDF from hidden render
      await exportToPDF({
        element: hiddenRenderRef.current,
        filename: exportData.filename || 'resume.pdf',
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloading(false);
      setPdfRenderReady(false);
    }
  };

  const handleDuplicate = async () => { if (resumeId) await duplicateResume(resumeId); };

  const handleDownloadDocx = async () => {
    if (!resumeId) return;

    setDownloadingDocx(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/export-docx`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'limit_reached') {
          setUpgradeOpen(true);
        }
        return;
      }

      // Download the file blob
      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'resume.docx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX export failed:', err);
    } finally {
      setDownloadingDocx(false);
    }
  };
  const handleDelete = async () => { if (resumeId) { await deleteResume(resumeId); setDeleteDialogOpen(false); } };

  // Preview content (shared across layouts)
  const previewContent = (
    <TemplateEngine data={resumeData} templateId={templateId} customization={customization} />
  );

  // ─── Mobile Layout ─────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <ResumeHeader
          title={resumeTitle} templateName={templateName}
          onRename={(t) => setResumeTitle(t)}
          autosaveStatus={autosaveStatus}
          onDuplicate={handleDuplicate} onDelete={() => setDeleteDialogOpen(true)}
          onOpenGallery={() => setGalleryOpen(true)}
          onOpenCustomization={() => setCustomizationOpen(true)}
          onDownload={handleDownload} downloading={downloading}
          onDownloadDocx={handleDownloadDocx} downloadingDocx={downloadingDocx} isProUser={isProUser}
        />

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {mobileTab === 'editor' && (
              <motion.div key="editor" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex overflow-hidden">
                <MobileSectionNav activeSection={activeSection} onSectionChange={setActiveSection} />
                <div className="flex-1 overflow-hidden">
                  <SectionEditor resumeData={resumeData} setResumeData={setResumeData} activeSection={activeSection} onAiAssist={handleAiAssist} />
                </div>
              </motion.div>
            )}
            {mobileTab === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                <PreviewContainer customization={customization}>{previewContent}</PreviewContainer>
              </motion.div>
            )}
            {mobileTab === 'templates' && (
              <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 overflow-y-auto bg-card">
                <div className="p-4 space-y-3">
                  <h3 className="text-base font-semibold font-heading">{t('chooseTemplate')}</h3>
                  <p className="text-xs text-muted-foreground font-body">{t('switchTemplatesHint')}</p>
                  <Button onClick={() => { setGalleryOpen(true); }} className="w-full font-body">
                    <LayoutTemplate className="size-4 mr-2" /> {t('browseAllTemplates')}
                  </Button>
                </div>
              </motion.div>
            )}
            {mobileTab === 'customize' && (
              <motion.div key="customize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                <CustomizationPanel customization={customization} templateId={templateId} onChange={setCustomization} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />

        <TemplateGallery
          currentTemplateId={templateId} isProUser={isProUser}
          onSelect={handleTemplateSelect} onUpgradeRequest={() => setUpgradeOpen(true)}
          open={galleryOpen} onOpenChange={setGalleryOpen}
        />
        <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
        <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} onClose={() => setUpgradeOpen(false)} featureName={t('aiResumeAssistant')} />

        {/* AI Assist Panel (mobile) */}
        {aiPanelParams && resumeId && (
          <AiAssistPanel
            open={aiPanelOpen}
            onOpenChange={setAiPanelOpen}
            resumeId={resumeId}
            section={aiPanelParams.section}
            content={aiPanelParams.content}
            itemId={aiPanelParams.itemId}
            field={aiPanelParams.field}
            resumeData={resumeData as unknown as Record<string, unknown>}
            onApply={handleAiApply}
            onInsertBelow={handleAiInsertBelow}
          />
        )}

        {/* Hidden full-size render for PDF export (mobile) — only rendered during export */}
        {pdfRenderReady && (
          <div
            ref={hiddenRenderRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '794px',
              clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            {previewContent}
          </div>
        )}
      </div>
    );
  }

  // ─── Desktop / Tablet Layout ───────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left sidebar */}
      <ResumeSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        resumeTitle={resumeTitle}
        onPreviewClick={isTablet ? () => setPreviewSheetOpen(true) : undefined}
      />

      {/* Center + Right */}
      <div className="flex-1 flex flex-col min-w-0">
        <ResumeHeader
          title={resumeTitle} templateName={templateName}
          onRename={(t) => setResumeTitle(t)}
          autosaveStatus={autosaveStatus}
          onDuplicate={handleDuplicate} onDelete={() => setDeleteDialogOpen(true)}
          onTogglePreview={() => setPreviewSheetOpen(true)}
          onOpenGallery={() => setGalleryOpen(true)}
          onOpenCustomization={() => setCustomizationOpen(true)}
          onDownload={handleDownload} downloading={downloading}
          onDownloadDocx={handleDownloadDocx} downloadingDocx={downloadingDocx} isProUser={isProUser}
          showPreviewButton={isTablet}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Center editor */}
          <div className="flex-1 overflow-hidden relative" style={{ contain: 'layout style' }}>
            <SectionEditor
              resumeData={resumeData}
              setResumeData={setResumeData}
              activeSection={activeSection}
              onAiAssist={handleAiAssist}
            />
            {/* AI History Panel */}
            {resumeId && (
              <AiHistoryPanel
                resumeId={resumeId}
                onRestore={handleAiRestore}
              />
            )}
          </div>

          {/* Right preview (desktop only) */}
          {!isTablet && (
            <div className="w-[360px] 2xl:w-[440px] shrink-0 border-l border-border/50" style={{ contain: 'layout style' }}>
              <PreviewContainer customization={customization}>
                {previewContent}
              </PreviewContainer>
            </div>
          )}
        </div>
      </div>

      {/* Customization Sheet (side panel) */}
      <Sheet open={customizationOpen} onOpenChange={setCustomizationOpen}>
        <SheetContent side="right" className="w-[320px] max-w-[320px] p-0 gap-0 overflow-hidden [&>button:last-child]:hidden">
          <SheetTitle className="sr-only">{t('customizeDesign')}</SheetTitle>
          <CustomizationPanel
            customization={customization}
            templateId={templateId}
            onChange={setCustomization}
            onClose={() => setCustomizationOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Preview Sheet (tablet) */}
      <Sheet open={previewSheetOpen} onOpenChange={setPreviewSheetOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-lg p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="font-heading">{t('resumePreview')}</SheetTitle>
          </SheetHeader>
          <PreviewContainer customization={customization}>
            {previewContent}
          </PreviewContainer>
        </SheetContent>
      </Sheet>

      {/* Template Gallery */}
      <TemplateGallery
        currentTemplateId={templateId} isProUser={isProUser}
        onSelect={handleTemplateSelect} onUpgradeRequest={() => setUpgradeOpen(true)}
        open={galleryOpen} onOpenChange={setGalleryOpen}
      />

      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} onClose={() => setUpgradeOpen(false)} featureName={t('aiResumeAssistant')} />

      {/* AI Assist Panel */}
      {aiPanelParams && resumeId && (
        <AiAssistPanel
          open={aiPanelOpen}
          onOpenChange={setAiPanelOpen}
          resumeId={resumeId}
          section={aiPanelParams.section}
          content={aiPanelParams.content}
          itemId={aiPanelParams.itemId}
          field={aiPanelParams.field}
          resumeData={resumeData as unknown as Record<string, unknown>}
          onApply={handleAiApply}
          onInsertBelow={handleAiInsertBelow}
        />
      )}

      {/* Hidden full-size render for PDF export (desktop) — only rendered during export */}
      {pdfRenderReady && (
        <div
          ref={hiddenRenderRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '794px',
            clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {previewContent}
        </div>
      )}
    </div>
  );
}