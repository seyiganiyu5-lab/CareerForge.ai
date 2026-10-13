'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import AuthCard from '@/components/auth/auth-card';
import PasswordInput from '@/components/auth/password-input';
import PasswordStrength from '@/components/auth/password-strength';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.25 } },
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('auth.resetPassword');
  const tCommon = useTranslations('auth.common');
  const tErrors = useTranslations('auth.errors');
  const { resetPassword, isAuthenticated, isLoading } = useAuth();

  // The reset link (via /auth/confirm) signs the user in before landing here
  const linkError = searchParams.get('error');
  const hasValidLink = !linkError && (isLoading || isAuthenticated);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSchema = z
    .object({
      password: z
        .string()
        .min(1, t('errors.passwordRequired'))
        .min(8, t('errors.passwordMinLength')),
      confirmPassword: z.string().min(1, t('errors.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('errors.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type ResetFormValues = z.infer<typeof resetSchema>;

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = form.watch('password');

  async function onSubmit(values: ResetFormValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await resetPassword(values.password);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setFormError(result.error || tErrors('unknown'));
      }
    } catch {
      setFormError(tErrors('network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── Invalid or expired link ─── */
  if (!hasValidLink && !isSuccess) {
    return (
      <AuthCard title={t('title')} subtitle={t('subtitle')}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-900/50 dark:bg-red-950/40"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300 font-body">
              {t('errors.invalidOrExpiredToken')}
            </p>
          </motion.div>
          <motion.div variants={staggerItem} className="text-center">
            <Link href="/forgot-password" className="w-full inline-block">
              <Button
                variant="outline"
                className="w-full h-11 font-body text-sm font-medium"
              >
                Request New Link
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          /* ─── Form State ─── */
          <motion.div
            key="form"
            variants={fadeScale}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <motion.div
                  className="space-y-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {/* Error */}
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-900/50 dark:bg-red-950/40"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-700 dark:text-red-300 font-body">
                        {formError}
                      </p>
                    </motion.div>
                  )}

                  {/* New Password */}
                  <motion.div variants={staggerItem}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body text-sm font-medium">
                            {tCommon('password')}
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t('newPasswordPlaceholder')}
                              className="h-11"
                              aria-invalid={!!form.formState.errors.password}
                            />
                          </FormControl>
                          <FormMessage />
                          <PasswordStrength password={field.value} />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={staggerItem}>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body text-sm font-medium">
                            {tCommon('confirmPassword')}
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t('confirmPasswordPlaceholder')}
                              className="h-11"
                              aria-invalid={!!form.formState.errors.confirmPassword}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={staggerItem}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium text-sm transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('resetting')}
                        </>
                      ) : (
                        t('submitButton')
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        ) : (
          /* ─── Success State ─── */
          <motion.div
            key="success"
            variants={fadeScale}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center text-center space-y-5 py-4"
          >
            {/* Checkmark Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.35 }}
                className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Success Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-heading text-foreground">
                {t('success.title')}
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
                {t('success.subtitle')}
              </p>
            </div>

            {/* Sign In Button */}
            <Link href="/login" className="w-full pt-2">
              <Button
                className="w-full h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium text-sm transition-all"
              >
                {t('success.signInButton')}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}

function ResetPasswordFallback() {
  return (
    <AuthCard title="" subtitle="">
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}