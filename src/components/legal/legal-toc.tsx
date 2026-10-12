'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TocSection {
  id: string;
  title: string;
}

interface LegalTocProps {
  sections: TocSection[];
}

export default function LegalToc({ sections }: LegalTocProps) {
  const t = useTranslations('privacyPolicy');
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileOpen(false);
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position and pick the first one
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    // Small delay to let sections render
    const timer = setTimeout(() => {
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [sections]);

  const tocContent = (
    <div className="flex flex-col">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-3 px-2">
        {t('toc.title')}
      </h3>
      <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
        <nav aria-label="Table of Contents">
          <ul className="space-y-0.5 pr-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  onClick={() => handleScrollTo(section.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 font-body',
                    activeId === section.id
                      ? 'bg-brand/10 text-brand font-medium pl-4 border-l-2 border-brand'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  aria-current={activeId === section.id ? 'true' : undefined}
                >
                  {section.title}
                </motion.button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop: Sticky Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="Table of Contents">
        <div className="sticky top-24">
          {tocContent}
        </div>
      </aside>

      {/* Mobile: Floating Button + Sheet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-brand hover:bg-brand/90 text-white"
              aria-label={t('toc.title')}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <List className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 pt-12 px-6">
            <SheetTitle className="sr-only">{t('toc.title')}</SheetTitle>
            {tocContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}