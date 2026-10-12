'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import AuthCard from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.25 } },
};

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('auth.common');
  const tErrors = useTranslations('auth.errors');
  const { forgotPassword } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const forgotSchema = z.object({
    email: z.email(t('errors.emailInvalid')),
  });

  type ForgotFormValues = z.infer<typeof forgotSchema>;

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotFormValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await forgotPassword(values.email);
      if (result.success) {
        setSubmittedEmail(values.email);
      } else {
        setFormError(result.error || tErrors('unknown'));
      }
    } catch {
      setFormError(tErrors('network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!submittedEmail) return;
    setIsResending(true);
    setResendSuccess(false);
    try {
      const result = await forgotPassword(submittedEmail);
      if (result.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch {
      // silent fail
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <AnimatePresence mode="wait">
        {!submittedEmail ? (
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

                  {/* Email */}
                  <motion.div variants={staggerItem}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body text-sm font-medium">
                            {tCommon('email')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('emailPlaceholder')}
                              autoComplete="email"
                              className="h-11 font-body"
                              readOnly
                              onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                              {...field}
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
                          {t('sending')}
                        </>
                      ) : (
                        t('submitButton')
                      )}
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <motion.div variants={staggerItem} className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {t('backToLogin')}
                    </Link>
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
            className="flex flex-col items-center text-center space-y-5 py-2"
          >
            {/* Mail Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-brand" />
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald flex items-center justify-center"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
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
                    transition={{ duration: 0.4, delay: 0.6 }}
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-heading text-foreground">
                {t('success.title')}
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                {t('success.subtitle')}{' '}
                <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>
              <p className="text-xs text-muted-foreground/80 font-body">
                {t('success.description')}
              </p>
            </div>

            {/* Resend Success Message */}
            {resendSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald font-medium font-body"
              >
                Email sent successfully!
              </motion.p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full pt-1">
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="w-full h-11 font-body text-sm font-medium"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {t('success.resendLink')}
              </Button>
              <Link href="/login" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full h-11 text-brand hover:text-brand/80 font-body text-sm font-medium"
                >
                  {t('success.backToLogin')}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}