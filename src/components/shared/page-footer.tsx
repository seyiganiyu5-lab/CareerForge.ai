'use client';

import { useTranslations } from '@/i18n/provider';
import { FileText, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10">
        <FileText className="w-5 h-5 text-brand" strokeWidth={2} />
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-violet" fill="currentColor" />
      </div>
      <span className="font-heading text-lg font-bold text-foreground">
        CareerForge <span className="text-brand">AI</span>
      </span>
    </div>
  );
}

export default function PageFooter() {
  const t = useTranslations('pageFooter');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand - 2 cols on md */}
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
            {t('brandDescription')}
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-4">
            {t('product.title')}
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('product.features')}
              </a>
            </li>
            <li>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('product.pricing')}
              </a>
            </li>
            <li>
              <a href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('product.helpCenter')}
              </a>
            </li>
            <li>
              <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('product.blog')}
              </a>
            </li>
          </ul>
        </div>

        {/* Company + Legal */}
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-4">
            {t('company.title')}
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('company.about')}
              </a>
            </li>
            <li>
              <a href="mailto:support@careerforge.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('company.contact')}
              </a>
            </li>
          </ul>

          <h3 className="font-heading font-semibold text-foreground mb-4 mt-8">
            {t('legal.title')}
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('legal.privacy')}
              </a>
            </li>
            <li>
              <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('legal.terms')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="my-8" />

      <p className="text-center text-sm text-muted-foreground">
        {t('copyright', { year })}
      </p>
    </footer>
  );
}