'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Briefcase, Mail, CalendarClock, MessageSquareReply, Hourglass, Gift, AlarmClock, Gauge, CreditCard, Building2, UserPlus, UserMinus, Users, LogIn, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/provider';
import { useRelativeTime } from '@/i18n/use-relative-time';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useJobLabels } from '@/components/job-tracker/use-job-labels';
import { cn } from '@/lib/utils';

interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  link: string | null;
  read: boolean;
  createdAt: string;
}

/** Other components dispatch this after creating/removing notifications */
export const NOTIFICATIONS_CHANGED = 'cf:notifications-changed';

const POLL_MS = 60_000;

const ICONS: Record<string, LucideIcon> = {
  job_status: Briefcase,
  job_interview_soon: CalendarClock,
  job_follow_up: MessageSquareReply,
  job_deadline: Hourglass,
  job_offer_expiry: Gift,
  job_reminder: AlarmClock,
  usage_warning: Gauge,
  usage_limit: Gauge,
  forwarding_confirm: Mail,
  forward_skipped_limit: Gauge,
  payment_success: CreditCard,
  plan_ending: CreditCard,
  plan_expired: CreditCard,
  enterprise_lead: Building2,
  org_invite: UserPlus,
  org_joined: Users,
  org_removed: UserMinus,
  org_invoice: CreditCard,
  org_paid: CreditCard,
  org_ending: CalendarClock,
  admin_signin: LogIn,
};

// Usage counter → feature name (app.features.*)
const USAGE_FEATURE: Record<string, string> = {
  ai_requests: 'AI_REQUESTS',
  resume_reviews: 'AI_RESUME_REVIEW',
  resume_count: 'CREATE_RESUME',
  cover_letter_count: 'CREATE_COVER_LETTER',
  exports_count: 'PDF_EXPORT',
  ats_checks: 'ATS_CHECKER',
  job_applications_count: 'JOB_TRACKER',
};

