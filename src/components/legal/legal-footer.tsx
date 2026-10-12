'use client';

import { useTranslations } from '@/i18n/provider';
import { useLocale } from '@/i18n/provider';
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