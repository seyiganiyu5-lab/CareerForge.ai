'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { PENDING_JOIN_KEY } from '@/components/enterprise/pending-join';

interface JoinInfo {
  organization: string;
  logo_url: string | null;
  kind: 'invite' | 'link';
  invite_email: string | null;
  signed_in: boolean;
  problem: string | null;
}

const KNOWN_ERRORS = ['not_found', 'expired', 'inactive', 'link_disabled', 'no_seats', 'wrong_email', 'other_org', 'already_member', 'rate_limited'];

export default function JoinPage() {
  const t = useTranslations('app.join');
  const { code } = useParams<{ code: string }>();
  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/join/${encodeURIComponent(code)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) { setError(data.error || 'failed'); return; }
        setInfo(data);
        // After signing up (or logging in with Google) the dashboard brings them back here
        if (!data.signed_in) {
          try { localStorage.setItem(PENDING_JOIN_KEY, code); } catch { /* private mode */ }
        }
      })
      .catch(() => setError('failed'));
  }, [code]);

  const join = async () => {
    setJoining(true);
    const res = await fetch(`/api/join/${encodeURIComponent(code)}`, { method: 'POST', credentials: 'include' }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setJoining(false);
    if (res?.ok && data?.success) {
      try { localStorage.removeItem(PENDING_JOIN_KEY); } catch { /* private mode */ }
      setJoined(true);
    } else {
      setError(data?.error || 'failed');
    }
  };

  const errorText = (e: string) =>
    t(`errors.${KNOWN_ERRORS.includes(e) ? e : 'failed'}`, { email: info?.invite_email ?? '', organization: info?.organization ?? '' });

  const problem = error ?? info?.problem ?? null;
  const here = `/join/${encodeURIComponent(code)}`;

  return (
    <div className="bg-background min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {!info && !error ? (
          <p className="flex items-center justify-center gap-2 text-muted-foreground font-body">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('loading')}
          </p>
        ) : joined && info ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald mx-auto" />
            <h1 className="mt-4 font-heading text-xl font-bold text-foreground">{t('successTitle', { organization: info.organization })}</h1>
            <p className="mt-2 text-sm text-muted-foreground font-body">{t('successBody')}</p>
            {/* Full reload so the new plan and menu show everywhere */}
            <Button className="mt-6 w-full bg-brand hover:bg-brand/90 text-white font-body" onClick={() => { window.location.href = '/home'; }}>
              {t('goToDashboard')}
            </Button>
          </>
        ) : (
          <>
            {info?.logo_url ? (
              <img src={info.logo_url} alt={info.organization} className="w-16 h-16 mx-auto rounded-xl object-contain bg-white border border-border" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7 text-brand" />
              </div>
            )}
            {info && (
              <>
                <h1 className="mt-4 font-heading text-xl font-bold text-foreground">{t('title', { organization: info.organization })}</h1>
                <p className="mt-2 text-sm text-muted-foreground font-body">{t('body', { organization: info.organization })}</p>
                {info.invite_email && <p className="mt-2 text-sm font-body text-foreground">{t('forEmail', { email: info.invite_email })}</p>}
                <p className="mt-3 text-xs text-muted-foreground font-body">{t('sharing')}</p>
              </>
            )}

            {problem && (
              <p className="mt-5 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-left text-sm text-amber-700 dark:text-amber-300 font-body" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorText(problem)}
              </p>
            )}

            {info && !info.signed_in && !problem && (
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground font-body">{t('signedOutHint')}</p>
                <Button asChild className="w-full bg-brand hover:bg-brand/90 text-white font-body">
                  <Link href="/signup">{t('signup')}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full font-body">
                  <Link href={`/login?redirect=${encodeURIComponent(here)}`}>{t('login')}</Link>
                </Button>
              </div>
            )}

            {info?.signed_in && !problem && (
              <Button className="mt-6 w-full bg-brand hover:bg-brand/90 text-white font-body" disabled={joining} onClick={join}>
                {joining ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('joining')}</> : t('join', { organization: info.organization })}
              </Button>
            )}
            {info?.signed_in && problem === 'already_member' && (
              <Button asChild variant="outline" className="mt-6 w-full font-body"><Link href="/organization">{t('goToDashboard')}</Link></Button>
            )}
            {info?.signed_in && problem === 'wrong_email' && (
              <Button asChild variant="outline" className="mt-6 w-full font-body">
                <Link href={`/login?redirect=${encodeURIComponent(here)}`}>{t('login')}</Link>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
