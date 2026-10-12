'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  User,
  Building2,
  Briefcase,
  PenLine,
  Settings2,
  FileText,
  GraduationCap,
  Award,
  Languages,
  BookOpen,
  Code2,
  Shield,
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentStudioStore } from '@/stores/document-studio-store';
import { cn } from '@/lib/utils';

// ─── Section Definitions ────────────────────────────────────

interface SidebarSection {
  key: string;
  label: string;
  icon: LucideIcon;
}

const RESUME_SECTIONS: SidebarSection[] = [
  { key: 'personal-info', label: 'Personal Information', icon: User },
  { key: 'summary', label: 'Professional Summary', icon: FileText },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'skills', label: 'Skills', icon: Code2 },
  { key: 'projects', label: 'Projects', icon: BookOpen },
  { key: 'certifications', label: 'Certifications', icon: Shield },
  { key: 'awards', label: 'Awards', icon: Award },
  { key: 'languages', label: 'Languages', icon: Languages },
  { key: 'volunteer', label: 'Volunteer', icon: Heart },
  { key: 'references', label: 'References', icon: MessageSquare },
  { key: 'additional', label: 'Additional', icon: Settings2 },
];

const COVER_LETTER_SECTIONS: SidebarSection[] = [
  { key: 'sender-info', label: 'Your Information', icon: User },
  { key: 'recipient-info', label: 'Recipient', icon: Building2 },
  { key: 'job-details', label: 'Job Details', icon: Briefcase },
  { key: 'content', label: 'Content', icon: PenLine },
  { key: 'customization', label: 'Design', icon: Settings2 },
];

// ─── Collapsible Group ─────────────────────────────────────

interface SectionGroupProps {
  title: string;
  sections: SidebarSection[];
  activeSection: string | null;
  defaultOpen?: boolean;
}

function SectionGroup({ title, sections, activeSection, defaultOpen = true }: SectionGroupProps) {
  const setActiveSection = useDocumentStudioStore((s) => s.setActiveSection);

  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
          {title}
        </span>
        <Badge variant="secondary" className="h-4 min-w-[18px] px-1 text-[10px] font-semibold tabular-nums">
          {sections.length}
        </Badge>
      </div>
      <div className="relative flex flex-col gap-0.5">
        <AnimatePresence>
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            const Icon = section.icon;

            return (
              <Tooltip key={section.key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      setActiveSection(isActive ? null : section.key)
                    }
                    className={cn(
                      'group relative z-10 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 w-full text-left',
                      'hover:bg-accent/80 hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      isActive
                        ? 'text-brand'
                        : 'text-muted-foreground'
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Per-button animated active background */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 z-[-1] rounded-lg bg-brand/10 border-l-2 border-brand"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}

                    <Icon
                      className={cn(
                        'size-[18px] shrink-0 transition-colors duration-200',
                        isActive
                          ? 'text-brand'
                          : 'text-muted-foreground group-hover:text-muted-foreground/80'
                      )}
                    />
                    <span className="truncate select-none">{section.label}</span>

                    {/* Hover reveal chevron */}
                    <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/0 transition-all duration-200 group-hover:text-muted-foreground/50" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {section.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

function LeftSidebar() {
  const documentType = useDocumentStudioStore((s) => s.documentType);
  const activeSection = useDocumentStudioStore((s) => s.activeSection);
  const setGeneratorDialogOpen = useDocumentStudioStore((s) => s.setGeneratorDialogOpen);

  const sections = useMemo(
    () =>
      documentType === 'resume' ? RESUME_SECTIONS : COVER_LETTER_SECTIONS,
    [documentType]
  );

  const groupTitle = useMemo(
    () => (documentType === 'resume' ? 'Resume Sections' : 'Letter Sections'),
    [documentType]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-full w-64 flex-col border-r border-border/50 bg-card">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-border/50 px-4 h-12 shrink-0">
          <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
          <span className="text-[13px] font-semibold tracking-tight">Sections</span>
          <Badge
            variant="secondary"
            className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-semibold tabular-nums"
          >
            {sections.length}
          </Badge>
        </div>

        {/* ── Section List ───────────────────────────────── */}
        <ScrollArea className="flex-1 px-2 py-1">
          <SectionGroup
            title={groupTitle}
            sections={sections}
            activeSection={activeSection}
          />
        </ScrollArea>

        <Separator />

        {/* ── Bottom Actions ────────────────────────────── */}
        <div className="shrink-0 border-t border-border/50 p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={documentType}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Button
                onClick={() => setGeneratorDialogOpen(true)}
                className={cn(
                  'w-full justify-center gap-2 rounded-lg px-4 py-2.5',
                  'bg-brand text-white shadow-sm',
                  'hover:bg-brand/90 active:bg-brand/80',
                  'transition-all duration-200'
                )}
                size="sm"
              >
                <Sparkles className="size-4" />
                <span className="text-sm font-semibold">Generate with AI</span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export { LeftSidebar };
