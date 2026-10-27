'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Copy, CreditCard, Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import OrgPaymentsDialog from '@/components/enterprise/org-payments-dialog';
import { useAuth } from '@/lib/auth/context';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ORG_TYPES } from '@/lib/enterprise/leads';
import { cn } from '@/lib/utils';

interface AdminOrg {
  id: string;
  name: string;
  org_type: string;
  seats: number;
  status: string;
  ends_at: string | null;
  members_count: number;
  pending_count: number;
  owners: string[];
}

interface FormState {
  id?: string;
  name: string;
  org_type: string;
  seats: string;
  ends_at: string;
  owner_email: string;
  lead_id?: string;
}

const EMPTY: FormState = { name: '', org_type: 'university', seats: '25', ends_at: '', owner_email: '' };

export default function AdminOrganizationsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
      <AdminOrganizations />
    </Suspense>
  );
}

function AdminOrganizations() {
  const t = useTranslations('app.adminOrgs');
  const tl = useTranslations('app.adminLeads');
  const te = useTranslations('enterprise');
  const { locale } = useLocale();
  const { user, isLoading, refreshSession } = useAuth();
  const searchParams = useSearchParams();
  const [orgs, setOrgs] = useState<AdminOrg[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [ownerLink, setOwnerLink] = useState<{ email: string; path: string } | null>(null);
  const [deleting, setDeleting] = useState<AdminOrg | null>(null);
  const [payments, setPayments] = useState<AdminOrg | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/organizations', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error();
      setOrgs(data.organizations);
    } catch {
      setOrgs([]);
      toast.error(t('failed'));
    }
  }, [t]);

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user?.is_admin, load]);

  // Opened from an Enterprise request: start the form with its details
  useEffect(() => {
    const lead = searchParams.get('lead');
    if (!lead) return;
    const type = searchParams.get('type') ?? '';
    setForm({
      ...EMPTY,
      lead_id: lead,
      name: searchParams.get('name') ?? '',
      org_type: (ORG_TYPES as readonly string[]).includes(type) ? type : 'other',
      owner_email: searchParams.get('email') ?? '',
    });
  }, [searchParams]);

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' });
  const statusOf = (o: AdminOrg) => (o.status !== 'active' ? 'suspended' : o.ends_at && new Date(o.ends_at) < new Date() ? 'ended' : 'active');

  const send = async (url: string, method: string, body: unknown) => {
    const res = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    return { ok: !!res?.ok, data: (await res?.json().catch(() => ({}))) ?? {} };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const seats = Number(form.seats);
    if (!form.name.trim() || !Number.isInteger(seats) || seats < 1 || (!form.id && !form.owner_email.trim())) {
      toast.error(t('invalid'));
      return;
    }
    setSaving(true);
    const { ok, data } = form.id
      ? await send(`/api/admin/organizations/${form.id}`, 'PATCH', { name: form.name, seats, ends_at: form.ends_at || null })
      : await send('/api/admin/organizations', 'POST', {
        name: form.name, org_type: form.org_type, seats, ends_at: form.ends_at || null,
        owner_email: form.owner_email.trim(), lead_id: form.lead_id ?? null,
      });
    setSaving(false);
    if (!ok) {
      toast.error(data.error === 'owner_in_other_org' ? t('ownerInOtherOrg') : data.error === 'invalid' ? t('invalid') : t('failed'));
      return;
    }
    if (form.id) {
      toast.success(t('saved'));
    } else {
      toast.success(t('created'), { description: data.owner_joined ? t('ownerJoined', { email: form.owner_email.trim() }) : undefined });
      if (data.owner_invite_path) setOwnerLink({ email: form.owner_email.trim(), path: data.owner_invite_path });
    }
    setForm(null);
    load();
  };

  const toggleStatus = async (o: AdminOrg) => {
    const { ok } = await send(`/api/admin/organizations/${o.id}`, 'PATCH', { status: o.status === 'active' ? 'suspended' : 'active' });
    if (!ok) toast.error(t('failed'));
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/organizations/${deleting.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => null);
    setDeleteBusy(false);
    if (res?.ok) {
      toast.success(t('deleted', { name: deleting.name }));
      // Your own membership may have gone with it
      if (user?.organization?.id === deleting.id) refreshSession(true);
      setDeleting(null);
      load();
    } else {
      toast.error(t('failed'));
    }
  };

  const copy = async (path: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast.success(t('copied'));
    } catch {
      toast.error(t('failed'));
    }
  };

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!user?.is_admin) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="mt-4 text-muted-foreground font-body">{tl('notAdmin')}</p>
      </div>
    );
  }

  const set = (key: keyof FormState) => (value: string) => setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground font-body mt-1">{t('subtitle')}</p>
        </div>
        <Button className="bg-brand hover:bg-brand/90 text-white font-body gap-2" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="w-4 h-4" /> {t('create')}
        </Button>
      </div>

      {orgs === null ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : orgs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="mt-4 text-muted-foreground font-body">{t('empty')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orgs.map((o) => {
            const status = statusOf(o);
            return (
              <li key={o.id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading font-semibold text-foreground">{o.name}</h2>
                    <Badge variant="outline" className={cn('font-body', status === 'active' ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-muted text-muted-foreground')}>
                      {t(`status.${status}`)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground font-body">
                    {te(`orgTypes.${o.org_type}`)} · {t('seatsUsed', { used: o.members_count + o.pending_count, seats: o.seats })}
                    {o.pending_count > 0 && ` (${t('pending', { count: o.pending_count })})`} · {o.ends_at ? t('until', { date: date(o.ends_at) }) : t('noEnd')}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground font-body break-all">
                    {o.owners.length ? t('owners', { emails: o.owners.join(', ') }) : t('noOwner')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-body"
                    onClick={() => setForm({ id: o.id, name: o.name, org_type: o.org_type, seats: String(o.seats), ends_at: o.ends_at ? o.ends_at.slice(0, 10) : '', owner_email: '' })}
                  >
                    {t('edit')}
                  </Button>
                  <Button variant="outline" size="sm" className="font-body gap-1.5" onClick={() => setPayments(o)}>
                    <CreditCard className="w-4 h-4" /> {t('payments')}
                  </Button>
                  <Button variant="outline" size="sm" className="font-body" onClick={() => toggleStatus(o)}>
                    {o.status === 'active' ? t('pause') : t('resume')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-body text-rose-600 hover:text-rose-700 border-rose-500/30 hover:bg-rose-500/5"
                    onClick={() => { setConfirmName(''); setDeleting(o); }}
                    aria-label={t('deleteNamed', { name: o.name })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Create / edit */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <form onSubmit={save} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{form?.id ? t('editTitle', { name: form.name }) : t('createTitle')}</DialogTitle>
              {!form?.id && <DialogDescription>{t('createBody')}</DialogDescription>}
            </DialogHeader>
            {form && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="org-name">{t('fields.name')}</Label>
                  <Input id="org-name" value={form.name} onChange={(e) => set('name')(e.target.value)} maxLength={160} />
                </div>
                {!form.id && (
                  <div className="space-y-1.5">
                    <Label htmlFor="org-type">{t('fields.orgType')}</Label>
                    <Select value={form.org_type} onValueChange={set('org_type')}>
                      <SelectTrigger id="org-type" className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORG_TYPES.map((o) => <SelectItem key={o} value={o}>{te(`orgTypes.${o}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="org-seats">{t('fields.seats')}</Label>
                  <Input id="org-seats" type="number" min={1} value={form.seats} onChange={(e) => set('seats')(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-ends">{t('fields.endsAt')}</Label>
                  <Input id="org-ends" type="date" value={form.ends_at} onChange={(e) => set('ends_at')(e.target.value)} />
                </div>
                {!form.id && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="org-owner">{t('fields.ownerEmail')}</Label>
                    <Input id="org-owner" type="email" value={form.owner_email} onChange={(e) => set('owner_email')(e.target.value)} maxLength={200} />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('saving')}</> : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OrgPaymentsDialog key={payments?.id ?? 'none'} org={payments} onClose={() => setPayments(null)} onChanged={load} />

      {/* Delete: type the name to confirm, it can't be undone */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <form onSubmit={(e) => { e.preventDefault(); if (confirmName.trim() === deleting?.name.trim()) remove(); }} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{deleting && t('deleteTitle', { name: deleting.name })}</DialogTitle>
              <DialogDescription>{deleting && t('deleteBody', { count: deleting.members_count })}</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-name">{deleting && t('deleteConfirm', { name: deleting.name })}</Label>
              <Input id="confirm-name" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="font-body" onClick={() => setDeleting(null)}>{t('cancel')}</Button>
              <Button
                type="submit"
                disabled={deleteBusy || confirmName.trim() !== deleting?.name.trim()}
                className="bg-destructive text-white hover:bg-destructive/90 font-body gap-2"
              >
                {deleteBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} {t('delete')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Owner without an account: their personal link */}
      <Dialog open={!!ownerLink} onOpenChange={(o) => !o && setOwnerLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('created')}</DialogTitle>
            <DialogDescription>{ownerLink && t('ownerInvite', { email: ownerLink.email })}</DialogDescription>
          </DialogHeader>
          {ownerLink && (
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="flex-1 min-w-0 break-all rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">{`${typeof window !== 'undefined' ? window.location.origin : ''}${ownerLink.path}`}</code>
              <Button variant="outline" className="font-body gap-1.5" onClick={() => copy(ownerLink.path)}><Copy className="w-4 h-4" /> {t('copy')}</Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="font-body" onClick={() => setOwnerLink(null)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
