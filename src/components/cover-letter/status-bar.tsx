'use client';

import { useMemo } from 'react';
import { Clock, FileText, Hash, Type, BookOpen } from 'lucide-react';
import type { CoverLetterData } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';
import { useCoverLetterOptionLabels } from './ai-generate-dialog';

interface StatusBarProps {
  data: CoverLetterData;
}

export function StatusBar({ data }: StatusBarProps) {
  const t = useTranslations('app.coverLetterEditor');
  const labels = useCoverLetterOptionLabels();
  const stats = useMemo(() => {
    const allText = [data.salutation, data.opening, data.body, data.closing, data.signOff].filter(Boolean).join(' ');
    const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
    const chars = allText.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [data.salutation, data.opening, data.body, data.closing, data.signOff]);

  return (
    <div className="h-8 border-t border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-3 sm:px-4 text-[11px] text-muted-foreground shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <Type className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{t('wordsCount', { count: stats.words })}</span>
        </div>
        <div className="flex items-center gap-1.5 hidden xs:flex sm:flex">
          <Hash className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{t('charsCount', { count: stats.chars })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{t('readingMinutes', { count: stats.readingTime })}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 ml-auto pl-4 shrink-0">
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <FileText className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{t('pageOneOfOne')}</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <BookOpen className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap capitalize">{t('toneStatus', { tone: labels.tone(data.tone) })}</span>
        </div>
      </div>
    </div>
  );
}
