'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Loader2, LayoutDashboard, FileText, Mail, Sparkles, ShieldCheck, Briefcase,
  LayoutTemplate, User, CreditCard, Settings, HelpCircle, CornerDownLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/i18n/provider';
import { cn } from '@/lib/utils';

// App pages that can be found by name
const PAGES = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/home' },
  { key: 'resumeBuilder', icon: FileText, href: '/resume-builder' },
  { key: 'coverLetters', icon: Mail, href: '/cover-letters' },
  { key: 'resumeReview', icon: Sparkles, href: '/resume-review' },
  { key: 'atsChecker', icon: ShieldCheck, href: '/ats-checker' },
  { key: 'jobTracker', icon: Briefcase, href: '/job-tracker' },
  { key: 'templates', icon: LayoutTemplate, href: '/templates' },
  { key: 'profile', icon: User, href: '/profile' },
  { key: 'billing', icon: CreditCard, href: '/billing' },
  { key: 'settings', icon: Settings, href: '/settings' },
  { key: 'helpCenter', icon: HelpCircle, href: '/help' },
] as const;

interface SearchResults {
  resumes: { id: string; title: string }[];
  coverLetters: { id: string; title: string }[];
  jobs: { id: string; company_name: string; job_title: string }[];
}

interface Item {
  id: string;
  group: 'pages' | 'resumes' | 'coverLetters' | 'jobs';
  label: string;
  sub?: string;
  href: string;
  icon: React.ElementType;
}

/** Accent- and case-insensitive text for matching */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface DashboardSearchProps {
  /** 'popover': results float under the input (top bar). 'inline': results below it (phone dialog). */
  variant?: 'popover' | 'inline';
  inputId?: string;
  autoFocus?: boolean;
  /** Called after navigating to a result */
  onNavigate?: () => void;
  className?: string;
}

export default function DashboardSearch({ variant = 'popover', inputId, autoFocus, onNavigate, className }: DashboardSearchProps) {
  const t = useTranslations('dashboard.topNav');
  const tNav = useTranslations('dashboard.sidebar');
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [resultsFor, setResultsFor] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = `${inputId ?? 'search'}-results`;

  const q = query.trim();

  // The user's documents, fetched shortly after they stop typing
  useEffect(() => {
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: 'include', signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setResults({ resumes: data.resumes, coverLetters: data.coverLetters, jobs: data.jobs });
            setResultsFor(q);
          }
        })
        .catch(() => {});
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);

  const loading = q.length >= 2 && resultsFor !== q;

  const items = useMemo<Item[]>(() => {
    if (!q) return [];
    const nq = norm(q);
    const pages: Item[] = PAGES
      .filter(p => norm(tNav(p.key)).includes(nq) || norm(p.key).includes(nq))
      .map(p => ({ id: `page-${p.key}`, group: 'pages', label: tNav(p.key), href: p.href, icon: p.icon }));
    const docs: Item[] = results && resultsFor === q ? [
      ...results.resumes.map(r => ({ id: `resume-${r.id}`, group: 'resumes' as const, label: r.title, href: `/resume-builder/edit#resume=${r.id}`, icon: FileText })),
      ...results.coverLetters.map(c => ({ id: `letter-${c.id}`, group: 'coverLetters' as const, label: c.title, href: `/cover-letters/edit#letter=${c.id}`, icon: Mail })),
      ...results.jobs.map(j => ({
        id: `job-${j.id}`, group: 'jobs' as const, label: j.company_name, sub: j.job_title,
        href: `/job-tracker?q=${encodeURIComponent(j.company_name)}`, icon: Briefcase,
      })),
    ] : [];
    return [...pages, ...docs];
  }, [q, results, resultsFor, tNav]);

  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  // Close when clicking outside
  useEffect(() => {
    if (variant !== 'popover' || !open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [variant, open]);

  const go = (item: Item) => {
    const [path] = item.href.split(/[#?]/);
    setOpen(false);
    setQuery('');
    onNavigate?.();
    // The editors read the document id from the URL hash when they load,
    // so reload when we're already on that editor
    if (item.href.includes('#') && path === pathname) {
      window.location.href = item.href;
      window.location.reload();
    } else {
      router.push(item.href);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive(i => (items.length ? (Math.min(i, items.length - 1) + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => (items.length ? (Math.min(i, items.length - 1) - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      const item = items[activeIndex];
      if (item) { e.preventDefault(); go(item); }
    } else if (e.key === 'Escape') {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const showPanel = variant === 'inline' ? !!q : open && !!q;
  const groups: Item['group'][] = ['pages', 'resumes', 'coverLetters', 'jobs'];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Search className="absolute left-3 top-[18px] -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={showPanel && items[activeIndex] ? `${listId}-${items[activeIndex].id}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        placeholder={t('searchPlaceholder')}
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={cn(
          'pl-9 lg:pr-12 h-9 bg-muted/50 border-transparent font-body text-sm',
          'focus:bg-background focus:border-border transition-all',
        )}
      />
      {variant === 'popover' && !q && (
        <kbd className="hidden lg:flex absolute right-3 top-[18px] -translate-y-1/2 items-center gap-1 pointer-events-none">
          <span className="inline-flex items-center rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">
            ⌘K
          </span>
        </kbd>
      )}

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            'overflow-y-auto font-body',
            variant === 'popover'
              ? 'absolute left-0 right-0 top-full mt-2 max-h-[70vh] rounded-xl border border-border bg-popover shadow-xl z-50 py-2'
              : 'mt-3 max-h-[60dvh] py-1',
          )}
        >
          {groups.map(group => {
            const groupItems = items.filter(i => i.group === group);
            if (!groupItems.length) return null;
            return (
              <div key={group} role="group" aria-label={t(`group_${group}`)} className="py-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`group_${group}`)}
                </p>
                {groupItems.map(item => {
                  const index = items.indexOf(item);
                  const Icon = item.icon;
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => go(item)}
                      className={cn(
                        'mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm',
                        isActive ? 'bg-accent text-accent-foreground' : 'text-foreground',
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label || t('untitled')}
                        {item.sub && <span className="text-muted-foreground"> · {item.sub}</span>}
                      </span>
                      {isActive && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {loading && (
            <p className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> {t('searching')}
            </p>
          )}
          {!loading && items.length === 0 && (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t('noResults', { query: q })}</p>
          )}
        </div>
      )}
    </div>
  );
}
