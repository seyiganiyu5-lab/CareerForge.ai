'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MfaPanel from './mfa-panel';

/**
 * Wraps every admin page: only site admins, and only after the code from
 * their authenticator app (the server checks the same thing on every request).
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('app.adminMfa');
  const tl = useTranslations('app.adminLeads');
  const { user, isLoading } = useAuth();

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!user?.is_admin) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="mt-4 text-muted-foreground font-body">{tl('notAdmin')}</p>
      </div>
    );
  }
  if (user.admin_mfa === 'verified' || user.admin_mfa === 'off') return <>{children}</>;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand" /> {t('title')}</CardTitle>
        <CardDescription className="font-body">{t('gateBody')}</CardDescription>
      </CardHeader>
      <CardContent>
        <MfaPanel />
      </CardContent>
    </Card>
  );
}
