'use client';

import { useTranslations } from '@/i18n/provider';
import { LogoMark } from '@/components/brand/logo-mark';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="w-8 h-8 shrink-0" />
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