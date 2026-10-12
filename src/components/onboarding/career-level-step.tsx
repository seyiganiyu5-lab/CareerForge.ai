'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Briefcase, Laptop, ArrowLeftRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import type { CareerLevel } from '@/lib/auth/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CareerLevelStepProps {
  onNext: (level: CareerLevel) => void;
  onBack: () => void;
  initialValue?: CareerLevel;
}

const CAREER_LEVELS: { key: CareerLevel; icon: React.ElementType }[] = [
  { key: 'student', icon: GraduationCap },
  { key: 'graduate', icon: Award },
  { key: 'professional', icon: Briefcase },
  { key: 'freelancer', icon: Laptop },
  { key: 'career_changer', icon: ArrowLeftRight },
];

// Map translation keys — careerChanger in JSON maps to career_changer in type
function getTranslationKey(level: CareerLevel): string {
  switch (level) {
    case 'career_changer':
      return 'careerChanger';
    default:
      return level;
  }
}

export default function CareerLevelStep({ onNext, onBack, initialValue }: CareerLevelStepProps) {
  const t = useTranslations('auth.onboarding.careerLevel');
  const tCommon = useTranslations('auth.common');
  const [selected, setSelected] = useState<CareerLevel | undefined>(initialValue);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
  };

  const staggerItem = {
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
        {CAREER_LEVELS.map(({ key, icon: Icon }) => {
          const isSelected = selected === key;
          const tKey = getTranslationKey(key);

          return (
            <motion.button
              key={key}
              type="button"
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(key)}
              className={cn(
                'relative flex items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer group',
                isSelected
                  ? 'border-brand bg-brand/5 shadow-md shadow-brand/10'
                  : 'border-border/60 bg-card hover:border-border hover:bg-accent/50',
              )}
            >
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
                  {t(`${tKey}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                  {t(`${tKey}.description`)}
                </p>
              </div>

              {/* Selected indicator dot */}
              {isSelected && (
                <motion.div
                  layoutId="career-level-indicator"
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex items-center gap-3 pt-5"
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
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
          className="flex-1 h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tCommon('next')}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </motion.div>
    </div>
  );
}