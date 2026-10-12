'use client';

import PageNavbar from '@/components/shared/page-navbar';
import PageFooter from '@/components/shared/page-footer';
import BackToTop from '@/components/legal/back-to-top';
import { useTranslations } from 'next-intl';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('helpCenter');

  return (
    <div className="min-h-screen flex flex-col bg-background hero-gradient">
      <PageNavbar navLinks={[{ label: t('nav.title'), href: '/help' }]} />
      <main className="flex-1">{children}</main>
      <PageFooter />
      <BackToTop />
    </div>
  );
}