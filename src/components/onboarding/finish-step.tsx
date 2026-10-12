'use client';

import { useSyncExternalStore, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Floating particles (subtle confetti-like dots)                    */
/* ------------------------------------------------------------------ */
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 4,
        color: i % 3 === 0 ? 'var(--color-brand)' : i % 3 === 1 ? 'var(--color-violet)' : 'var(--color-emerald)',
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated success checkmark (circle + check path)                  */
/* ------------------------------------------------------------------ */
function SuccessCheckmark() {
  return (
    <div className="relative flex items-center justify-center mb-8">
      {/* Outer glow */}
      <motion.div
        className="absolute w-28 h-28 rounded-full bg-emerald/10 blur-xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="relative z-10">
        {/* Background circle */}
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          stroke="var(--color-emerald)"
          strokeWidth="3"
          fill="var(--color-emerald)"
          fillOpacity="0.1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Inner filled circle */}
        <motion.circle
          cx="40"
          cy="40"
          r="30"
          fill="var(--color-emerald)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
        />
        {/* Checkmark */}
        <motion.path
          d="M26 40 L36 50 L54 32"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Finish Step                                                       */
/* ------------------------------------------------------------------ */
export default function FinishStep() {
  const t = useTranslations('auth.onboarding.finish');
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-4 py-6 overflow-hidden">
      <FloatingParticles />

      {/* Checkmark */}
      {mounted && <SuccessCheckmark />}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: mounted ? 1.1 : 0 }}
        className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3 relative z-10"
      >
        {t('title')}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: mounted ? 1.25 : 0 }}
        className="text-sm text-muted-foreground font-body max-w-xs leading-relaxed mb-8 relative z-10"
      >
        {t('description')}
      </motion.p>

      {/* Go to Dashboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: mounted ? 1.4 : 0 }}
        className="relative z-10"
      >
        <Button
          onClick={() => router.push('/home')}
          size="lg"
          className="bg-brand hover:bg-brand/90 text-white font-body font-semibold h-12 px-8 text-base rounded-xl shadow-lg shadow-brand/25 hover:shadow-brand/40 transition-all duration-300"
        >
          {t('goToDashboard')}
        </Button>
      </motion.div>
    </div>
  );
}