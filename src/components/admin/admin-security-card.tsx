'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MfaPanel from './mfa-panel';

/** Settings: two-step verification for site admins */
export default function AdminSecurityCard() {
  const t = useTranslations('app.adminMfa');
  const { user, refreshSession } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!user?.is_admin) return null;
  const state = user.admin_mfa;

  const remove = async () => {
    setBusy(true);
    const res = await fetch('/api/auth/mfa', { method: 'DELETE', credentials: 'include' }).catch(() => null);
    setBusy(false);
    setConfirm(false);
    if (res?.ok) { toast.success(t('removed')); await refreshSession(true); } else toast.error(t('errors.failed'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand" /> {t('title')}
          {state === 'verified' && <Badge variant="outline" className="font-body bg-emerald/10 text-emerald border-emerald/20">{t('on')}</Badge>}
        </CardTitle>
        <CardDescription className="font-body">{t('settingsBody')}</CardDescription>
      </CardHeader>
      <CardContent>
        {state === 'off' ? (
          <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 font-body">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /> {t('offWarning')}
          </p>
        ) : state === 'verified' ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 text-sm text-muted-foreground font-body">{t('onBody')}</p>
            <Button variant="outline" className="font-body" onClick={() => setConfirm(true)}>{t('remove')}</Button>
          </div>
        ) : (
          <MfaPanel />
        )}
      </CardContent>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('removeBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); remove(); }} disabled={busy} className="bg-destructive text-white hover:bg-destructive/90">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
