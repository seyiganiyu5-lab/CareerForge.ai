'use client';

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TemplateCustomization } from '@/types/template';
import { PAGE_DIMENSIONS } from '@/types/template';
import { useTranslations } from '@/i18n/provider';

interface PreviewContainerProps {
  children: ReactNode;
  customization: TemplateCustomization;
}

const ZOOM_LEVELS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

export function PreviewContainer({ children, customization }: PreviewContainerProps) {
  const t = useTranslations('app.resumeEditor');
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const page = PAGE_DIMENSIONS[customization.pageSize];

  // Auto-fit width on mount and genuine container resizes (not zoom changes).
  // A userZoomed ref prevents the ResizeObserver from resetting manual zoom.
  const userZoomedRef = useRef(false);

  const fitWidth = useCallback((force = false) => {
    if (!containerRef.current) return;
    if (!force && userZoomedRef.current) return; // don't override user's manual zoom
    const containerWidth = containerRef.current.clientWidth - 48; // 24px padding each side
    const newZoom = Math.min(1, containerWidth / page.width);
    setZoom(Math.round(newZoom * 10) / 10);
    userZoomedRef.current = false;
  }, [page.width]);

  useEffect(() => {
    fitWidth(true); // always fit on mount
    const observer = new ResizeObserver(() => fitWidth(false));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitWidth]);

  const zoomIn = () => {
    const idx = ZOOM_LEVELS.findIndex(z => z > zoom);
    if (idx !== -1) {
      userZoomedRef.current = true;
      setZoom(ZOOM_LEVELS[idx]);
    }
  };

  const zoomOut = () => {
    const idx = [...ZOOM_LEVELS].reverse().findIndex(z => z < zoom);
    if (idx !== -1) {
      userZoomedRef.current = true;
      setZoom([...ZOOM_LEVELS].reverse()[idx]);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={containerRef}
        className={`flex flex-col h-full bg-muted/30 ${isFullscreen ? 'bg-white' : ''}`}
      >
        {/* Toolbar */}
        <div className={`
          flex items-center justify-between px-3 py-2 border-b shrink-0
          ${isFullscreen ? 'bg-gray-100' : 'bg-card border-border/50'}
        `}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={zoomOut}
                  disabled={zoom <= ZOOM_LEVELS[0]}
                  aria-label={t('zoomOut')}
                >
                  <ZoomOut className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{t('zoomOut')}</TooltipContent>
            </Tooltip>

            <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={zoomIn}
                  disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                  aria-label={t('zoomIn')}
                >
                  <ZoomIn className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{t('zoomIn')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => fitWidth(true)}
                  aria-label={t('fitWidth')}
                >
                  <Scan className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{t('fitWidth')}</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
              >
                {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-center">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                width: page.width,
                minHeight: page.height,
                marginBottom: `-${page.height * (1 - zoom)}px`,
                contain: 'layout style paint',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}