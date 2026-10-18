'use client';

import { useTranslations } from '@/i18n/provider';
import { useLocale } from '@/i18n/provider';
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

export default function LegalFooter() {
  const t = useTranslations('legal.footer');

  return (
    <footer className="mt-auto border-t border-border bg-background py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo */}
          <Logo />

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              {t('terms')}
            </Link>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Copyright */}
        <p className="text-muted-foreground text-sm text-center font-body">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}