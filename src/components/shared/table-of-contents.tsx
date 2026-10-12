'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  title: string;
  level?: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string;
}

export default function TableOfContents({ items, activeId: externalActiveId }: TableOfContentsProps) {
  const [internalActive, setInternalActive] = useState(items[0]?.id ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const currentActive = externalActiveId !== undefined ? externalActiveId : internalActive;

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (externalActiveId !== undefined) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInternalActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items, externalActiveId]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-24" aria-label="Table of Contents">
      <ul className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {items.map((item) => {
          const isActive = currentActive === item.id;
          const indent = item.level === 3 ? 'pl-4' : 'pl-2';
          return (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={cn(
                  'w-full text-left text-sm py-1.5 transition-colors border-l-2',
                  indent,
                  isActive
                    ? 'border-brand text-brand font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}