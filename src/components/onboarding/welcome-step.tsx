'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const t = useTranslations('auth.onboarding.welcome');

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
        className="relative mb-8"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-brand to-violet flex items-center justify-center shadow-lg shadow-brand/25">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={1.5} />
          </div>
          {/* Decorative dots */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-violet"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3"
      >
        {t('title')}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-sm sm:text-base text-muted-foreground font-body max-w-xs mb-10 leading-relaxed"
      >
        {t('subtitle')}
      </motion.p>

      {/* Get Started Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="bg-brand hover:bg-brand/90 text-white font-body font-semibold h-12 px-8 text-base rounded-xl shadow-lg shadow-brand/25 hover:shadow-brand/40 transition-all duration-300 group"
        >
          {t('getStarted')}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </div>
  );
}