'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Loader2, Users, CalendarClock, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanMoney } from '@/components/billing/plan-card-parts';
import { INVOICE_STATUS_STYLE, type Invoice } from './org-payments-dialog';
import { cn } from '@/lib/utils';

/** Owners and admins: seats, end date, payment requests from Hassify and past payments */
export default function OrgBilling() {
  const t = useTranslations('app.orgPayments');
  const { locale } = useLocale();
  const money = usePlanMoney();
  const [data, setData] = useState<{ seats: number; ends_at: string | null; invoices: Invoice[] } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/organization/invoices', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);

  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }) : '—';

  if (failed) return <p className="text-sm text-muted-foreground font-body">{t('failed')}</p>;
  if (!data) return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;

  const open = data.invoices.filter((i) => i.status === 'open');
  const paid = data.invoices.filter((i) => i.status === 'paid');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="py-4">
          <CardContent className="px-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-body"><Users className="w-3.5 h-3.5" /> {t('seats')}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.seats}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="px-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-body"><CalendarClock className="w-3.5 h-3.5" /> {t('accessUntil')}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.ends_at ? date(data.ends_at) : t('noEnd')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-brand" /> {t('toPay')}</CardTitle>
          <CardDescription className="font-body">{open.length ? t('toPayBody') : t('nothingToPay')}</CardDescription>
        </CardHeader>
        {open.length > 0 && (
          <CardContent className="space-y-3">
            {open.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border p-4">
                <div className="flex-1 min-w-0 font-body">
                  <p className="font-heading text-lg font-semibold text-foreground">{money(inv.amount, inv.currency)}</p>
                  <p className="text-xs text-muted-foreground">{t('line', { seats: inv.seats, period: t(`periods.${inv.months}`) })}</p>
                  {inv.note && <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">{inv.note}</p>}
                </div>
                {inv.path && (
                  <Button asChild className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
                    <Link href={inv.path}>{t('payNow')} <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground font-body">{t('shareHint')}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">{t('history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {paid.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">{t('none')}</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {paid.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-2 p-3 text-sm font-body">
                  <span className="font-semibold text-foreground">{money(inv.amount, inv.currency)}</span>
                  <Badge variant="outline" className={cn('font-body', INVOICE_STATUS_STYLE.paid)}>{t('status.paid')}</Badge>
                  <span className="text-xs text-muted-foreground">{t('line', { seats: inv.seats, period: t(`periods.${inv.months}`) })} · {t('paidOn', { date: date(inv.paid_at), until: date(inv.access_until) })}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
