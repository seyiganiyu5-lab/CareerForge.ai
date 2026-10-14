'use client';

import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Briefcase,
  Wand2,
  PenLine,
  Eye,
  Check,
} from 'lucide-react';
import type { CoverLetterSectionKey } from '@/types/cover-letter';
import { useTranslations } from '@/i18n/provider';

interface StepNavProps {
  activeStep: number;
  onStepChange: (step: number) => void;
  isMobile?: boolean;
}

const STEPS = [
  { key: 'sender-info' as CoverLetterSectionKey, labelKey: 'stepPersonalInfo', shortLabelKey: 'stepPersonalShort', icon: User, descriptionKey: 'stepPersonalDesc' },
  { key: 'recipient-info' as CoverLetterSectionKey, labelKey: 'stepRecipient', shortLabelKey: 'stepRecipientShort', icon: Building2, descriptionKey: 'stepRecipientDesc' },
  { key: 'job-details' as CoverLetterSectionKey, labelKey: 'stepJobDetails', shortLabelKey: 'stepJobShort', icon: Briefcase, descriptionKey: 'stepJobDesc' },
  { key: 'ai-generate' as CoverLetterSectionKey, labelKey: 'stepAiGenerate', shortLabelKey: 'stepAiShort', icon: Wand2, descriptionKey: 'stepAiDesc' },
  { key: 'content' as CoverLetterSectionKey, labelKey: 'stepContent', shortLabelKey: 'stepContentShort', icon: PenLine, descriptionKey: 'stepContentDesc' },
  { key: 'customization' as CoverLetterSectionKey, labelKey: 'stepDesign', shortLabelKey: 'stepDesignShort', icon: Eye, descriptionKey: 'stepDesignDesc' },
];

export { STEPS };

export function StepNav({ activeStep, onStepChange, isMobile }: StepNavProps) {
  const t = useTranslations('app.coverLetterEditor');
  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Scroll container — mobile shows thin scrollbar as a cue, desktop hides it */}
      <div
        className={`w-full overflow-x-auto ${
          isMobile
            ? 'pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent'
            : '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2'
        } ${isMobile ? 'px-1' : ''}`}
      >
        <div
          className={`flex items-center min-w-fit mx-auto w-fit ${
            isMobile ? 'gap-0 justify-center' : 'gap-0 justify-center'
          }`}
        >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <div key={step.key} className="flex items-center shrink-0">
              <button
                onClick={() => onStepChange(index)}
                className={`group flex items-center ${
                  isMobile ? 'flex-col gap-0.5 px-1 py-1 min-w-[44px]' : 'gap-2 px-2.5 py-1.5'
                } rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand/10 text-brand shadow-sm'
                    : isCompleted
                    ? 'text-brand/60 hover:text-brand hover:bg-brand/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'w-7 h-7 bg-brand text-white shadow-md shadow-brand/30'
                      : isCompleted
                      ? 'w-6 h-6 bg-brand/20 text-brand'
                      : 'w-6 h-6 bg-muted text-muted-foreground group-hover:bg-muted-foreground/10'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <Icon className={isActive ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                  )}
                </div>
                {!isMobile && (
                  <div className="flex flex-col">
                    {/* Full label on wide screens, short label on medium screens */}
                    <span className={`font-medium leading-tight hidden xl:inline ${isActive ? 'text-brand' : ''} text-[11px]`}>
                      {t(step.labelKey)}
                    </span>
                    <span className={`font-medium leading-tight xl:hidden ${isActive ? 'text-brand' : ''} text-[11px]`}>
                      {t(step.shortLabelKey)}
                    </span>
                  </div>
                )}
                {isMobile && (
                  <span className={`font-medium leading-tight text-center ${isActive ? 'text-brand' : 'text-muted-foreground'} text-[9px]`}>
                    {t(step.shortLabelKey)}
                  </span>
                )}
              </button>

              {/* Connector Line — desktop only */}
              {index < STEPS.length - 1 && !isMobile && (
                <div className="w-4 lg:w-5 xl:w-6 h-px mx-0.5 shrink-0">
                  <div
                    className={`h-full transition-all duration-300 ${
                      index < activeStep ? 'bg-brand/40' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
