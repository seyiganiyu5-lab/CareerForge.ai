'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, Loader2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlanMoney } from '@/components/billing/plan-card-parts';

interface PayInfo {
  organization: string;
  logo_url: string | null;
  seats: number;
  months: number;
  unit_price: number;
  amount: number;
  currency: string;
  note: string;
  status: 'open' | 'paid' | 'cancelled';
  paid_at: string | null;
  access_until: string | null;
}

export default function PayPage() {
  return (
    <Suspense fallback={null}>
      <Pay />
    </Suspense>
  );
}

function Pay() {
  const t = useTranslations('app.pay');
  const { locale } = useLocale();
  const money = usePlanMoney();
  const { user } = useAuth();
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  // Back from Paystack: confirm the payment, then show the result
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typedEmail, setEmail] = useState<string | null>(null);
  const email = typedEmail ?? user?.email ?? '';
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(() => !!reference);
  const [version, setVersion] = useState(0);
  const verified = useRef(false);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    fetch(`/api/pay/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) setInfo(data.invoice);
        else setError(data?.error === 'not_found' ? 'not_found' : 'failed');
      })
      .catch(() => setError('failed'));
  }, [token, version]);

  useEffect(() => {
    if (!reference || verified.current) return;
    verified.current = true;
    fetch(`/api/pay/${encodeURIComponent(token)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((d) => { if (!d.success) setError(d.error === 'payment_not_completed' ? 'not_completed' : 'not_confirmed'); })
      .catch(() => setError('not_confirmed'))
      .finally(() => { setChecking(false); load(); window.history.replaceState(null, '', `/pay/${token}`); });
  }, [reference, token, load]);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('invalid_email'); return; }
    setBusy(true);
    const res = await fetch(`/api/pay/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (data?.payment_link) { window.location.href = data.payment_link; return; }
    setBusy(false);
    if (data?.paid) { load(); return; }
    setError(data?.error === 'currency_unavailable' ? 'currency_unavailable' : data?.error === 'invalid_email' ? 'invalid_email' : data?.error === 'rate_limited' ? 'rate_limited' : 'failed');
  };

  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' }) : '—';

  return (
    <div className="bg-background min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        {!info && !error || checking ? (
          <p className="flex items-center justify-center gap-2 text-muted-foreground font-body">
            <Loader2 className="w-4 h-4 animate-spin" /> {checking ? t('checking') : t('loading')}
          </p>
        ) : !info ? (
          <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300 font-body" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {t(`errors.${error === 'not_found' ? 'not_found' : 'failed'}`)}
          </p>
        ) : (
          <>
            <div className="text-center">
              {info.logo_url ? (
                <img src={info.logo_url} alt={info.organization} className="w-16 h-16 mx-auto rounded-xl object-contain bg-white border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center mx-auto"><Building2 className="w-7 h-7 text-brand" /></div>
              )}
              <p className="mt-4 text-sm text-muted-foreground font-body">{t('for', { organization: info.organization })}</p>
              <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">{money(info.amount, info.currency)}</h1>
              <p className="mt-1 text-sm text-muted-foreground font-body">
                {t('line', { seats: info.seats, period: t(`periods.${info.months}`), price: money(info.unit_price, info.currency) })}
              </p>
              {info.note && <p className="mt-3 text-sm text-foreground/80 font-body whitespace-pre-wrap">{info.note}</p>}
            </div>

            {info.status === 'paid' ? (
              <div className="mt-6 rounded-lg border border-emerald/30 bg-emerald/5 p-4 text-center" role="status">
                <CheckCircle2 className="w-8 h-8 text-emerald mx-auto" />
                <p className="mt-2 font-heading font-semibold text-foreground">{t('paidTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground font-body">{t('paidBody', { date: date(info.access_until) })}</p>
                <Button asChild variant="outline" className="mt-4 font-body"><Link href="/organization">{t('openOrganization')}</Link></Button>
              </div>
            ) : info.status === 'cancelled' ? (
              <p className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground font-body">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {t('cancelled')}
              </p>
            ) : (
              <form onSubmit={pay} className="mt-6 space-y-3" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="pay-email" className="font-body">{t('email')}</Label>
                  <Input id="pay-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
                  <p className="text-xs text-muted-foreground font-body">{t('emailHint')}</p>
                </div>
                {error && (
                  <p className="flex items-start gap-2 text-sm text-destructive font-body" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {t(`errors.${error}`)}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="w-full bg-brand hover:bg-brand/90 text-white font-body gap-2">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} {t('payButton', { amount: money(info.amount, info.currency) })}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-body">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('secure')}
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
