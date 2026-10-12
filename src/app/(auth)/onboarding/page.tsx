'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import type { CareerLevel, CareerGoal, OnboardingData } from '@/lib/auth/types';
import StepIndicator from '@/components/onboarding/step-indicator';
import WelcomeStep from '@/components/onboarding/welcome-step';
import PersonalInfoStep from '@/components/onboarding/personal-info-step';
import CareerLevelStep from '@/components/onboarding/career-level-step';
import CareerGoalStep from '@/components/onboarding/career-goal-step';
import FinishStep from '@/components/onboarding/finish-step';
import { Button } from '@/components/ui/button';

const TOTAL_STEPS = 5;

// Slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const tSkip = useTranslations('auth.onboarding');
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  // Pre-fill data from user if available (initialize from user, no effect needed)
  const initialPersonalInfo = user && (user.first_name || user.last_name || user.country || user.job_title)
    ? {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        country: user.country || '',
        jobTitle: user.job_title || '',
      }
    : null;

  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [careerLevel, setCareerLevel] = useState<CareerLevel | null>(user?.career_level || null);
  const [careerGoals, setCareerGoals] = useState<CareerGoal[] | null>(null);
  const [onboardingCalled, setOnboardingCalled] = useState(false);
  const onboardingCalledRef = useRef(false);

  const completeOnboardingFlow = useCallback(async (pInfo: NonNullable<typeof personalInfo>, level: CareerLevel, goals: CareerGoal[]) => {
    if (onboardingCalledRef.current) return;
    onboardingCalledRef.current = true;
    setOnboardingCalled(true);
    setIsCompleting(true);

    try {
      const data: OnboardingData = {
        firstName: pInfo.firstName,
        lastName: pInfo.lastName,
        country: pInfo.country,
        jobTitle: pInfo.jobTitle,
        careerLevel: level,
        careerGoals: goals,
      };
      const result = await completeOnboarding(data);
      if (result.success) {
        router.push('/home');
      } else {
        setIsCompleting(false);
        setOnboardingCalled(false);
        onboardingCalledRef.current = false;
      }
    } catch {
      setIsCompleting(false);
      setOnboardingCalled(false);
      onboardingCalledRef.current = false;
    }
  }, [completeOnboarding, router]);

  function goToStep(step: number) {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);

    // If navigating to finish step and we have all data, trigger onboarding
    if (step === 4 && personalInfo && careerLevel && careerGoals && !onboardingCalled) {
      completeOnboardingFlow(personalInfo, careerLevel, careerGoals);
    }
  }

  function handleSkip() {
    if (currentStep < 4) {
      // If we have enough data, jump to finish
      if (personalInfo && careerLevel && careerGoals) {
        goToStep(4);
      } else {
        // Go to next step
        goToStep(currentStep + 1);
      }
    }
  }

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Step Indicator — hidden on welcome & finish */}
      <AnimatePresence mode="wait">
        {currentStep > 0 && currentStep < 4 && (
          <motion.div
            key="step-indicator"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mb-6 w-full"
          >
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 360 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            {currentStep === 0 && <WelcomeStep onNext={() => goToStep(1)} />}

            {currentStep === 1 && (
              <PersonalInfoStep
                onNext={(data) => {
                  setPersonalInfo(data);
                  goToStep(2);
                }}
                onBack={() => goToStep(0)}
                initialData={personalInfo || undefined}
              />
            )}

            {currentStep === 2 && (
              <CareerLevelStep
                onNext={(level) => {
                  setCareerLevel(level);
                  goToStep(3);
                }}
                onBack={() => goToStep(1)}
                initialValue={careerLevel || undefined}
              />
            )}

            {currentStep === 3 && (
              <CareerGoalStep
                onNext={(goals) => {
                  setCareerGoals(goals);
                  goToStep(4);
                }}
                onBack={() => goToStep(2)}
                initialValues={careerGoals || undefined}
              />
            )}

            {currentStep === 4 && <FinishStep />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip button — subtle, bottom-right */}
      {currentStep > 0 && currentStep < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isCompleting}
            className="text-xs text-muted-foreground hover:text-foreground font-body h-7 px-3"
          >
            {tSkip('skip')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}