'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CoverLetterTemplateEngine } from './template-engine';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import type { CoverLetterTemplateId, CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';

interface PreviewPanelProps {
  data: CoverLetterData;
  customization: CoverLetterCustomization;
  templateId: CoverLetterTemplateId;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1122;

export function PreviewPanel({ data, customization, templateId, previewRef }: PreviewPanelProps) {
  const { isMobile } = useBreakpoints();
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const userZoomedRef = useRef(false);

  const fitPreviewWidth = useCallback((force = false) => {
    if (!previewAreaRef.current) return;
    if (!force && userZoomedRef.current) return;
    const rawWidth = previewAreaRef.current.clientWidth;
    if (rawWidth < 100) return;
    const padding = isMobile ? 16 : 48;
    const containerWidth = rawWidth - padding;
    // Compute fit-to-width zoom, but enforce a minimum readable zoom on mobile
    // (text below 60% is uncomfortably small). On mobile this means horizontal
    // scrolling may be required, which is acceptable for a document preview.
    const fitZoom = Math.round((containerWidth / A4_WIDTH) * 100);
    const minZoom = isMobile ? 60 : 30;
    const maxZoom = 100;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, fitZoom));
    setPreviewZoom(newZoom);
    userZoomedRef.current = false;
  }, [isMobile]);

  useEffect(() => {
    fitPreviewWidth(true);
    const retryTimer = setTimeout(() => fitPreviewWidth(true), 200);
    const el = previewAreaRef.current;
    if (!el) {
      const mountTimer = setTimeout(() => {
        const el2 = previewAreaRef.current;
        if (el2) {
          const observer = new ResizeObserver(() => fitPreviewWidth(false));
          observer.observe(el2);
        }
      }, 300);
      return () => clearTimeout(mountTimer);
    }
    const observer = new ResizeObserver(() => fitPreviewWidth(false));
    observer.observe(el);
    return () => {
      clearTimeout(retryTimer);
      observer.disconnect();
    };
  }, [fitPreviewWidth]);

  const scale = previewZoom / 100;

  const handleFullscreen = () => {
    if (!previewAreaRef.current) return;
    if (!isFullscreen) {
      previewAreaRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        fitPreviewWidth(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [fitPreviewWidth]);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {/* Preview Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-background/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Preview</span>
        </div>
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    userZoomedRef.current = true;
                    setPreviewZoom((z) => Math.max(30, z - 10));
                  }}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><span className="text-[10px]">Zoom out</span></TooltipContent>
            </Tooltip>

            <span className="text-[11px] text-muted-foreground w-10 text-center select-none font-mono">
              {previewZoom}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    userZoomedRef.current = true;
                    setPreviewZoom((z) => Math.min(isMobile ? 250 : 150, z + 10));
                  }}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><span className="text-[10px]">Zoom in</span></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => fitPreviewWidth(true)}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><span className="text-[10px]">Fit width</span></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleFullscreen}
                >
                  <Expand className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><span className="text-[10px]">Fullscreen</span></TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Preview Area */}
      <div
        ref={previewAreaRef}
        className="flex-1 min-h-0 overflow-auto"
        style={{
          padding: isFullscreen ? 32 : isMobile ? 16 : 32,
          background: isFullscreen
            ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px'
            : undefined,
        }}
      >
        <div className="flex justify-center">
          <div
            style={{
              width: Math.round(A4_WIDTH * scale),
              minHeight: Math.round(A4_HEIGHT * scale),
              flexShrink: 0,
            }}
          >
            <div
              ref={previewRef}
              style={{
                width: A4_WIDTH,
                minHeight: A4_HEIGHT,
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <CoverLetterTemplateEngine data={data} customization={customization} templateId={templateId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
