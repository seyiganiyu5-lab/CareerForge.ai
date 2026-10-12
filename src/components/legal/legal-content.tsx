'use client';

import { motion } from 'framer-motion';
import { useLegalSearch } from './legal-search';
import { Info, AlertTriangle, Lightbulb, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Highlight utility ---
function HighlightText({ text }: { text: string }) {
  const { searchQuery } = useLegalSearch();

  if (!searchQuery.trim()) return <>{text}</>;

  // Case-insensitive split and match
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const regexNoG = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
        return regexNoG.test(part) ? (
          <mark
            key={i}
            className="bg-brand/20 text-brand rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

// --- LegalSection ---
interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('mb-10 scroll-mt-24', className)}
    >
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground mb-4 flex items-start gap-3">
        <span className="text-brand mt-0.5" aria-hidden="true">#</span>
        {title}
      </h2>
      <div className="space-y-3 font-body text-muted-foreground leading-relaxed [&_p]:mb-3">
        {children}
      </div>
    </motion.section>
  );
}

// --- LegalCallout ---
interface LegalCalloutProps {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}

const calloutStyles = {
  info: {
    container: 'bg-brand/5 border-brand/20 dark:bg-brand/10',
    icon: <Info className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />,
    title: 'Note',
  },
  warning: {
    container: 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
    title: 'Important',
  },
  tip: {
    container: 'bg-emerald/5 border-emerald/20 dark:bg-emerald/10',
    icon: <Lightbulb className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />,
    title: 'Tip',
  },
};

export function LegalCallout({ type = 'info', children }: LegalCalloutProps) {
  const style = calloutStyles[type];

  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border', style.container)}>
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold text-foreground mb-1">
          {style.title}
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- LegalQuote ---
interface LegalQuoteProps {
  children: React.ReactNode;
}

export function LegalQuote({ children }: LegalQuoteProps) {
  return (
    <blockquote className="relative pl-5 py-2 my-4 border-l-2 border-brand/30">
      <Quote className="absolute -left-2 -top-1 w-5 h-5 text-brand/20" aria-hidden="true" />
      <div className="text-muted-foreground italic leading-relaxed font-body">
        {children}
      </div>
    </blockquote>
  );
}

// --- LegalParagraph (with search highlighting) ---
export function LegalParagraph({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground leading-relaxed">
      <HighlightText text={children} />
    </p>
  );
}

// --- LegalSubSection ---
interface LegalSubSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSubSection({ title, children }: LegalSubSectionProps) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="font-heading text-base font-medium text-foreground mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

// --- LegalList ---
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside ml-5 space-y-1.5 text-muted-foreground">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed pl-1">
          <HighlightText text={item} />
        </li>
      ))}
    </ul>
  );
}