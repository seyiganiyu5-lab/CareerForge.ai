'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Briefcase, Mail } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
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

export default function NotificationDropdown() {
  const t = useTranslations('dashboard.notifications');
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
    if (n.link) router.push(n.link);
  };

  const describe = (n: AppNotification) => {
    if (n.type === 'job_status') {
      const d = n.data as { company?: string; jobTitle?: string; from?: string | null; to?: string };
      const where = [d.company, d.jobTitle && d.jobTitle !== '—' ? d.jobTitle : ''].filter(Boolean).join(' — ');
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
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
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
