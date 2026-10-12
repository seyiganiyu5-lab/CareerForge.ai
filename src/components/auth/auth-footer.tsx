'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/provider';

interface AuthFooterProps {
  type: 'login' | 'signup';
}

export default function AuthFooter({ type }: AuthFooterProps) {
  const t = useTranslations(type === 'login' ? 'auth.login' : 'auth.signup');

  return (
    <p className="text-center text-sm text-muted-foreground font-body">
      {type === 'login' ? (
        <>
          {t('noAccount')}{' '}
          <Link
            href="/signup"
            className="text-brand hover:text-brand/80 font-medium transition-colors"
          >
            {t('createAccount')}
          </Link>
        </>
      ) : (
        <>
          {t('hasAccount')}{' '}
          <Link
            href="/login"
            className="text-brand hover:text-brand/80 font-medium transition-colors"
          >
            {t('signIn')}
          </Link>
        </>
      )}
    </p>
  );
}