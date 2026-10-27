import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The Hassify mark: an H glowing like hot metal, being forged on an anvil.
 * Same drawing as public/logo.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={cn('w-9 h-9', className)} role="img" aria-label="Hassify">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${id}-hot`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#FACC15" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}-bg)`} />
      <path
        d="M9 37 H47 C47 41.2 43.6 44 39.5 44 H38 L40.6 49.5 H44.5 V53.5 H19.5 V49.5 H23.4 L26 44 H22 C15.6 44 10.6 41.4 9 37 Z"
        fill="#fff"
      />
      <path
        d="M21.5 11.5 V30.5 M36.5 11.5 V30.5 M21.5 21 H36.5"
        fill="none"
        stroke={`url(#${id}-hot)`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="11" r="2" fill="#FACC15" />
      <circle cx="46.5" cy="19.5" r="1.6" fill="#FACC15" />
      <circle cx="43.5" cy="28.5" r="1.3" fill="#FACC15" opacity=".8" />
    </svg>
  );
}
