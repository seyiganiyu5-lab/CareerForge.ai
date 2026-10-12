'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import AuthCard from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';

const fadeScale = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.25 } },
};

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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('auth.verifyEmail');
  const tErrors = useTranslations('auth.errors');
  const { resendVerification } = useAuth();

  // /auth/confirm sends users here after they click the link in their email
  const verified = searchParams.get('verified');
  const linkError = searchParams.get('error');
  const email = searchParams.get('email');

  const verificationState: 'idle' | 'success' | 'error' = verified ? 'success' : linkError ? 'error' : 'idle';
  const verificationError = linkError ? t('errors.invalidToken') : null;
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ─── Resend verification ─── */
  const handleResend = useCallback(async () => {
    if (!email) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendMessage({ type: 'success', text: t('errors.resendSuccess') });
      } else {
        setResendMessage({ type: 'error', text: result.error || tErrors('unknown') });
      }
    } catch {
      setResendMessage({ type: 'error', text: t('errors.resendFailed') });
    } finally {
      setIsResending(false);
      setTimeout(() => setResendMessage(null), 4000);
    }
  }, [email, resendVerification, t, tErrors]);

  /* ─── Success state ─── */
  if (verificationState === 'success') {
    return (
      <AuthCard title="" subtitle="">
        <motion.div
          className="flex flex-col items-center text-center space-y-5 py-4"
          variants={fadeScale}
          initial="initial"
          animate="animate"
        >
          {/* Checkmark */}
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

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-heading text-foreground">
              {t('success.title')}
            </h3>
            <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
              {t('success.subtitle')}
            </p>
          </div>

          {/* Continue Button */}
          <Link href="/onboarding" className="w-full pt-2">
            <Button className="w-full h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium text-sm transition-all">
              {t('success.continueButton')}
            </Button>
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  /* ─── Error state (from auto-verify) ─── */
  if (verificationState === 'error') {
    return (
      <AuthCard title={t('title')} subtitle={''}>
        <motion.div
          className="flex flex-col items-center text-center space-y-5 py-2"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Error Icon */}
          <motion.div
            variants={staggerItem}
            className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center"
          >
            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </motion.div>

          {/* Error Message */}
          <motion.div variants={staggerItem} className="space-y-2">
            <h3 className="text-lg font-semibold font-heading text-foreground">
              Verification Failed
            </h3>
            <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
              {verificationError}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div variants={staggerItem} className="flex flex-col gap-3 w-full pt-1">
            {email && (
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
                {t('resendButton')}
              </Button>
            )}
            <Link href="/login" className="w-full">
              <Button
                variant="ghost"
                className="w-full h-11 text-brand hover:text-brand/80 font-body text-sm font-medium"
              >
                Back to Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  /* ─── Idle / waiting state ─── */
  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <motion.div
        className="flex flex-col items-center text-center space-y-5 py-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Mail Icon with pulse */}
        <motion.div
          variants={staggerItem}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center"
          >
            <Mail className="w-8 h-8 text-brand" />
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-brand/20"
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Email address shown */}
        {email && (
          <motion.p
            variants={staggerItem}
            className="text-sm text-foreground font-medium font-body"
          >
            {email}
          </motion.p>
        )}

        {/* Subtitle message */}
        <motion.p
          variants={staggerItem}
          className="text-sm text-muted-foreground font-body max-w-xs mx-auto"
        >
          {t('subtitle')}
        </motion.p>

        {/* Resend feedback */}
        {resendMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`w-full text-xs font-medium font-body px-4 py-2.5 rounded-lg border ${
              resendMessage.type === 'success'
                ? 'text-emerald border-emerald/20 bg-emerald/5'
                : 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40'
            }`}
          >
            {resendMessage.text}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={staggerItem} className="flex flex-col gap-3 w-full pt-1">
          {email && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="w-full h-11 font-body text-sm font-medium"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('resending')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t('resendButton')}
                </>
              )}
            </Button>
          )}

          <Link href="/login" className="w-full">
            <Button
              variant="ghost"
              className="w-full h-11 text-muted-foreground hover:text-foreground font-body text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </AuthCard>
  );
}

function VerifyEmailFallback() {
  return (
    <AuthCard title="" subtitle="">
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}