'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type AnyProps = Record<string, unknown> & { children?: React.ReactNode };

interface AnimationProps {
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** The HTML element to render (defaults to 'div') */
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

// ── FadeIn ────────────────────────────────────────────────────────────────────

/** Replaces `motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}` */
export function FadeIn({
  delay = 0,
  duration = 0.4,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: AnimationProps) {
  return (
    <Tag
      className={cn('animate-[fadeIn_var(--anim-dur)_ease-out_var(--anim-del)_both]', className)}
      style={{
        '--anim-del': `${delay}s`,
        '--anim-dur': `${duration}s`,
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── FadeInUp ─────────────────────────────────────────────────────────────────

/** Replaces `motion.div variants={fadeUp}` with delay support */
export function FadeInUp({
  delay = 0,
  duration = 0.45,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: AnimationProps) {
  return (
    <Tag
      className={cn('animate-[fadeInUp_var(--anim-dur)_ease-out_var(--anim-del)_both]', className)}
      style={{
        '--anim-del': `${delay}s`,
        '--anim-dur': `${duration}s`,
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── SlideInRight ─────────────────────────────────────────────────────────────

/** Slide in from the right with fade */
export function SlideInRight({
  delay = 0,
  duration = 0.35,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: AnimationProps) {
  return (
    <Tag
      className={cn('animate-[slideInRight_var(--anim-dur)_ease-out_var(--anim-del)_both]', className)}
      style={{
        '--anim-del': `${delay}s`,
        '--anim-dur': `${duration}s`,
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── ScaleIn ──────────────────────────────────────────────────────────────────

/** Scale in with fade */
export function ScaleIn({
  delay = 0,
  duration = 0.3,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: AnimationProps) {
  return (
    <Tag
      className={cn('animate-[scaleIn_var(--anim-dur)_ease-out_var(--anim-del)_both]', className)}
      style={{
        '--anim-del': `${delay}s`,
        '--anim-dur': `${duration}s`,
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── StaggerContainer ─────────────────────────────────────────────────────────

interface StaggerContainerProps {
  /** Delay between each child in seconds (default 0.08) */
  staggerDelay?: number;
  /** Base delay before the first child animates */
  baseDelay?: number;
  /** Duration of each child animation */
  duration?: number;
  /** The animation name to use for children */
  animation?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInRight';
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

/**
 * Wraps children with staggered CSS animation delays.
 * Each direct child gets an incrementing animation-delay.
 */
export function StaggerContainer({
  staggerDelay = 0.08,
  baseDelay = 0,
  duration = 0.45,
  animation = 'fadeInUp',
  className,
  children,
  ...rest
}: StaggerContainerProps) {
  return (
    <div className={className} {...rest}>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement<AnyProps>(child)) return child;
        const existingStyle = (child.props.style ?? {}) as React.CSSProperties;
        return React.cloneElement(child, {
          style: {
            animation: `${animation} ${duration}s ease-out ${baseDelay + i * staggerDelay}s both`,
            ...existingStyle,
          },
        });
      })}
    </div>
  );
}

// ── StaggerItem ──────────────────────────────────────────────────────────────

/** A single item that works inside StaggerContainer, or standalone with an index-based delay */
export function StaggerItem({
  delay = 0,
  duration = 0.45,
  animation = 'fadeInUp',
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: AnimationProps & { animation?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInRight' }) {
  return (
    <Tag
      className={cn(
        `animate-[var(--stagger-anim)_var(--anim-dur)_ease-out_var(--anim-del)_both]`,
        className
      )}
      style={{
        '--anim-del': `${delay}s`,
        '--anim-dur': `${duration}s`,
        '--stagger-anim': animation,
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── AnimatedCounter ──────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  /** The target number to count up to */
  target: number;
  /** Duration of the counting animation in seconds */
  duration?: number;
  /** Delay before starting the count in seconds */
  delay?: number;
  /** CSS class for the container */
  className?: string;
  /** Optional formatter function */
  formatter?: (value: number) => string;
  /** Optional prefix (e.g. '$') */
  prefix?: string;
  /** Optional suffix (e.g. '%') */
  suffix?: string;
}

/** Counts from 0 to `target` over `duration` seconds */
export function AnimatedCounter({
  target,
  duration = 1.5,
  delay = 0,
  className,
  formatter,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startRef.current = null;

      const step = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  const displayValue = formatter ? formatter(value) : `${prefix}${value}${suffix}`;

  return <span className={className}>{displayValue}</span>;
}
