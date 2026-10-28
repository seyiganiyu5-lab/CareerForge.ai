'use client';

import Link from 'next/link';
import { useSignedInDisplay } from '@/lib/auth/context';
import { useTranslations } from '@/i18n/provider';

/** Where "home" is: the dashboard when signed in, the landing page otherwise */
export function useHomeHref() {
  const { signedIn } = useSignedInDisplay();
  return signedIn ? '/home' : '/';
}

/**
 * "Home" / "Back to home" links on public pages (help, blog, legal). Signed-in
 * people go back to their dashboard and see "Dashboard" instead.
 */
export default function HomeLink({
  children,
  signedInLabel,
  className,
}: {
  children: React.ReactNode;
  signedInLabel?: React.ReactNode;
  className?: string;
}) {
  const { signedIn } = useSignedInDisplay();
  const tNav = useTranslations('dashboard.sidebar');
  return (
    <Link href={signedIn ? '/home' : '/'} className={className}>
      {signedIn ? signedInLabel ?? tNav('dashboard') : children}
    </Link>
  );
}
