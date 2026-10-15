'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, startTransition } from 'react';
import { NextIntlClientProvider, useTranslations as useNextIntlTranslations } from 'next-intl';
import type { MessageKeys, Messages } from 'next-intl';
import { Locale, defaultLocale, locales } from '@/i18n/config';

export type { Locale };

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

function readSavedLocale(fallback: Locale): Locale {
  try {
    const saved = localStorage.getItem('cf-locale');
    if (saved && locales.includes(saved as Locale)) return saved as Locale;
  } catch {
    // Storage blocked (private mode etc.)
  }
  return fallback;
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.cookie = `cf-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }
}

export function LocaleProvider({ children, initialLocale = defaultLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  // The server renders in the language saved in the cf-locale cookie. Start
  // with it so the first render matches the server HTML. If the browser has a
  // different saved language (e.g. the cookie was cleared), switch as a
  // low-priority update once the page has loaded.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = readSavedLocale(initialLocale);
    if (saved !== initialLocale) startTransition(() => setLocaleState(saved));
  }, [initialLocale]);

  // Let the server know the language too (used to make the AI reply in it)
  useEffect(() => {
    writeLocaleCookie(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  const messages = getMessages(locale);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem('cf-locale', newLocale);
    } catch {
      // Storage blocked; the cookie still remembers it
    }
    writeLocaleCookie(newLocale);
    setLocaleState(newLocale);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
