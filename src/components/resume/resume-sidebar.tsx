'use client';

import {
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
  Eye,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { SECTIONS, type SectionKey } from '@/types/resume';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
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
};

interface ResumeSidebarProps {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  resumeTitle: string;
  onPreviewClick?: () => void;
  className?: string;
}

export function ResumeSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  resumeTitle,
  onPreviewClick,
  className,
}: ResumeSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border/50 bg-card/50',
        collapsed ? 'w-14' : 'w-[240px]',
        'shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 border-b border-border/50 px-3 h-12 shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        {!collapsed && (
          <span className="font-body text-xs text-muted-foreground truncate">
            {resumeTitle || 'Untitled Resume'}
          </span>
        )}
      </div>

      {/* Section list */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-0.5" aria-label="Resume sections">
          {SECTIONS.map((section) => {
            const Icon = ICON_MAP[section.icon];
            const isActive = activeSection === section.key;

            return (
              <button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full text-left',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted-foreground',
                  collapsed && 'justify-center px-0'
                )}
                aria-current={isActive ? 'true' : undefined}
                title={collapsed ? section.label : undefined}
              >
                {Icon && <Icon className={cn('size-4 shrink-0', isActive && 'text-brand')} />}
                {!collapsed && (
                  <span className="font-body truncate">
                    {section.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Bottom actions */}
      <div className="px-2 py-2 shrink-0">
        {onPreviewClick && (
          <button
            onClick={onPreviewClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full text-left',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            <Eye className="size-4 shrink-0" />
            {!collapsed && (
              <span className="font-body">Preview</span>
            )}
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full text-left mt-0.5',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span className="font-body">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}