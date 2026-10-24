'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Search, ShieldCheck, Users, FileText, Gauge, Send, Video, Gift, Activity } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const STAGES = ['not_started', 'cv_ready', 'applying', 'interviewing', 'offer', 'hired'] as const;
type Stage = (typeof STAGES)[number];

interface Row {
  id: string;
  name: string;
  email: string;
  role: string;
  cvs: number;
  letters: number;
  ats: number | null;
  applications: number;
  interviews: number;
  offers: number;
  hired: boolean;
  last_active: string | null;
  stage: Stage;
}

interface Progress {
  totals: {
    members: number;
    with_cv: number;
    avg_ats: number | null;
    applications: number;
    interviewing: number;
    with_offer: number;
    hired: number;
    active_7d: number;
  };
  stages: Record<Stage, number>;
  members: Row[];
}

const STAGE_COLOR: Record<Stage, string> = {
  not_started: 'bg-muted-foreground/30',
  cv_ready: 'bg-sky-500',
  applying: 'bg-brand',
  interviewing: 'bg-amber-500',
  offer: 'bg-violet-500',
  hired: 'bg-emerald-500',
};

type SortKey = 'last_active' | 'ats' | 'applications' | 'stage' | 'name';

const atsColor = (s: number) => (s >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400');

export default function ProgressView({ organizationName }: { organizationName: string }) {
  const t = useTranslations('app.orgProgress');
  const { locale } = useLocale();
  const [data, setData] = useState<Progress | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('last_active');

  useEffect(() => {
    fetch('/api/organization/progress', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);

  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }) : '—';

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const list = data.members.filter((r) =>
      (stage === 'all' || r.stage === stage) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)));
    const by: Record<SortKey, (a: Row, b: Row) => number> = {
      last_active: (a, b) => (b.last_active ?? '').localeCompare(a.last_active ?? ''),
      ats: (a, b) => (b.ats ?? -1) - (a.ats ?? -1),
      applications: (a, b) => b.applications - a.applications,
      stage: (a, b) => STAGES.indexOf(b.stage) - STAGES.indexOf(a.stage),
      name: (a, b) => (a.name || a.email).localeCompare(b.name || b.email),
    };
    return [...list].sort(by[sort]);
  }, [data, query, stage, sort]);

  const downloadCsv = () => {
    if (!data) return;
    const header = [t('csv.name'), t('csv.email'), t('csv.stage'), t('csv.cvs'), t('csv.letters'), t('csv.ats'), t('csv.applications'), t('csv.interviews'), t('csv.offers'), t('csv.lastActive')];
    const cell = (v: string | number) => {
      const s = String(v);
      // Quote, and stop spreadsheets from treating text as a formula
      return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
    };
    const lines = [header, ...rows.map((r) => [
      r.name, r.email, t(`stages.${r.stage}`), r.cvs, r.letters, r.ats ?? '', r.applications, r.interviews, r.offers,
      r.last_active ? r.last_active.slice(0, 10) : '',
    ])].map((l) => l.map(cell).join(','));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${organizationName.replace(/[^\w-]+/g, '-').toLowerCase()}-progress.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (failed) return <p className="text-sm text-muted-foreground font-body">{t('loadFailed')}</p>;
  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const { totals, stages } = data;
  const pct = (n: number) => (totals.members ? Math.round((n / totals.members) * 100) : 0);
  const stats = [
    { key: 'members', icon: Users, value: totals.members, sub: t('activeWeek', { count: totals.active_7d }) },
    { key: 'withCv', icon: FileText, value: totals.with_cv, sub: t('ofMembers', { pct: pct(totals.with_cv) }) },
    { key: 'avgAts', icon: Gauge, value: totals.avg_ats ?? '—', sub: t('avgAtsHint') },
    { key: 'applications', icon: Send, value: totals.applications, sub: t('applicationsHint') },
    { key: 'interviewing', icon: Video, value: totals.interviewing, sub: t('ofMembers', { pct: pct(totals.interviewing) }) },
    { key: 'offers', icon: Gift, value: totals.with_offer, sub: t('hiredCount', { count: totals.hired }) },
  ] as const;

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 text-sm text-muted-foreground font-body">
        <ShieldCheck className="w-4 h-4 text-emerald shrink-0 mt-0.5" /> {t('privacy')}
      </p>

      {/* Totals */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ key, icon: Icon, value, sub }) => (
          <Card key={key} className="py-4">
            <CardContent className="px-4">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-body"><Icon className="w-3.5 h-3.5" /> {t(`stats.${key}`)}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground font-body truncate">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Where members are */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-brand" /> {t('stagesTitle')}</CardTitle>
          <CardDescription className="font-body">{t('stagesBody')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {totals.members > 0 && (
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={t('stagesTitle')}>
              {STAGES.map((s) => stages[s] > 0 && (
                <div key={s} className={STAGE_COLOR[s]} style={{ width: `${(stages[s] / totals.members) * 100}%` }} title={`${t(`stages.${s}`)}: ${stages[s]}`} />
              ))}
            </div>
          )}
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(stage === s ? 'all' : s)}
                aria-pressed={stage === s}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  stage === s ? 'border-brand bg-brand/5' : 'border-border hover:bg-accent',
                )}
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', STAGE_COLOR[s])} /> {t(`stages.${s}`)}
                </span>
                <span className="mt-0.5 block font-heading text-lg font-semibold text-foreground">{stages[s]}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="font-heading text-lg">{t('membersTitle')}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search')} className="pl-9 font-body" aria-label={t('search')} />
            </div>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage | 'all')}>
              <SelectTrigger className="sm:w-44 font-body" aria-label={t('filterStage')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStages')}</SelectItem>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{t(`stages.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="sm:w-48 font-body" aria-label={t('sortBy')}><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['last_active', 'stage', 'ats', 'applications', 'name'] as const).map((k) => <SelectItem key={k} value={k}>{t(`sort.${k}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="font-body gap-2" onClick={downloadCsv}><Download className="w-4 h-4" /> {t('csvButton')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground font-body">{t('noMatch')}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm font-body">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">{t('cols.member')}</th>
                    <th className="px-3 py-2 text-left font-medium">{t('cols.stage')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.cvs')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.letters')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.ats')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.applications')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.interviews')}</th>
                    <th className="px-3 py-2 text-right font-medium">{t('cols.offers')}</th>
                    <th className="px-3 py-2 text-right font-medium whitespace-nowrap">{t('cols.lastActive')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2.5 min-w-[180px]">
                        <p className="font-medium text-foreground">{r.name || r.email}</p>
                        {r.name && <p className="text-xs text-muted-foreground break-all">{r.email}</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="font-body whitespace-nowrap gap-1.5">
                          <span className={cn('w-2 h-2 rounded-full', STAGE_COLOR[r.stage])} /> {t(`stages.${r.stage}`)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.cvs}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.letters}</td>
                      <td className={cn('px-3 py-2.5 text-right tabular-nums font-medium', r.ats !== null ? atsColor(r.ats) : 'text-muted-foreground')}>{r.ats ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.applications}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.interviews}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.offers}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">{date(r.last_active)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground font-body">{t('atsNote')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
