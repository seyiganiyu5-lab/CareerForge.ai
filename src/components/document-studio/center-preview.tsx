'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useDocumentStudioStore } from '@/stores/document-studio-store';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ScanLine, Columns2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const ZOOM_LEVELS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const A4_WIDTH = 794;
const A4_HEIGHT = 1122;

interface CenterPreviewProps {
  children: ReactNode;
}

export function CenterPreview({ children }: CenterPreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userZoomedRef = useRef(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const previewZoom = useDocumentStudioStore((s) => s.previewZoom);
  const previewFullscreen = useDocumentStudioStore((s) => s.previewFullscreen);
  const setPreviewZoom = useDocumentStudioStore((s) => s.setPreviewZoom);
  const setPreviewFullscreen = useDocumentStudioStore((s) => s.setPreviewFullscreen);

  const zoomPercent = Math.round(previewZoom * 100);
  const currentLevelIndex = ZOOM_LEVELS.findIndex((z) => z === previewZoom);

  const computeFitZoom = useCallback(() => {
    if (userZoomedRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth - 48;
    const fitZoom = Math.max(0.3, Math.min(1.0, containerWidth / A4_WIDTH));
    let closest = ZOOM_LEVELS[0];
    let minDiff = Math.abs(fitZoom - closest);
    for (const level of ZOOM_LEVELS) {
      const diff = Math.abs(fitZoom - level);
      if (diff < minDiff) {
        minDiff = diff;
        closest = level;
      }
    }
    setPreviewZoom(closest);
  }, [setPreviewZoom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      computeFitZoom();
    });
    observer.observe(container);
    computeFitZoom();
    return () => observer.disconnect();
  }, [computeFitZoom]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setPreviewFullscreen(isFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setPreviewFullscreen]);

  const handleZoomIn = useCallback(() => {
    const nextIndex = Math.min(currentLevelIndex + 1, ZOOM_LEVELS.length - 1);
    userZoomedRef.current = true;
    setPreviewZoom(ZOOM_LEVELS[nextIndex]);
  }, [currentLevelIndex, setPreviewZoom]);

  const handleZoomOut = useCallback(() => {
    const nextIndex = Math.max(currentLevelIndex - 1, 0);
    userZoomedRef.current = true;
    setPreviewZoom(ZOOM_LEVELS[nextIndex]);
  }, [currentLevelIndex, setPreviewZoom]);

  const handleFitWidth = useCallback(() => {
    userZoomedRef.current = false;
    computeFitZoom();
  }, [computeFitZoom]);

  const handleToggleFullscreen = useCallback(async () => {
    const container = fullscreenContainerRef.current;
    if (!container) return;
    if (previewFullscreen) {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } else {
      try {
        await container.requestFullscreen();
      } catch (_e) {
        // Fullscreen may be blocked by browser
      }
    }
  }, [previewFullscreen]);

  const paperMarginBottom = -(A4_HEIGHT * (1 - previewZoom));

  return (
    <div
      ref={fullscreenContainerRef}
      className="flex flex-1 flex-col overflow-hidden"
    >
      {/* Zoom Toolbar */}
      <div className="flex h-9 shrink-0 items-center justify-center border-b border-border/50 bg-card">
        <TooltipProvider>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomOut}
                  disabled={currentLevelIndex <= 0}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                  <span className="sr-only">Zoom out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom out</TooltipContent>
            </Tooltip>

            <button
              className="flex h-7 min-w-[3.25rem] items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                userZoomedRef.current = false;
                computeFitZoom();
              }}
              title="Click to fit width"
            >
              {zoomPercent}%
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomIn}
                  disabled={currentLevelIndex >= ZOOM_LEVELS.length - 1}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span className="sr-only">Zoom in</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom in</TooltipContent>
            </Tooltip>

            <div className="mx-1.5 h-4 w-px bg-border/60" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleFitWidth}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Fit width</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fit width</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleFitWidth}
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  <span className="sr-only">Fit page</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fit page</TooltipContent>
            </Tooltip>

            <div className="mx-1.5 h-4 w-px bg-border/60" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleToggleFullscreen}
                >
                  {previewFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">
                    {previewFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {previewFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Document Canvas */}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 justify-center overflow-auto bg-[#f0f0f0] p-3 md:p-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className="relative shrink-0 rounded-[2px] bg-white"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${previewZoom})`,
            transformOrigin: 'top center',
            marginBottom: `${paperMarginBottom}px`,
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.06)',
          }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-black/[0.06]" />
          <div className="h-full w-full overflow-hidden">{children}</div>
        </div>
      </div>

      {/* Page indicator */}
      <div className="pointer-events-none absolute bottom-2 right-3">
        <Badge
          variant="secondary"
          className="text-[10px] font-normal text-muted-foreground/60"
        >
          Page 1 of 1
        </Badge>
      </div>
    </div>
  );
}
