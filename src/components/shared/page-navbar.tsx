'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Menu, Sun, Moon, Globe, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useLocale, type Locale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { SlideInRight } from '@/lib/motion';

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

interface NavLink {
  label: string;
  href: string;
}

interface PageNavbarProps {
  navLinks: NavLink[];
  showGetStarted?: boolean;
}

export default function PageNavbar({ navLinks, showGetStarted = true }: PageNavbarProps) {
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(navLinks[0]?.href ?? '');
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

  const handleNavClick = (href: string) => {
    setActiveLink(href);
    setMobileOpen(false);
  };

  return (
    <header
      style={{ animation: 'fadeInDown 0.5s ease-out both' }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex-shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Logo />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors rounded-lg font-body',
                    isActive
                      ? 'text-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand rounded-full transition-all duration-300"
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {showGetStarted && (
              <Button
                size="sm"
                className="gap-1.5 bg-brand hover:bg-brand/90 text-white font-body"
                asChild
              >
                <a href="/signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:ml-0.5" />
                </a>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="text-muted-foreground"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 pt-12 px-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                <div className="mb-8">
                  <Logo />
                </div>

                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <SlideInRight
                      key={link.href}
                      as="a"
                      href={link.href}
                      delay={index * 0.05}
                      duration={0.3}
                      onClick={() => handleNavClick(link.href)}
                      className={cn(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors font-body',
                        activeLink === link.href
                          ? 'bg-brand/10 text-brand'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      {link.label}
                    </SlideInRight>
                  ))}
                </div>

                {showGetStarted && (
                  <div className="mt-8">
                    <Button
                      className="w-full justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-body"
                      asChild
                    >
                      <a href="/signup">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}