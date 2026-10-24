'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('auth.common');
  const tErrors = useTranslations('auth.errors');
  const tGoogle = useTranslations('auth.google');
  const { login, googleSignIn } = useAuth();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle OAuth redirect errors (e.g. /login?error=google_not_configured)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMap: Record<string, string> = {
        google_not_configured: tGoogle('notConfigured'),
        google_access_denied: tGoogle('accessDenied'),
        google_no_email: tGoogle('noEmail'),
        google_auth_failed: tGoogle('authFailed'),
        google_timeout: tGoogle('timeout'),
      };
      setFormError(errorMap[error] || tErrors('unknown'));
    }
  }, [searchParams, tGoogle, tErrors]);

  const loginSchema = z.object({
    email: z.email(t('errors.emailInvalid')),
    password: z.string().min(1, t('errors.passwordRequired')),
    rememberMe: z.boolean(),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      if (result.success) {
        // Use full page navigation to ensure the auth cookie is properly
        // available on the next page load (avoids soft-nav cookie issues through proxies)
        const redirect = searchParams.get('redirect');
        window.location.href = redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\') ? redirect : '/home';
        return; // Don't update state — the page will fully reload
      } else if (result.needsVerification) {
        window.location.href = `/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`;
        return;
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
            className="space-y-5"
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

            {/* Email Field */}
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

            {/* Password Field */}
            <motion.div variants={staggerItem}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-body text-sm font-medium">
                        {tCommon('password')}
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-brand hover:text-brand/80 transition-colors font-body"
                      >
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('passwordPlaceholder')}
                        className="h-11"
                        id={form.formState.errors.password ? 'password' : undefined}
                        aria-invalid={!!form.formState.errors.password}
                        readOnly
                        onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Remember Me */}
            <motion.div variants={staggerItem}>
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-muted-foreground leading-none cursor-pointer font-body select-none"
                      onClick={() => field.onChange(!field.value)}
                    >
                      {t('rememberMe')}
                    </label>
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
                    {t('loggingIn')}
                  </>
                ) : (
                  t('loginButton')
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
              <AuthFooter type="login" />
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </AuthCard>
  );
}