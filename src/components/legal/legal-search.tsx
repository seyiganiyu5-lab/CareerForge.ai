'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useTranslations } from '@/i18n/provider';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchContextType {
  searchQuery: string;
}

export const LegalSearchContext = createContext<SearchContextType>({
  searchQuery: '',
});

export function useLegalSearch() {
  return useContext(LegalSearchContext);
}

interface LegalSearchProviderProps {
  namespace: string;
  children: React.ReactNode;
}

export function LegalSearchProvider({ namespace, children }: LegalSearchProviderProps) {
  const t = useTranslations(namespace);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <LegalSearchContext.Provider value={{ searchQuery: debouncedQuery }}>
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="pl-10 pr-10 h-11 rounded-xl bg-card border-border/60 font-body text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-brand/30"
            aria-label={t('search.placeholder')}
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              aria-label={t('search.clear')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {children}
    </LegalSearchContext.Provider>
  );
}