'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/provider';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { FadeInUp } from '@/lib/motion';

export default function ArticleFeedback() {
  const t = useTranslations('articleFeedback');
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="p-4 rounded-xl border bg-muted/50">
      {feedback ? (
        <FadeInUp delay={0} duration={0.25}>
          <p className="text-sm text-foreground font-medium">
            {t('thankYou')}
          </p>
        </FadeInUp>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm text-muted-foreground">{t('question')}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedback('yes')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="w-4 h-4" />
              {t('yes')}
            </button>
            <button
              onClick={() => setFeedback('no')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ThumbsDown className="w-4 h-4" />
              {t('no')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}