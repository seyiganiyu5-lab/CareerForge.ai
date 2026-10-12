'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from '@/i18n/provider';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FadeInUp, ScaleIn } from '@/lib/motion';

interface NewsletterProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function Newsletter({ variant = 'default', className }: NewsletterProps) {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('submitting');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('success');
    setEmail('');

    // Reset after 4s
    setTimeout(() => setStatus('idle'), 4000);
  }, [email]);

  if (variant === 'compact') {
    return (
      <FadeInUp
        duration={0.5}
        className={cn('flex flex-col sm:flex-row items-center gap-4', className)}
      >
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            {t('title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            required
            className="h-10 w-full sm:w-64 rounded-lg"
          />
          <Button
            type="submit"
            size="sm"
            disabled={status === 'submitting' || status === 'success'}
            className="bg-brand hover:bg-brand/90 text-white shrink-0"
          >
            {status === 'submitting' ? (
              <Send className="w-4 h-4 animate-pulse" />
            ) : status === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </FadeInUp>
    );
  }

  return (
    <FadeInUp
      duration={0.5}
      className={cn(
        'rounded-2xl bg-gradient-to-r from-brand/10 via-violet/10 to-emerald/10 p-8 md:p-12',
        className
      )}
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 mb-6">
          <Mail className="w-6 h-6 text-brand" />
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          {t('description')}
        </p>

        {status === 'success' ? (
          <ScaleIn
            className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            {t('success')}
          </ScaleIn>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('placeholder')}
              required
              className="h-12 rounded-xl bg-background border-border"
            />
            <Button
              type="submit"
              disabled={status === 'submitting'}
              className="h-12 px-6 bg-brand hover:bg-brand/90 text-white font-medium rounded-xl shrink-0"
            >
              {status === 'submitting' ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  {t('subscribing')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('subscribe')}
                </>
              )}
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          {t('privacy')}
        </p>
      </div>
    </FadeInUp>
  );
}