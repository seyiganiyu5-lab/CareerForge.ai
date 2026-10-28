'use client';

import { useEffect, useState } from 'react';
import { History, LogIn, Building2, CreditCard, Inbox, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { describeDevice } from '@/lib/admin-device';
import { cn } from '@/lib/utils';

interface Entry {
  id: string;
  actor_email: string;
  action: string;
  summary: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

const KINDS = ['all', 'signin', 'security', 'org', 'invoice', 'lead'] as const;
const ICON: Record<string, React.ElementType> = { admin: ShieldCheck, org: Building2, invoice: CreditCard, lead: Inbox };

export default function AdminActivityPage() {
  const t = useTranslations('app.adminActivity');
  const { locale } = useLocale();
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all');
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    fetch(`/api/admin/activity${kind === 'all' ? '' : `?kind=${kind}`}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setEntries(d.success ? d.entries : []))
      .catch(() => setEntries([]));
  }, [kind]);

  const when = (iso: string) => new Date(iso).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  // Translation keys can't contain dots: admin.signin → actions.admin_signin
  const label = (action: string) => {
    const key = `actions.${action.replace(/\./g, '_')}`;
    return t.has(key) ? t(key) : action;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2"><History className="w-6 h-6 text-brand" /> {t('title')}</h1>
        <p className="text-muted-foreground font-body mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Button key={k} size="sm" variant={kind === k ? 'default' : 'outline'} className="font-body" onClick={() => { setEntries(null); setKind(k); }}>
            {t(`kinds.${k}`)}
          </Button>
        ))}
      </div>

      {entries === null ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground font-body">{t('empty')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {entries.map((e) => {
            const Icon = e.action === 'admin.signin' ? LogIn : ICON[e.action.split('.')[0]] ?? History;
            const warn = e.action === 'admin.mfa_failed' || e.action === 'org.delete';
            return (
              <li key={e.id} className="flex items-start gap-3 p-4">
                <span className={cn('mt-0.5 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center', warn ? 'bg-rose-500/10 text-rose-600' : 'bg-brand/10 text-brand')}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1 font-body">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{label(e.action)}</span>
                    {e.summary && <span className="text-muted-foreground"> · {e.summary}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {e.actor_email} · {when(e.created_at)}
                    {e.ip && ` · ${e.ip}`}
                    {e.user_agent && ` · ${describeDevice(e.user_agent)}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
