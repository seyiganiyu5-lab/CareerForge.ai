'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Building2, Mail, Phone, MapPin, Inbox, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/enterprise/leads';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  email: string;
  organization: string;
  org_type: string;
  team_size: string;
  country: string | null;
  phone: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-brand/10 text-brand border-brand/20',
  contacted: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  won: 'bg-emerald/10 text-emerald border-emerald/20',
  lost: 'bg-muted text-muted-foreground border-border',
};

export default function AdminLeadsPage() {
  const t = useTranslations('app.adminLeads');
  const te = useTranslations('enterprise');
  const { locale } = useLocale();
  const { user, isLoading } = useAuth();
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads${filter === 'all' ? '' : `?status=${filter}`}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error();
      setLeads(data.leads);
      setCounts(data.counts);
    } catch {
      setLeads([]);
      toast.error(t('loadFailed'));
    }
  }, [filter, t]);

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user?.is_admin, load]);

  const changeStatus = async (lead: Lead, status: LeadStatus) => {
    const previous = lead.status;
    setLeads((ls) => ls?.map((l) => (l.id === lead.id ? { ...l, status } : l)) ?? null);
    setCounts((c) => ({ ...c, [previous]: (c[previous] ?? 1) - 1, [status]: (c[status] ?? 0) + 1 }));
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error(t('loadFailed'));
      load();
    }
  };

  const date = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (!user?.is_admin) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="mt-4 text-muted-foreground font-body">{t('notAdmin')}</p>
      </div>
    );
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground font-body mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {(['all', ...LEAD_STATUSES] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? 'default' : 'outline'}
            role="tab"
            aria-selected={filter === s}
            className="font-body"
            onClick={() => { setLeads(null); setFilter(s); }}
          >
            {s === 'all' ? t('all') : t(`status.${s}`)}
            <span className="ml-1.5 text-xs opacity-70">{s === 'all' ? total : counts[s] ?? 0}</span>
          </Button>
        ))}
      </div>

      {leads === null ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="mt-4 text-muted-foreground font-body">{t('empty')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand shrink-0" />
                    <h2 className="font-heading font-semibold text-foreground">{lead.organization}</h2>
                    <Badge variant="outline" className={cn('font-body', STATUS_STYLE[lead.status])}>{t(`status.${lead.status}`)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground font-body">
                    {te(`orgTypes.${lead.org_type}`)} · {t('people', { size: lead.team_size })} · {t('received', { date: date(lead.created_at) })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-body text-foreground/90">
                    <span>{lead.name}</span>
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline break-all">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                        <Phone className="w-3.5 h-3.5 shrink-0" /> {lead.phone}
                      </a>
                    )}
                    {lead.country && (
                      <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {lead.country}</span>
                    )}
                  </div>
                  {lead.message && (
                    <p className="mt-3 text-sm text-muted-foreground font-body whitespace-pre-wrap rounded-lg bg-muted/40 p-3">{lead.message}</p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2 sm:w-40 shrink-0">
                  <Select value={lead.status} onValueChange={(v) => changeStatus(lead, v as LeadStatus)}>
                    <SelectTrigger className="w-full font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button asChild variant="outline" className="w-full font-body">
                    <Link href={`/admin/organizations?${new URLSearchParams({ lead: lead.id, name: lead.organization, type: lead.org_type, email: lead.email })}`}>
                      {t('createOrg')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full font-body">
                    <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Hassify Enterprise — ${lead.organization}`)}`}>{t('reply')}</a>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
