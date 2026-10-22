'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Building2, Copy, Link2, Loader2, RefreshCw, ShieldCheck, UserPlus, Users, X, LogOut, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Member {
  id: string;
  role: string;
  joined_at: string;
  name: string;
  email: string;
  is_you: boolean;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  path: string;
  expires_at: string;
}

interface Org {
  id: string;
  name: string;
  ends_at: string | null;
  active: boolean;
  role: string;
  // Owners and admins only
  seats?: number;
  seats_used?: number;
  invite_link_enabled?: boolean;
  invite_path?: string;
  members?: Member[];
  invites?: Invite[];
}

interface InviteForYou {
  organization: string;
  path: string;
  expires_at: string;
}

const fullUrl = (path: string) => `${window.location.origin}${path}`;

export default function OrganizationPage() {
  const t = useTranslations('app.organization');
  const { locale } = useLocale();
  const [org, setOrg] = useState<Org | null | undefined>(undefined);
  const [invitesForYou, setInvitesForYou] = useState<InviteForYou[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [busy, setBusy] = useState(false);

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' });

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/organization', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error();
      setOrg(data.organization);
      setInvitesForYou(data.invites ?? []);
    } catch {
      setOrg(null);
      toast.error(t('loadFailed'));
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const leave = async () => {
    if (!org) return;
    setBusy(true);
    const res = await fetch('/api/organization/membership', { method: 'DELETE', credentials: 'include' }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    setConfirmLeave(false);
    if (res?.ok) {
      toast.success(t('left', { organization: org.name }));
      // Reload so the plan, sidebar and session pick up the change
      window.location.href = '/home';
    } else {
      toast.error(data?.error === 'last_owner' ? t('lastOwner') : t('actionFailed'));
    }
  };

  if (org === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Not in an organisation
  if (!org) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t('title')}</h1>
        {invitesForYou.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t('invitesForYou')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitesForYou.map((inv) => (
                <div key={inv.path} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium font-body text-foreground">{inv.organization}</p>
                    <p className="text-xs text-muted-foreground font-body">{t('expires', { date: date(inv.expires_at) })}</p>
                  </div>
                  <Button asChild className="bg-brand hover:bg-brand/90 text-white font-body">
                    <Link href={inv.path}>{t('joinOrg', { organization: inv.organization })}</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="mt-4 font-heading font-semibold text-foreground">{t('notMemberTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground font-body">{t('notMemberBody')}</p>
          <Button asChild variant="outline" className="mt-5 font-body">
            <Link href="/enterprise">{t('learnEnterprise')} <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  const isManager = org.role === 'owner' || org.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold text-foreground">{org.name}</h1>
            <Badge variant="outline" className="font-body">{t(`roles.${org.role}`)}</Badge>
          </div>
          <p className="text-muted-foreground font-body mt-1">{isManager ? t('subtitle') : t('memberAccess')}</p>
          {org.ends_at && <p className="text-sm text-muted-foreground font-body mt-1">{t('accessUntil', { date: date(org.ends_at) })}</p>}
        </div>
        <Button variant="outline" className="font-body gap-2 shrink-0" onClick={() => setConfirmLeave(true)}>
          <LogOut className="w-4 h-4" /> {t('leave')}
        </Button>
      </div>

      {!org.active && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm font-body text-amber-700 dark:text-amber-300">{t('inactive')}</p>
        </div>
      )}

      {isManager ? (
        <ManagerView org={org} reload={load} date={date} />
      ) : (
        <Card>
          <CardContent className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground font-body">{t('privacyMember')}</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leaveTitle', { organization: org.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t('leaveBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); leave(); }} disabled={busy} className="bg-destructive text-white hover:bg-destructive/90">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ManagerView({ org, reload, date }: { org: Org; reload: () => Promise<void>; date: (iso: string) => string }) {
  const t = useTranslations('app.organization');
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [confirmNewLink, setConfirmNewLink] = useState(false);

  const seats = org.seats ?? 0;
  const used = org.seats_used ?? 0;
  const isOwner = org.role === 'owner';

  const copy = async (path: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl(path));
      toast.success(t('copied'));
    } catch {
      toast.error(t('actionFailed'));
    }
  };

  const call = async (url: string, init: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    return { ok: !!res?.ok, data: data ?? {} };
  };

  const sendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) return;
    setInviting(true);
    const { ok, data } = await call('/api/organization/invites', { method: 'POST', body: JSON.stringify({ emails, role }) });
    setInviting(false);
    if (ok) {
      toast.success(t('invitesCreated', { count: data.created.length }), {
        description: data.skipped ? t('invitesSkipped', { count: data.skipped }) : undefined,
      });
      setEmails('');
      reload();
    } else {
      toast.error(
        data.error === 'no_seats' ? t('noSeats', { free: data.free ?? 0 })
          : data.error === 'invalid_emails' ? t('invalidEmails', { emails: (data.invalid ?? []).join(', ') })
            : data.error === 'too_many' ? t('tooMany', { max: data.max ?? 200 })
              : t('actionFailed'),
      );
    }
  };

  const toggleLink = async (enabled: boolean) => {
    const { ok } = await call('/api/organization', { method: 'PATCH', body: JSON.stringify({ invite_link_enabled: enabled }) });
    if (!ok) toast.error(t('actionFailed'));
    reload();
  };

  const newLink = async () => {
    setConfirmNewLink(false);
    const { ok } = await call('/api/organization', { method: 'PATCH', body: JSON.stringify({ regenerate_link: true }) });
    if (!ok) toast.error(t('actionFailed'));
    reload();
  };

  const cancelInvite = async (invite: Invite) => {
    const { ok } = await call(`/api/organization/invites/${invite.id}`, { method: 'DELETE' });
    if (!ok) toast.error(t('actionFailed'));
    reload();
  };

  const changeRole = async (member: Member, newRole: string) => {
    const { ok } = await call(`/api/organization/members/${member.id}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
    if (ok) toast.success(t('roleChanged'));
    else toast.error(t('actionFailed'));
    reload();
  };

  const remove = async () => {
    if (!removing) return;
    const { ok } = await call(`/api/organization/members/${removing.id}`, { method: 'DELETE' });
    setRemoving(null);
    if (ok) toast.success(t('removed'));
    else toast.error(t('actionFailed'));
    reload();
  };

  const canRemove = (m: Member) => !m.is_you && (isOwner || m.role === 'member');

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2"><Users className="w-5 h-5 text-brand" /> {t('seatsTitle')}</CardTitle>
            <CardDescription className="font-body">{t('seatsUsed', { used, seats })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={seats ? Math.min(100, (used / seats) * 100) : 0} />
            <p className="text-xs text-muted-foreground font-body">{t('seatsHint')}</p>
          </CardContent>
        </Card>

        {/* Join link */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2"><Link2 className="w-5 h-5 text-brand" /> {t('linkTitle')}</CardTitle>
            <CardDescription className="font-body">{org.invite_link_enabled ? t('linkBody') : t('linkOff')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="link-toggle" checked={!!org.invite_link_enabled} onCheckedChange={toggleLink} />
              <Label htmlFor="link-toggle" className="font-body text-sm">{t('linkToggle')}</Label>
            </div>
            {org.invite_link_enabled && org.invite_path && (
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 min-w-0 truncate rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">{fullUrl(org.invite_path)}</code>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="font-body gap-1.5" onClick={() => copy(org.invite_path!)}><Copy className="w-3.5 h-3.5" /> {t('copy')}</Button>
                  <Button size="sm" variant="outline" className="font-body gap-1.5" onClick={() => setConfirmNewLink(true)}><RefreshCw className="w-3.5 h-3.5" /> {t('newLink')}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite by email */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand" /> {t('inviteTitle')}</CardTitle>
          <CardDescription className="font-body">{t('inviteBody')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendInvites} className="space-y-3">
            <Textarea rows={3} value={emails} onChange={(e) => setEmails(e.target.value)} placeholder={t('emailsPlaceholder')} aria-label={t('inviteTitle')} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="font-body text-sm">{t('role')}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'member' | 'admin')}>
                  <SelectTrigger className="w-40 font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t('roles.member')}</SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={inviting || !emails.trim()} className="sm:ml-auto bg-brand hover:bg-brand/90 text-white font-body gap-2">
                {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('inviting')}</> : t('invite')}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="font-heading font-semibold text-foreground text-sm">{t('pendingTitle')}</h3>
            {org.invites && org.invites.length > 0 ? (
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {org.invites.map((inv) => (
                  <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-foreground break-all">{inv.email}</p>
                      <p className="text-xs text-muted-foreground font-body">{t(`roles.${inv.role}`)} · {t('expires', { date: date(inv.expires_at) })}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="font-body gap-1.5" onClick={() => copy(inv.path)}><Copy className="w-3.5 h-3.5" /> {t('copyLink')}</Button>
                      <Button size="sm" variant="ghost" className="font-body gap-1.5 text-muted-foreground" onClick={() => cancelInvite(inv)} aria-label={t('cancelInvite')}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground font-body">{t('noPending')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">{t('membersTitle', { count: org.members?.length ?? 0 })}</CardTitle>
          <CardDescription className="font-body flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald" /> {t('privacyNote')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {org.members?.map((m) => (
              <li key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-body text-foreground">
                    {m.name || m.email}
                    {m.is_you && <span className="ml-2 text-xs text-muted-foreground">({t('you')})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground font-body break-all">{m.name ? `${m.email} · ` : ''}{t('joined', { date: date(m.joined_at) })}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && !m.is_you ? (
                    <Select value={m.role} onValueChange={(v) => changeRole(m, v)}>
                      <SelectTrigger size="sm" className="w-36 font-body"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['owner', 'admin', 'member'] as const).map((r) => <SelectItem key={r} value={r}>{t(`roles.${r}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="font-body">{t(`roles.${m.role}`)}</Badge>
                  )}
                  {canRemove(m) && (
                    <Button size="sm" variant="ghost" className="font-body text-rose-600 hover:text-rose-700" onClick={() => setRemoving(m)}>{t('remove')}</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeTitle', { name: removing?.name || removing?.email || '' })}</AlertDialogTitle>
            <AlertDialogDescription>{t('removeBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">{t('remove')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmNewLink} onOpenChange={setConfirmNewLink}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('newLink')}</AlertDialogTitle>
            <AlertDialogDescription>{t('newLinkConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={newLink}>{t('newLink')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
