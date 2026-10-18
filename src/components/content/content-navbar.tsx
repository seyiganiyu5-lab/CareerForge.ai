'use client';

import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useLocale } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Sun, Moon, Globe, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo-mark';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="w-9 h-9 shrink-0" />
      <span className="font-heading text-lg font-bold text-foreground">
        CareerForge <span className="text-brand">AI</span>
      </span>
    </div>
  );
}

interface ContentNavbarProps {
  activeSection?: 'help' | 'blog';
}

export default function ContentNavbar({ activeSection }: ContentNavbarProps) {
  const t = useTranslations('content.navbar');
  const tA = useTranslations('a11y');
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggleLocale = () => setLocale(locale === 'en' ? 'fr' : 'en');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/" aria-label={tA('backToHome')}>
                <Logo />
              </Link>
            </motion.div>
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 font-body ${activeSection === 'help' ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                asChild
              >
                <Link href="/help">
                  <Search className="w-3.5 h-3.5" />
                  {t('helpCenter')}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 font-body ${activeSection === 'blog' ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                asChild
              >
                <Link href="/blog">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t('blog')}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('switchLanguage')}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('toggleTheme')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}