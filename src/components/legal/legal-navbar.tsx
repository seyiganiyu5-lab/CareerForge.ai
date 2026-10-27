'use client';

import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useLocale, type Locale } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSignedInDisplay } from '@/lib/auth/context';
import UserMenu from '@/components/dashboard/user-menu';
import { LogoMark } from '@/components/brand/logo-mark';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="w-9 h-9 shrink-0" />
      <span className="font-heading text-lg font-bold text-foreground">
        Hass<span className="text-brand">ify</span>
      </span>
    </div>
  );
}

export default function LegalNavbar() {
  const t = useTranslations('legal.navbar');
  const tA = useTranslations('a11y');
  // Signed-in users go back to their dashboard, not the public landing page
  const { signedIn: isAuthenticated } = useSignedInDisplay();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'fr' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={isAuthenticated ? '/home' : '/'} aria-label={isAuthenticated ? t('dashboard') : tA('backToHome')}>
              <Logo />
            </Link>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('switchLanguage')}
            >
              <Globe className="w-4 h-4" />
            </Button>

            {/* Theme Toggle */}
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
            {isAuthenticated && <UserMenu showDashboard />}
          </div>
        </div>
      </nav>
    </motion.header>
  );
}