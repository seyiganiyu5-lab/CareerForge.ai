'use client';

import {
  FileText,
  Type,
  Clock,
  Globe,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ZoomIn,
} from 'lucide-react';
import { useDocumentStudioStore } from '@/stores/document-studio-store';

/** Small inline vertical divider used between status items. */
function Divider() {
  return <span className="inline-block h-3 w-px bg-border mx-2" />;
}

/** Formats a Date string (or Date) into a short HH:MM time. */
function formatTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function BottomStatusBar() {
  const documentType = useDocumentStudioStore((s) => s.documentType);
  const previewZoom = useDocumentStudioStore((s) => s.previewZoom);
  const autosaveStatus = useDocumentStudioStore((s) => s.autosaveStatus);
  const lastSaved = useDocumentStudioStore((s) => s.lastSaved);

  // -------------------------------------------------------------------
  // Placeholder stats – these will be wired to real document content
  // once the editor integration is in place.
  // -------------------------------------------------------------------
  const wordCount = 245;
  const charCount = 1234;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const language = 'English';
  const atsReady = true;
  const currentPage = 1;
  const totalPages = 1;

  const zoomPercent = Math.round(previewZoom * 100);

  return (
    <div className="sticky bottom-0 z-30 flex h-7 items-center justify-between border-t bg-card px-3 text-[11px] text-muted-foreground select-none">
      {/* ── Left section ─────────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {/* Document type badge */}
        <span className="inline-flex items-center gap-1.5 rounded-sm border bg-muted/60 px-1.5 py-px font-medium">
          <FileText className="size-3" />
          {documentType === 'resume' ? 'Resume' : 'Cover Letter'}
        </span>

        <Divider />

        {/* Word count */}
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3" />
          {wordCount.toLocaleString()} words
        </span>

        <Divider />

        {/* Character count */}
        <span className="flex items-center gap-1.5">
          <Type className="size-3" />
          {charCount.toLocaleString()} chars
        </span>

        <Divider />

        {/* Estimated reading time */}
        <span className="flex items-center gap-1.5">
          <Clock className="size-3" />
          ~{readingMinutes} min read
        </span>
      </div>

      {/* ── Center section ─────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {/* Language */}
        <span className="flex items-center gap-1.5">
          <Globe className="size-3" />
          {language}
        </span>

        <Divider />

        {/* ATS status */}
        {atsReady ? (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3" />
            ATS Ready
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 opacity-40" />
            Not checked
          </span>
        )}

        <Divider />

        {/* Page number */}
        <span className="flex items-center gap-1.5">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* ── Right section ──────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {/* Zoom */}
        <span className="flex items-center gap-1.5">
          <ZoomIn className="size-3" />
          {zoomPercent}%
        </span>

        <Divider />

        {/* Autosave status */}
        {autosaveStatus === 'saving' && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Saving…
          </span>
        )}

        {autosaveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            Saved
            {lastSaved && (
              <span className="text-muted-foreground">
                at {formatTime(lastSaved)}
              </span>
            )}
          </span>
        )}

        {autosaveStatus === 'error' && (
          <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
            <AlertCircle className="size-3" />
            Error
          </span>
        )}

        {/* idle → show nothing */}
      </div>
    </div>
  );
}
