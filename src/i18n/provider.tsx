'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import { NextIntlClientProvider, useTranslations as useNextIntlTranslations } from 'next-intl';
import type { MessageKeys, Messages } from 'next-intl';
import { Locale, defaultLocale, locales } from '@/i18n/config';

// Static imports — avoids webpack dynamic-chunk issues with JSON files
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

const allMessages: Record<Locale, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  fr: frMessages as Record<string, unknown>,
};

function getMessages(locale: Locale): Record<string, unknown> {
  return allMessages[locale] ?? allMessages[defaultLocale];
}

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

let cachedLocale: Locale | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Locale {
  if (cachedLocale) return cachedLocale;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cf-locale');
    if (saved && locales.includes(saved as Locale)) {
      cachedLocale = saved as Locale;
      return cachedLocale;
    }
  }
  cachedLocale = defaultLocale;
  return defaultLocale;
}

function getServerSnapshot(): Locale {
  return defaultLocale;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitChange() {
  listeners.forEach(l => l());
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const messages = getMessages(locale);

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf-locale', newLocale);
    }
    cachedLocale = newLocale;
    emitChange();
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
