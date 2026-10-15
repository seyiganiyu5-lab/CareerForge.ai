'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Loader2, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/provider';

interface AddressState {
  enabled: boolean;
  address?: string;
}

/** The user's personal forwarding address, with Gmail / Outlook set-up steps. */
export function ForwardingPanel() {
  const t = useTranslations('app.jobTrackerUi');
  const tc = useTranslations('app.common');
  const [state, setState] = useState<AddressState | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/job-tracker/inbound-address', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.success) setState({ enabled: d.enabled, address: d.address }); })
      .catch(() => { if (!cancelled) toast.error(tc('networkError')); });
    return () => { cancelled = true; };
  }, [tc]);

  const copy = async () => {
    if (!state?.address) return;
    try {
      await navigator.clipboard.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('fwdCopyFailed'));
    }
  };

  const reset = async () => {
    if (!window.confirm(t('fwdResetConfirm'))) return;
    setResetting(true);
    try {
      const res = await fetch('/api/job-tracker/inbound-address', { method: 'POST', credentials: 'include' });
      const d = await res.json();
      if (!d.success) throw new Error();
      setState({ enabled: d.enabled, address: d.address });
      toast.success(t('fwdResetDone'));
    } catch {
      toast.error(t('fwdResetFailed'));
    } finally {
      setResetting(false);
    }
  };

  if (!state) {
    return <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (!state.enabled) {
    return (
      <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t('fwdNotAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{t('fwdIntro')}</p>

      <div className="space-y-1.5">
        <p className="text-xs font-medium">{t('fwdYourAddress')}</p>
        <div className="flex gap-2">
          <code className="flex-1 min-w-0 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs">{state.address}</code>
          <Button variant="outline" size="sm" onClick={copy} className="gap-1.5 shrink-0">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? tc('copied') : tc('copy')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('fwdKeepPrivate')}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold">Gmail</p>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>{t('fwdGmail1')}</li>
          <li>{t('fwdGmail2')}</li>
          <li>{t('fwdGmail3')}</li>
          <li>{t('fwdGmail4')}</li>
        </ol>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold">Outlook</p>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>{t('fwdOutlook1')}</li>
          <li>{t('fwdOutlook2')}</li>
        </ol>
      </div>

      <p className="text-xs text-muted-foreground flex gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        {t('fwdManual')}
      </p>

      <Button variant="ghost" size="sm" onClick={reset} disabled={resetting} className="gap-1.5 text-muted-foreground px-0 hover:bg-transparent hover:text-foreground">
        {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        {t('fwdReset')}
      </Button>
    </div>
  );
}
