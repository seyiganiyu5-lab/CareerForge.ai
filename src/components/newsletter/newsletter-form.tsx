'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subscribeSchema, type SubscribeFormValues } from '@/lib/validation/newsletter';
import { useLocale } from '@/i18n/provider';
import { useTranslations } from '@/i18n/provider';
import type { NewsletterFormState, NewsletterSource } from '@/types/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewsletterFormProps {
  /** Where the form is placed — stored in DB for analytics */
  source?: NewsletterSource;
  /** Variant: 'default' for inline, 'compact' for footer, 'hero' for landing/blog hero */
  variant?: 'default' | 'compact' | 'hero';
  /** Additional CSS classes */
  className?: string;
}

const stateConfig: Record<
  NonNullable<NewsletterFormState>,
  { icon: typeof CheckCircle2; variant: 'success' | 'warning' | 'error' }
> = {
  success: { icon: CheckCircle2, variant: 'success' },
  already_subscribed: { icon: Mail, variant: 'warning' },
  error: { icon: AlertCircle, variant: 'error' },
  loading: { icon: Loader2, variant: 'success' },
  idle: { icon: Send, variant: 'success' },
};

export default function NewsletterForm({
  source = 'landing',
  variant = 'default',
  className,
}: NewsletterFormProps) {
  const t = useTranslations('newsletterForm');
  const { locale } = useLocale();
  const [formState, setFormState] = useState<NewsletterFormState>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      language: locale as 'en' | 'fr',
      source,
    },
  });

  const onSubmit = useCallback(
    async (data: SubscribeFormValues) => {
      setFormState('loading');
      setServerMessage('');

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            language: locale,
            source,
          }),
        });

        const result = await response.json();

        if (response.status === 429) {
          setFormState('error');
          setServerMessage('rate_limited');
          return;
        }

        if (result.message === 'already_subscribed') {
          setFormState('already_subscribed');
          reset();
          return;
        }

        if (result.success) {
          setFormState(result.message === 'reactivated' ? 'already_subscribed' : 'success');
          reset();
        } else {
          setFormState('error');
        }
      } catch {
        setFormState('error');
      }
    },
    [locale, source, reset]
  );

  // Determine what to display based on state
  const isInteractive = formState === 'idle' || formState === 'error';
  const isResultState = ['success', 'already_subscribed'].includes(formState);

  // Map server message to translation key
  const resultTitleKey = (() => {
    if (serverMessage === 'rate_limited') return 'rateLimited.title' as const;
    if (formState === 'success') return 'success.title' as const;
    if (formState === 'already_subscribed') return 'alreadySubscribed.title' as const;
    return 'error.title' as const;
  })();

  const resultDescKey = (() => {
    if (serverMessage === 'rate_limited') return 'rateLimited.description' as const;
    if (formState === 'success') return 'success.description' as const;
    if (formState === 'already_subscribed') return 'alreadySubscribed.description' as const;
    return 'error.description' as const;
  })();

  const { icon: ResultIcon } = stateConfig[formState];

  const isCompact = variant === 'compact';
  const isHero = variant === 'hero';

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label={t('ariaButton')}
      >
        <div
          className={cn(
            'flex gap-3',
            isCompact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row',
            isHero && 'max-w-lg mx-auto'
          )}
        >
          {/* Email Input */}
          <div className="flex-1 min-w-0">
            <Input
              type="email"
              autoComplete="email"
              placeholder={t('placeholder')}
              aria-label={t('ariaLabel')}
              disabled={!isInteractive}
              {...register('email')}
              className={cn(
                'h-11 px-4 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground font-body transition-colors',
                'focus-visible:ring-brand/50 focus-visible:border-brand',
                'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
                isHero && 'h-12 text-base bg-card/80 backdrop-blur-sm',
                isCompact && 'h-10 text-sm'
              )}
            />
            <AnimatePresence>
              {errors.email && isInteractive && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="text-destructive text-xs mt-1.5 font-body"
                  role="alert"
                >
                  {errors.email.message === 'Email is required'
                    ? t('validation.required')
                    : errors.email.message === 'Email is too long'
                      ? t('validation.tooLong')
                      : t('validation.invalid')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isInteractive}
            className={cn(
              'shrink-0 gap-2 font-body font-medium rounded-xl transition-all',
              isHero && 'h-12 px-8 text-base',
              isCompact && 'h-10 px-5 text-sm'
            )}
            aria-label={t('ariaButton')}
          >
            {formState === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="sr-only">{t('buttonLoading')}</span>
                <span>{t('buttonLoading')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('button')}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Result States */}
      <AnimatePresence mode="wait">
        {isResultState && (
          <motion.div
            key={formState}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'mt-4 rounded-xl px-5 py-4 font-body',
              formState === 'success'
                ? 'bg-emerald/10 text-emerald dark:bg-emerald/15'
                : 'bg-amber/10 text-amber-700 dark:text-amber-400 dark:bg-amber/10'
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <ResultIcon
                className={cn(
                  'w-5 h-5 mt-0.5 shrink-0',
                  formState === 'success' ? 'text-emerald' : 'text-amber-600 dark:text-amber-400'
                )}
              />
              <div>
                <p className="font-semibold text-sm">{t(resultTitleKey)}</p>
                <p className="text-xs mt-1 opacity-80">{t(resultDescKey)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {formState === 'error' && serverMessage === 'rate_limited' && (
          <motion.div
            key="rate-limited"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-xl px-5 py-4 bg-destructive/10 text-destructive font-body"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t('rateLimited.title')}</p>
                <p className="text-xs mt-1 opacity-80">{t('rateLimited.description')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {formState === 'error' && serverMessage !== 'rate_limited' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-xl px-5 py-4 bg-destructive/10 text-destructive font-body"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t('error.title')}</p>
                <p className="text-xs mt-1 opacity-80">{t('error.description')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy note (only show in default/hero variants) */}
      {!isCompact && (
        <p className="text-xs text-muted-foreground mt-3 font-body">
          {t('privacy')}
        </p>
      )}
    </div>
  );
}