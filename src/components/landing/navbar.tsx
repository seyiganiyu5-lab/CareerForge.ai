'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Menu, Sun, Moon, Globe, LogIn, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useHashNavigation } from '@/hooks/use-hash-navigation';
import { useLocale, type Locale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/logo-mark';

const NAV_LINKS = [
  { key: 'home', href: 'home' },
  { key: 'about', href: 'about' },
  { key: 'features', href: 'features' },
  { key: 'templates', href: 'templates' },
  { key: 'pricing', href: 'pricing' },
  { key: 'faq', href: 'faq' },
] as const;

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

export default function Navbar() {
  const t = useTranslations('nav');
  const tA = useTranslations('a11y');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { activeSection, scrollToSection } = useHashNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setMobileOpen(false);
  };

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
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <Logo />
          </motion.div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    'relative px-2.5 py-2 text-sm font-medium transition-colors rounded-lg font-body',
                    isActive
                      ? 'text-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(link.key)}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-1">
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

            {/* Signed in: straight back to the dashboard; otherwise log in / sign up */}
            {authLoading ? null : isAuthenticated ? (
              <Button size="sm" className="gap-1.5 bg-brand hover:bg-brand/90 text-white font-body" asChild>
                <Link href="/home">
                  <LayoutDashboard className="w-4 h-4" />
                  {t('dashboard')}
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground font-body"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    {t('login')}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-brand hover:bg-brand/90 text-white font-body"
                  asChild
                >
                  <Link href="/signup">
                    {t('getStarted')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="text-muted-foreground"
              aria-label={tA('switchLanguage')}
            >
              <Globe className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
              aria-label={tA('toggleTheme')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label={tA('openMenu')}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 pt-12 px-6">
                <SheetTitle className="sr-only">{tA('navigationMenu')}</SheetTitle>

                {/* Mobile Logo */}
                <div className="mb-8">
                  <Logo />
                </div>

                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, index) => {
                    const isActive = activeSection === link.href;
                    return (
                      <motion.button
                        key={link.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => handleNavClick(link.href)}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors font-body',
                          isActive
                            ? 'bg-brand/10 text-brand'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        {t(link.key)}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="mt-8 flex flex-col gap-3">
                  {authLoading ? null : isAuthenticated ? (
                    <Button className="w-full justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-body" asChild>
                      <Link href="/home">
                        <LayoutDashboard className="w-4 h-4" />
                        {t('dashboard')}
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-center gap-2 text-muted-foreground font-body"
                        asChild
                      >
                        <Link href="/login">
                          <LogIn className="w-4 h-4" />
                          {t('login')}
                        </Link>
                      </Button>
                      <Button
                        className="w-full justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-body"
                        asChild
                      >
                        <Link href="/signup">
                          {t('getStarted')}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}