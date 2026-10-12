'use client';

import { useCallback } from 'react';
import { useTranslations } from '@/i18n/provider';
import { ExternalLink, Linkedin, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const t = useTranslations('helpCenter.article');
  const { toast } = useToast();
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(title);
    const urlParam = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${urlParam}`, '_blank', 'noopener');
  }, [title, shareUrl]);

  const handleLinkedIn = useCallback(() => {
    const urlParam = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${urlParam}`, '_blank', 'noopener');
  }, [shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: t('linkCopied'),
      });
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast({
        title: t('linkCopied'),
      });
    }
  }, [shareUrl, toast, t]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={handleTwitter}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Share on Twitter"
      >
        <ExternalLink className="w-4 h-4" />
      </button>
      <button
        onClick={handleLinkedIn}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={t('copyLink')}
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}