export default function NotificationDropdown() {
  const t = useTranslations('dashboard.notifications');
  const tf = useTranslations('app.features');
  const { locale } = useLocale();
  const router = useRouter();
  const relative = useRelativeTime();
  const labels = useJobLabels();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setItems(data.notifications);
        setUnread(data.unread);
      }
    } catch {
      // offline: keep what we have
    }
  }, []);

  // Load now, every minute, when the tab regains focus, and when told something changed
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener(NOTIFICATIONS_CHANGED, onFocus);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(NOTIFICATIONS_CHANGED, onFocus);
    };
  }, [load]);

  const markRead = async (ids?: string[]) => {
    setItems((prev) => prev.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)));
    setUnread((u) => (ids ? Math.max(0, u - ids.filter((id) => items.find((n) => n.id === id && !n.read)).length) : 0));
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids ? { ids } : {}),
      });
    } catch {
      // will resync on next load
    }
  };

  const openItem = (n: AppNotification) => {
    if (!n.read) markRead([n.id]);
    setOpen(false);
    if (!n.link) return;
    // Outside links (e.g. Gmail's confirmation page) open in a new tab
    if (/^https?:\/\//.test(n.link)) window.open(n.link, '_blank', 'noopener,noreferrer');
    else router.push(n.link);
  };

  const when = (iso: unknown) => {
    const d = new Date(String(iso));
    if (isNaN(d.getTime())) return '';
    const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0;
    return d.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short', day: 'numeric', month: 'short',
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  const describe = (n: AppNotification) => {
    const d = n.data as Record<string, string>;
    const where = [d.company, d.jobTitle && d.jobTitle !== '—' ? d.jobTitle : ''].filter(Boolean).join(' — ');
    switch (n.type) {
      case 'job_interview_soon': return { title: where, body: t('interviewSoon', { when: when(d.date) }) };
      case 'job_follow_up': return { title: where, body: t('followUpDue') };
      case 'job_deadline': return { title: where, body: t('deadlineSoon', { when: when(d.date) }) };
      case 'job_offer_expiry': return { title: where, body: t('offerExpires', { when: when(d.date) }) };
      case 'job_reminder': return { title: where, body: t('reminderDue', { title: d.title || '', when: when(d.date) }) };
      case 'forwarding_confirm':
        return { title: t('fwdConfirmTitle'), body: t('fwdConfirmBody', { code: d.code || '—' }) };
      case 'forward_skipped_limit':
        return { title: t('fwdSkippedTitle'), body: t('fwdSkippedBody', { subject: d.subject || '—' }) };
      case 'org_invoice':
      case 'org_paid': {
        const p = n.data as { amount?: number; currency?: string; seats?: number; months?: number; organization?: string; until?: string | null };
        const amount = typeof p.amount === 'number' && p.currency
          ? new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: p.currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: p.amount % 100 ? 2 : 0 }).format(p.amount / 100)
          : '';
        return n.type === 'org_invoice'
          ? { title: t('orgInvoiceTitle'), body: t('orgInvoiceBody', { amount, seats: p.seats ?? 0 }) }
          : { title: t('orgPaidTitle'), body: t('orgPaidBody', { organization: p.organization || '—', amount, until: p.until ? when(p.until) : '—' }) };
      }
      case 'admin_signin':
        return { title: t('adminSigninTitle'), body: t('adminSigninBody', { email: d.email || '—', device: d.device || '—', when: when(d.date) }) };
      case 'org_ending':
        return { title: t('orgEndingTitle'), body: t('orgEndingBody', { organization: d.organization || '—', when: when(d.date) }) };
      case 'payment_success': {
        const p = n.data as { plan?: string; amount?: number; currency?: string; until?: string | null };
        const amount = typeof p.amount === 'number' && p.currency
          ? new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: p.currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: p.amount % 100 ? 2 : 0 }).format(p.amount / 100)
          : '';
        return { title: t('paymentTitle'), body: t('paymentBody', { plan: p.plan || 'Pro', amount, until: p.until ? when(p.until) : '—' }) };
      }
      case 'plan_ending':
        return { title: t('planEndingTitle'), body: t('planEndingBody', { plan: d.plan || 'Pro', when: when(d.date) }) };
      case 'plan_expired':
        return { title: t('planExpiredTitle'), body: t('planExpiredBody', { plan: d.plan || 'Pro' }) };
      case 'enterprise_lead':
        return { title: t('leadTitle'), body: t('leadBody', { organization: d.organization || '—', teamSize: d.teamSize || '—', name: d.name || '—' }) };
      case 'org_invite':
        return { title: t('orgInviteTitle'), body: t('orgInviteBody', { organization: d.organization || '—' }) };
      case 'org_joined':
        return { title: t('orgJoinedTitle'), body: t('orgJoinedBody', { name: d.name || '—', organization: d.organization || '—' }) };
      case 'org_removed':
        return { title: t('orgRemovedTitle'), body: t('orgRemovedBody', { organization: d.organization || '—' }) };
      case 'usage_warning':
      case 'usage_limit': {
        const u = n.data as { field?: string; used?: number; limit?: number };
        const feature = USAGE_FEATURE[u.field ?? ''] ? tf(USAGE_FEATURE[u.field ?? '']) : '';
        return n.type === 'usage_limit'
          ? { title: t('usageLimitTitle'), body: t('usageLimit', { feature, limit: u.limit ?? 0 }) }
          : { title: t('usageWarningTitle'), body: t('usageWarning', { feature, used: u.used ?? 0, limit: u.limit ?? 0 }) };
      }
    }
    if (n.type === 'job_status') {
      const to = labels.status(d.to ?? '');
      return {
        title: where,
        body: d.from ? t('jobMoved', { from: labels.status(d.from), to }) : t('jobAdded', { to }),
      };
    }
    return { title: '', body: '' };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={t('title')}>
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-4 text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold font-heading">{t('title')}</h3>
          {unread > 0 && (
            <button onClick={() => markRead()} className="text-xs text-brand hover:underline font-body">
              {t('markAllRead')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">{t('noNotifications')}</p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto divide-y divide-border/50">
            {items.map((n) => {
              const { title, body } = describe(n);
              return (
                <li key={n.id}>
                  <button
                    onClick={() => openItem(n)}
                    className={cn('w-full flex gap-3 px-4 py-3 text-left hover:bg-accent transition-colors', !n.read && 'bg-brand/5')}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      n.type === 'usage_limit' || n.type === 'forward_skipped_limit' ? 'bg-red-500/10 text-red-600' : n.type === 'usage_warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-brand/10 text-brand'
                    )}>
                      {(() => { const Icon = ICONS[n.type] ?? Bell; return <Icon className="w-4 h-4" />; })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      {title && <p className="text-sm font-semibold font-body truncate">{title}</p>}
                      <p className="text-sm text-muted-foreground font-body">{body}</p>
                      <p className="text-[11px] text-muted-foreground/80 font-body mt-0.5 flex items-center gap-1">
                        {n.data.source === 'email' && <Mail className="w-3 h-3" />}
                        {n.data.source === 'email' ? `${t('fromEmail')} · ` : ''}
                        {relative(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
