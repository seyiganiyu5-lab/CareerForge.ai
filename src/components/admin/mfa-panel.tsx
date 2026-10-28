'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck, Smartphone, KeyRound, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Enrollment {
  factor_id: string;
  qr_code: string;
  secret: string;
}

/**
 * Two-step verification for admins: set up the authenticator app (scan a QR
 * code, enter the first code) or enter today's code. Calls onDone when the
 * session can open the admin pages.
 */
export default function MfaPanel({ onDone }: { onDone?: () => void }) {
  const t = useTranslations('app.adminMfa');
  const { user, refreshSession } = useAuth();
  const state = user?.admin_mfa;
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [starting, setStarting] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setError(null);
    const res = await fetch('/api/auth/mfa/enroll', { method: 'POST', credentials: 'include' }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setStarting(false);
    if (data?.success) setEnrollment(data);
    else if (data?.error === 'already_enrolled') await refreshSession(true);
    else setError(data?.error === 'enroll_failed' ? 'enroll_failed' : 'failed');
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code.replace(/\s/g, ''))) { setError('invalid_code'); return; }
    setBusy(true);
    const res = await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, factor_id: enrollment?.factor_id }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (data?.success) {
      toast.success(enrollment ? t('enabled') : t('verified'));
      setCode('');
      setEnrollment(null);
      await refreshSession(true);
      onDone?.();
    } else {
      setError(['wrong_code', 'rate_limited', 'invalid_code'].includes(data?.error) ? data.error : 'failed');
    }
  };

  const copySecret = async () => {
    try { await navigator.clipboard.writeText(enrollment?.secret ?? ''); toast.success(t('keyCopied')); } catch { /* ignore */ }
  };

  const codeForm = (
    <form onSubmit={verify} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="mfa-code" className="font-body">{t('codeLabel')}</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
          placeholder="123 456"
          className="font-mono text-lg tracking-widest max-w-48"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-destructive font-body" role="alert">{t(`errors.${error}`)}</p>}
      <Button type="submit" disabled={busy} className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t('verify')}
      </Button>
    </form>
  );

  // Code already set up: enter today's code
  if (state === 'needs_code' && !enrollment) {
    return (
      <div className="space-y-4">
        <p className="flex items-start gap-2 text-sm text-muted-foreground font-body">
          <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-brand" /> {t('enterCode')}
        </p>
        {codeForm}
        <p className="text-xs text-muted-foreground font-body">{t('lostPhone')}</p>
      </div>
    );
  }

  // First time: set up the authenticator app
  return (
    <div className="space-y-4">
      {!enrollment ? (
        <>
          <p className="flex items-start gap-2 text-sm text-muted-foreground font-body">
            <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-brand" /> {t('setupIntro')}
          </p>
          {error && <p className="text-sm text-destructive font-body" role="alert">{t(`errors.${error}`)}</p>}
          <Button onClick={start} disabled={starting} className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
            {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} {t('setup')}
          </Button>
        </>
      ) : (
        <>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/90 font-body">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <img src={enrollment.qr_code} alt={t('qrAlt')} className="w-44 h-44 rounded-lg bg-white p-2 border border-border" />
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs text-muted-foreground font-body">{t('cantScan')}</p>
              <div className="flex items-center gap-2">
                <code className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs break-all">{enrollment.secret}</code>
                <Button type="button" size="icon" variant="ghost" onClick={copySecret} aria-label={t('copyKey')}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
          {codeForm}
        </>
      )}
    </div>
  );
}
