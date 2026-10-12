'use client';

import { useTranslations } from '@/i18n/provider';
import { FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
        <FileText className="w-4 h-4 text-brand" strokeWidth={2} />
        <Sparkles className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-violet" fill="currentColor" />
      </div>
      <span className="font-heading text-base font-bold text-foreground">
        CareerForge <span className="text-brand">AI</span>
      </span>
    </div>
  );
}

export default function ContentFooter() {
  const t = useTranslations('content.footer');

  return (
    <footer className="mt-auto border-t border-border bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-6 text-sm font-body">
            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('helpCenter')}
            </Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('blog')}
            </Link>
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-muted-foreground text-sm text-center font-body">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}