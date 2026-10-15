'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/i18n/provider';
import { useLocale } from '@/i18n/provider';
import { useTheme } from 'next-themes';
import { Menu, Search, Globe, Sun, Moon, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import NotificationDropdown from './notification-dropdown';
import UserMenu from './user-menu';

interface TopNavProps {
  isMobile: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ isMobile, onMenuClick }: TopNavProps) {
  const tSearch = useTranslations('dashboard.topNav');
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
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
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Search (hidden on phones, where there isn't room for it) */}
      <div className="hidden sm:block relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="dashboard-search"
          type="search"
          placeholder={tSearch('searchPlaceholder')}
          className={cn(
            'pl-9 lg:pr-12 h-9 bg-muted/50 border-transparent font-body text-sm',
            'focus:bg-background focus:border-border transition-all',
            searchFocused && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
          )}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 pointer-events-none">
          <span className="inline-flex items-center rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">
            ⌘K
          </span>
        </kbd>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="h-9 w-auto px-2 gap-1"
          aria-label={`Switch to ${locale === 'en' ? 'French' : 'English'}`}
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
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}