'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const t = useTranslations('auth.onboarding.stepIndicator');

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xs mx-auto" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <div key={index} className="flex items-center w-full last:w-auto">
            {/* Step dot / circle */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted
                    ? 'var(--color-brand)'
                    : isActive
                      ? 'var(--color-brand)'
                      : 'var(--color-muted)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300',
                  isActive && 'ring-4 ring-brand/20',
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      'text-xs font-semibold font-body transition-colors duration-300',
                      isActive ? 'text-white' : 'text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium font-body transition-colors duration-300',
                  isActive || isCompleted ? 'text-brand' : 'text-muted-foreground',
                )}
              >
                {t('step')} {index + 1}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 mx-1 mb-5">
                <div className="h-0.5 w-full rounded-full bg-muted relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand"
                    initial={false}
                    animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}