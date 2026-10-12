'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentStudioStore } from '@/stores/document-studio-store';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import { useAuth } from '@/lib/auth/context';
import { TopNavigation } from './top-navigation';
import { LeftSidebar } from './left-sidebar';
import { CenterPreview } from './center-preview';
import { RightAiPanel } from './right-ai-panel';
import { BottomStatusBar } from './bottom-status-bar';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, Eye, Sparkles } from 'lucide-react';

// ─── Empty/Welcome State ──────────────────────────────────────

function EmptyState() {
  const { setDocumentType, setGeneratorDialogOpen } = useDocumentStudioStore();

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand/10 flex items-center justify-center">
          <PenLine className="w-8 h-8 text-brand" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Welcome to Document Studio
        </h2>
        <p className="text-sm text-muted-foreground mb-8 font-body leading-relaxed">
          Create professional resumes, cover letters, and career documents
          with AI-powered assistance. Select a document type to get started.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            className="gap-2 bg-brand hover:bg-brand/90 text-white font-body"
            onClick={() => { setDocumentType('resume'); setGeneratorDialogOpen(true); }}
          >
            <PenLine className="w-4 h-4" />
            New Resume
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 font-body"
            onClick={() => { setDocumentType('cover-letter'); setGeneratorDialogOpen(true); }}
          >
            <Sparkles className="w-4 h-4" />
            New Cover Letter
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile View Switcher ─────────────────────────────────────

function MobileViewSwitcher() {
  const { viewMode, setViewMode } = useDocumentStudioStore();

  return (
    <div className="md:hidden flex items-center justify-center py-2 bg-card border-b border-border/50">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'editor' | 'preview' | 'ai')}>
        <TabsList className="h-8 bg-muted">
          <TabsTrigger value="editor" className="h-7 px-3 text-xs font-body gap-1.5">
            <PenLine className="w-3 h-3" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="h-7 px-3 text-xs font-body gap-1.5">
            <Eye className="w-3 h-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="ai" className="h-7 px-3 text-xs font-body gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

// ─── Main Document Studio ────────────────────────────────────

export function DocumentStudio() {
  const {
    leftSidebarOpen,
    rightPanelOpen,
    documentId,
    viewMode,
  } = useDocumentStudioStore();

  const { isMobile } = useBreakpoints();
  const { isAuthenticated } = useAuth();

  const hasDocument = !!documentId;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Mobile View Switcher */}
      {isMobile && <MobileViewSwitcher />}

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {isMobile ? (
          /* Mobile: Single panel based on view mode */
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0"
            >
              {viewMode === 'editor' && (
                <LeftSidebar />
              )}
              {viewMode === 'preview' && (
                <CenterPreview>
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
                    {hasDocument ? 'Document preview will appear here' : 'Create a document to see the preview'}
                  </div>
                </CenterPreview>
              )}
              {viewMode === 'ai' && (
                <RightAiPanel />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Desktop/Tablet: Three-panel layout */
          <>
            {/* Left Sidebar */}
            <AnimatePresence initial={false}>
              {leftSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="shrink-0 overflow-hidden"
                >
                  <LeftSidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Preview */}
            <div className="flex-1 min-w-0">
              {hasDocument ? (
                <CenterPreview>
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
                    Document content will render here
                  </div>
                </CenterPreview>
              ) : (
                <EmptyState />
              )}
            </div>

            {/* Right AI Panel */}
            <AnimatePresence initial={false}>
              {rightPanelOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="shrink-0 overflow-hidden"
                >
                  <RightAiPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar />
    </div>
  );
}

export default DocumentStudio;
