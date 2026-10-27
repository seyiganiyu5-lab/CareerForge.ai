'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, X } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePlanMoney } from '@/components/billing/plan-card-parts';
import { cn } from '@/lib/utils';

const MONTHS = [1, 3, 6, 12] as const;

export interface Invoice {
  id: string;
  seats: number;
  months: number;
  unit_price: number;
  amount: number;
  currency: string;
  note: string;
  status: 'open' | 'paid' | 'cancelled';
  paid_at: string | null;
  access_until: string | null;
  created_at: string;
  path: string | null;
}

export const INVOICE_STATUS_STYLE: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  paid: 'bg-emerald/10 text-emerald border-emerald/20',
  cancelled: 'bg-muted text-muted-foreground',
};

/** Site admins: ask an organisation to pay for seats, and see its payments */
export default function OrgPaymentsDialog({
  org,
  onClose,
  onChanged,
}: {
  org: { id: string; name: string; seats: number } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const t = useTranslations('app.orgPayments');
  const { locale } = useLocale();
  const money = usePlanMoney();
  // Opened fresh for each organisation (the parent sets key={org.id})
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seats, setSeats] = useState(() => String(org?.seats ?? ''));
  const [months, setMonths] = useState('12');
  const [unitPrice, setUnitPrice] = useState('');
  const [chosenCurrency, setCurrency] = useState('');
  const currency = chosenCurrency || currencies[0] || '';
  const [note, setNote] = useState('');
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!org) return;
    fetch(`/api/admin/organizations/${org.id}/invoices`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) throw new Error();
        setInvoices(data.invoices);
        setCurrencies(data.currencies);
      })
      .catch(() => { setInvoices([]); toast.error(t('failed')); });
  }, [org, t, version]);

  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }) : '—';

  const seatsN = Number(seats);
  const monthsN = Number(months);
  const unitN = Number(unitPrice.replace(/\s/g, '').replace(',', '.'));
  const valid = Number.isInteger(seatsN) && seatsN >= 1 && unitN > 0 && !!currency;
  const total = valid ? Math.round(unitN * 100) * seatsN * monthsN : 0;

  const copy = async (path: string) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}${path}`); toast.success(t('copied')); }
    catch { toast.error(t('failed')); }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !valid) return;
    setSaving(true);
    const res = await fetch(`/api/admin/organizations/${org.id}/invoices`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats: seatsN, months: monthsN, unit_price: unitN, currency, note }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!data?.success) { toast.error(data?.error === 'currency_unavailable' ? t('currencyUnavailable') : t('failed')); return; }
    toast.success(t('created'));
    copy(data.invoice.path);
    setCreating(false);
    load();
    onChanged();
  };

  const cancel = async (inv: Invoice) => {
    const res = await fetch(`/api/admin/invoices/${inv.id}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }),
    }).catch(() => null);
    if (!res?.ok) toast.error(t('failed'));
    load();
  };

  return (
    <Dialog open={!!org} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{org && t('title', { name: org.name })}</DialogTitle>
          <DialogDescription>{t('body')}</DialogDescription>
        </DialogHeader>

        {creating ? (
          <form onSubmit={create} className="space-y-4 rounded-lg border border-border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inv-seats">{t('seats')}</Label>
                <Input id="inv-seats" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-months">{t('period')}</Label>
                <Select value={months} onValueChange={setMonths}>
                  <SelectTrigger id="inv-months" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={String(m)}>{t(`periods.${m}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-price">{t('unitPrice')}</Label>
                <Input id="inv-price" inputMode="decimal" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="1500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-currency">{t('currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="inv-currency" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="inv-note">{t('note')}</Label>
                <Textarea id="inv-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder={t('notePlaceholder')} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-muted/40 p-3">
              <div className="flex-1 text-sm font-body">
                <p className="text-muted-foreground">{t('total')}</p>
                <p className="font-heading text-xl font-bold text-foreground">{valid ? money(total, currency) : '—'}</p>
                {valid && <p className="text-xs text-muted-foreground">{t('totalHint', { seats: seatsN, period: t(`periods.${monthsN}`), price: money(Math.round(unitN * 100), currency) })}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="font-body" onClick={() => setCreating(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={!valid || saving} className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t('createLink')}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Button className="bg-brand hover:bg-brand/90 text-white font-body gap-2 self-start" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> {t('new')}
          </Button>
        )}

        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground mb-2">{t('history')}</h3>
          {invoices === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">{t('none')}</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
                  <div className="flex-1 min-w-0 font-body">
                    <p className="text-sm text-foreground flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{money(inv.amount, inv.currency)}</span>
                      <Badge variant="outline" className={cn('font-body', INVOICE_STATUS_STYLE[inv.status])}>{t(`status.${inv.status}`)}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('line', { seats: inv.seats, period: t(`periods.${inv.months}`) })} · {inv.status === 'paid' ? t('paidOn', { date: date(inv.paid_at), until: date(inv.access_until) }) : t('createdOn', { date: date(inv.created_at) })}
                    </p>
                  </div>
                  {inv.status === 'open' && inv.path && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="font-body gap-1.5" onClick={() => copy(inv.path!)}><Copy className="w-3.5 h-3.5" /> {t('copyLink')}</Button>
                      <Button size="sm" variant="ghost" className="font-body text-muted-foreground" onClick={() => cancel(inv)} aria-label={t('cancelRequest')}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
