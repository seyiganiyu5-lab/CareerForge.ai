'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import AuthCard from '@/components/auth/auth-card';
import PasswordInput from '@/components/auth/password-input';
import PasswordStrength from '@/components/auth/password-strength';
import SocialButton from '@/components/auth/social-button';
import AuthFooter from '@/components/auth/auth-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function SignupPage() {
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('auth.common');
  const tErrors = useTranslations('auth.errors');
  const { signup, googleSignIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signupSchema = z
    .object({
      firstName: z.string().min(1, t('errors.firstNameRequired')),
      lastName: z.string().min(1, t('errors.lastNameRequired')),
      email: z.email(t('errors.emailInvalid')),
      password: z
        .string()
        .min(1, t('errors.passwordRequired'))
        .min(8, t('errors.passwordMinLength'))
        .regex(/[A-Z]/, t('errors.passwordUppercase'))
        .regex(/[a-z]/, t('errors.passwordLowercase'))
        .regex(/[0-9]/, t('errors.passwordNumber'))
        .regex(/[^A-Za-z0-9]/, t('errors.passwordSpecial')),
      confirmPassword: z.string().min(1, t('errors.confirmPasswordRequired')),
      agreeToTerms: z.literal(true, {
        message: t('errors.termsRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('errors.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: undefined as unknown as true,
    },
  });

  const watchedPassword = form.watch('password');

  async function onSubmit(values: SignupFormValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        agreeToTerms: values.agreeToTerms,
      });
      if (result.success && result.needsVerification) {
        window.location.href = `/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`;
        return;
      } else if (result.success) {
        // Use full page navigation to ensure the auth cookie is properly
        // available on the next page load (avoids soft-nav cookie issues through proxies)
        window.location.href = '/home';
        return; // Don't update state — the page will fully reload
      } else {
        setFormError(result.error || tErrors('unknown'));
      }
    } catch {
      setFormError(tErrors('network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    googleSignIn();
  }

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Error Alert */}
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

            {/* Name Row */}
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {tCommon('firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('firstNamePlaceholder')}
                        autoComplete="given-name"
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
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {tCommon('lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('lastNamePlaceholder')}
                        autoComplete="family-name"
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

            {/* Password */}
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
                        placeholder={t('passwordPlaceholder')}
                        className="h-11"
                        aria-invalid={!!form.formState.errors.password}
                        readOnly
                        onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
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
                        readOnly
                        onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div variants={staggerItem}>
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <span
                      className="text-sm text-muted-foreground leading-snug cursor-pointer font-body select-none"
                      onClick={() => field.onChange(!field.value)}
                    >
                      {t('agreeToTerms')}{' '}
                      <Link
                        href="/terms-of-service"
                        className="text-brand hover:text-brand/80 font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('termsOfService')}
                      </Link>{' '}
                      {t('privacyPolicy')}{' '}
                      <Link
                        href="/privacy-policy"
                        className="text-brand hover:text-brand/80 font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('privacyPolicyLink')}
                      </Link>
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={staggerItem}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium text-sm transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('signupButton')
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={staggerItem} className="relative flex items-center py-1">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-muted-foreground font-body">
                {tCommon('orContinueWith')}
              </span>
              <Separator className="flex-1" />
            </motion.div>

            {/* Google Button */}
            <motion.div variants={staggerItem}>
              <SocialButton
                onClick={handleGoogleSignIn}
                loading={googleLoading}
              />
            </motion.div>

            {/* Footer */}
            <motion.div variants={staggerItem}>
              <AuthFooter type="signup" />
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </AuthCard>
  );
}