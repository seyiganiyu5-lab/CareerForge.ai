import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The Hassify mark ("Ascent"): two chevrons rising, level by level, on the
 * blue-to-violet tile. Same drawing as public/logo.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={cn('w-9 h-9', className)} role="img" aria-label="Hassify">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}-bg)`} />
      <path d="M17.3 38.3 L32 23.6 L46.7 38.3" fill="none" stroke="#fff" strokeWidth="6.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.3 48.1 L32 33.4 L46.7 48.1" fill="none" stroke="#BFDBFE" strokeWidth="6.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
