'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { FileText, Sparkles, Globe, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';
import NewsletterForm from '@/components/newsletter/newsletter-form';

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

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-auto border-t border-border bg-background py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-8"
        >
          {/* Brand column */}
          <div className="col-span-2">
            <Logo />
            <p className="text-muted-foreground text-sm mt-4 max-w-xs font-body">
              AI-powered career tools for modern job seekers.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <button
                aria-label="Twitter"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                aria-label="LinkedIn"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                aria-label="GitHub"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Github className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product column */}
          <div>
            <h4 className="font-semibold text-sm mb-4 font-body">
              {t('product.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('product.resumeBuilder')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('product.coverLetterGenerator')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('product.templates')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="font-semibold text-sm mb-4 font-body">
              {t('company.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('company.about')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('company.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <h4 className="font-semibold text-sm mb-4 font-body">
              {t('resources.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('resources.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('resources.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-sm mb-4 font-body">
              {t('legal.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                  {t('legal.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Newsletter */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4 className="font-semibold text-base font-body">
                {t('newsletter.title')}
              </h4>
              <p className="text-muted-foreground text-sm mt-1 font-body">
                {t('newsletter.description')}
              </p>
            </div>
            <NewsletterForm source="footer" variant="compact" className="w-full md:w-auto md:max-w-sm" />
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-muted-foreground text-sm font-body">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}