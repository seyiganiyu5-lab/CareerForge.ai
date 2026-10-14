'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { FileText, PenLine, TrendingUp, ListChecks, Search, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import type { CareerGoal } from '@/lib/auth/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CareerGoalStepProps {
  onNext: (goals: CareerGoal[]) => void;
  onBack: () => void;
  initialValues?: CareerGoal[];
}

const CAREER_GOALS: { key: CareerGoal; icon: React.ElementType; translationKey: string }[] = [
  { key: 'build_resume', icon: FileText, translationKey: 'buildResume' },
  { key: 'create_cover_letter', icon: PenLine, translationKey: 'createCoverLetter' },
  { key: 'improve_resume', icon: TrendingUp, translationKey: 'improveResume' },
  { key: 'track_applications', icon: ListChecks, translationKey: 'trackApplications' },
  { key: 'find_jobs', icon: Search, translationKey: 'findJobs' },
];

export default function CareerGoalStep({ onNext, onBack, initialValues }: CareerGoalStepProps) {
  const t = useTranslations('auth.onboarding.careerGoal');
  const tCommon = useTranslations('auth.common');
  const tm = useTranslations('app.misc');
  const [selected, setSelected] = useState<CareerGoal[]>(initialValues || []);

  function toggleGoal(goal: CareerGoal) {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
  };

  const staggerItem: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
          {t('title')}
        </h2>
        <p className="text-sm text-muted-foreground font-body mt-1">
          {t('subtitle')}
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {CAREER_GOALS.map(({ key, icon: Icon, translationKey }) => {
          const isSelected = selected.includes(key);

          return (
            <motion.button
              key={key}
              type="button"
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleGoal(key)}
              className={cn(
                'relative flex items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer group',
                isSelected
                  ? 'border-brand bg-brand/5 shadow-md shadow-brand/10'
                  : 'border-border/60 bg-card hover:border-border hover:bg-accent/50',
              )}
            >
              {/* Checkmark overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-brand"
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors duration-200',
                  isSelected
                    ? 'bg-brand/15 text-brand'
                    : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground',
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h3
                  className={cn(
                    'text-sm font-semibold font-body transition-colors duration-200',
                    isSelected ? 'text-brand' : 'text-foreground',
                  )}
                >
                  {t(`${translationKey}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                  {t(`${translationKey}.description`)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selection count hint */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground font-body text-center mt-3"
          >
            {tm('selectedCount', { count: selected.length })}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex items-center gap-3 pt-3"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 font-body"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {tCommon('back')}
        </Button>
        <Button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onNext(selected)}
          className="flex-1 h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tCommon('next')}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </motion.div>
    </div>
  );
}