'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/i18n/provider';
import { useLocale } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Menu, Search, Globe, Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationDropdown from './notification-dropdown';
import UserMenu from './user-menu';
import DashboardSearch from './dashboard-search';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface TopNavProps {
  isMobile: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ isMobile, onMenuClick }: TopNavProps) {
  const tSearch = useTranslations('dashboard.topNav');
  const tA = useTranslations('a11y');
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('dashboard-search')?.focus();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      {/* Mobile Menu */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0"
          aria-label={tA('openMenu')}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Search (in a pop-up on phones, where the bar has no room for it) */}
      <DashboardSearch inputId="dashboard-search" className="hidden sm:block flex-1 max-w-md" />

      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label={tSearch('openSearch')}
        >
          <Search className="w-4 h-4" />
        </Button>
        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="h-9 w-auto px-2 gap-1"
          aria-label={tA('switchLanguage')}
        >
          <Globe className="w-4 h-4" />
          <span className="text-[11px] font-semibold uppercase">{locale}</span>
        </Button>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
            aria-label={tA('toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <UserMenu />
      </div>

      <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <DialogContent className="top-4 translate-y-0 max-w-[calc(100%-2rem)] p-4 gap-0">
          <DialogTitle className="sr-only">{tSearch('openSearch')}</DialogTitle>
          <DashboardSearch variant="inline" inputId="dashboard-search-mobile" autoFocus onNavigate={() => setMobileSearchOpen(false)} className="pr-8" />
        </DialogContent>
      </Dialog>
    </header>
  );
}
