'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDocumentStudioStore } from '@/stores/document-studio-store';
import {
  Undo2,
  Redo2,
  Search,
  Bell,
  Download,
  Share2,
  ChevronDown,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  FileText,
  Languages,
  Palette,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGE_OPTIONS } from '@/types/cover-letter';

// ---------------------------------------------------------------------------
// TopNavigation
// ---------------------------------------------------------------------------

export function TopNavigation() {
  const {
    documentType,
    documentTitle,
    setDocumentTitle,
    setDocumentType,
    leftSidebarOpen,
    toggleLeftSidebar,
    rightPanelOpen,
    toggleRightPanel,
    autosaveStatus,
    canUndo,
    canRedo,
    setExportDialogOpen,
  } = useDocumentStudioStore();

  // Inline title editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(documentTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Keep local input in sync when store title changes externally
  useEffect(() => {
    setTitleInput(documentTitle);
  }, [documentTitle]);

  // Auto-focus the input when editing begins
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Confirm title edit on Enter or blur
  const commitTitle = useCallback(() => {
    const trimmed = titleInput.trim();
    if (trimmed) {
      setDocumentTitle(trimmed);
    } else {
      setTitleInput(documentTitle);
    }
    setEditingTitle(false);
  }, [titleInput, documentTitle, setDocumentTitle]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitTitle();
    } else if (e.key === 'Escape') {
      setTitleInput(documentTitle);
      setEditingTitle(false);
    }
  };

  // Save status UI
  const renderSaveStatus = () => {
    switch (autosaveStatus) {
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved</span>
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>Error</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-12 flex items-center justify-between px-2 md:px-3 bg-card border-b border-border/50 select-none shrink-0">
        {/* ─── Left Section ─────────────────────────────────────── */}
        <div className="flex items-center gap-1 min-w-0">
          {/* Toggle left sidebar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLeftSidebar}
                className="h-8 w-8 p-0 shrink-0"
                aria-label={leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {leftSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            </TooltipContent>
          </Tooltip>

          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0 px-1">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-xs font-heading font-bold tracking-tight text-foreground">
              CareerForge AI
            </span>
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-border/60 mx-1 shrink-0" />

          {/* Document title — editable */}
          <div className="min-w-0 max-w-[200px] md:max-w-[280px]">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKeyDown}
                className="w-full h-7 px-1.5 text-sm font-heading font-semibold bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                maxLength={100}
                aria-label="Document title"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="w-full text-left truncate text-sm font-heading font-semibold text-foreground hover:text-brand transition-colors rounded px-1.5 -mx-1.5 py-0.5"
                aria-label={`Edit title: ${documentTitle}`}
              >
                {documentTitle || 'Untitled Document'}
              </button>
            )}
          </div>

          {/* Document type selector */}
          <Select
            value={documentType}
            onValueChange={(val) => setDocumentType(val as 'resume' | 'cover-letter')}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-border/60 bg-transparent text-xs font-medium px-2 py-0 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="resume">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Resume
                </span>
              </SelectItem>
              <SelectItem value="cover-letter">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Cover Letter
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ─── Center Section ──────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={!canUndo}
                aria-label="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Undo
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={!canRedo}
                aria-label="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Redo
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Search
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ─── Right Section ───────────────────────────────────── */}
        <div className="flex items-center gap-1 min-w-0">
          {/* Language selector */}
          <Select defaultValue="en">
            <SelectTrigger className="h-7 w-auto gap-1 border-border/60 bg-transparent text-xs font-medium px-2 py-0 shrink-0">
              <Languages className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-1.5">
                    <span className="uppercase text-[10px] font-mono font-semibold text-muted-foreground w-3">
                      {lang.value}
                    </span>
                    {lang.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Save status */}
          {renderSaveStatus()}

          {/* Divider (desktop only) */}
          <div className="hidden md:block w-px h-5 bg-border/60 mx-0.5" />

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Notifications
            </TooltipContent>
          </Tooltip>

          {/* Export dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 shrink-0"
                    aria-label="Export document"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Export</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Export document
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs gap-2" onSelect={() => setExportDialogOpen(true)}>
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2" onSelect={() => setExportDialogOpen(true)}>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Export as DOCX
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs gap-2" onSelect={() => setExportDialogOpen(true)}>
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                Share & Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Toggle right panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRightPanel}
                className="h-8 w-8 p-0 shrink-0"
                aria-label={rightPanelOpen ? 'Close right panel' : 'Open right panel'}
              >
                {rightPanelOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {rightPanelOpen ? 'Close right panel' : 'Open right panel'}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
