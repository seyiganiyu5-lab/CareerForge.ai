'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, Undo2, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n/provider';
import { useJobLabels } from '@/components/job-tracker/use-job-labels';
import type { JobApplication } from '@/hooks/use-job-tracker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForwardingPanel } from '@/components/job-tracker/forwarding-panel';
import { NOTIFICATIONS_CHANGED } from '@/components/dashboard/notification-dropdown';

type EmailKind = 'application_received' | 'assessment' | 'interview' | 'offer' | 'rejection' | 'other';

interface ImportResult {
  analysis: { kind: EmailKind; company: string; jobTitle: string; summary: string; date: string | null };
  action: 'created' | 'updated' | 'none';
  reason?: 'not_job_email' | 'no_company';
  statusChanged?: boolean;
  application?: JobApplication;
  previous?: Record<string, unknown>;
  previousStatus?: string;
  notificationId?: string | null;
}

const KIND_KEYS: Record<EmailKind, string> = {
  application_received: 'kindApplied',
  assessment: 'kindAssessment',
  interview: 'kindInterview',
  offer: 'kindOffer',
  rejection: 'kindRejection',
  other: 'kindOther',
};

interface EmailImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: JobApplication[];
  /** Called after the tracker data changed (import or undo) */
  onChanged: () => void;
  onLimitReached?: () => void;
}

const AUTO = '__auto__';

export function EmailImportDialog({ open, onOpenChange, applications, onChanged, onLimitReached }: EmailImportDialogProps) {
  const t = useTranslations('app.jobTrackerUi');
  const tc = useTranslations('app.common');
  const labels = useJobLabels();
  const [email, setEmail] = useState('');
  const [target, setTarget] = useState(AUTO);
  const [loading, setLoading] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [tab, setTab] = useState<'paste' | 'forward'>('paste');

  const reset = () => {
    setEmail('');
    setTarget(AUTO);
    setResult(null);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    if (email.trim().length < 20) {
      toast.error(t('emailTooShort'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/job-tracker/from-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, applicationId: target === AUTO ? undefined : target }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error === 'limit_reached') {
          if (onLimitReached) onLimitReached();
          else toast.error(t('aiLimitReached'));
        } else {
          toast.error(data.error === 'invalid_email' ? t('emailTooShort') : data.error || t('emailReadFailed'));
        }
        return;
      }
      const before = target === AUTO
        ? applications.find((a) => a.id === data.application?.id)?.status
        : applications.find((a) => a.id === target)?.status;
      setResult({ ...data, previousStatus: data.previous?.status ?? before });
      if (data.action !== 'none') onChanged();
      if (data.notificationId) window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch {
      toast.error(tc('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const undo = async () => {
    if (!result?.application) return;
    setUndoing(true);
    try {
      const id = result.application.id;
      const res = result.action === 'created'
        ? await fetch(`/api/job-tracker/${id}`, { method: 'DELETE', credentials: 'include' })
        : await fetch(`/api/job-tracker/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.previous),
        });
      if (!res.ok) throw new Error();
      // The change is gone, so is its notification
      if (result.notificationId) {
        await fetch(`/api/notifications/${result.notificationId}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
      }
      toast.success(t('emailUndone'));
      onChanged();
      reset();
    } catch {
      toast.error(t('emailUndoFailed'));
    } finally {
      setUndoing(false);
    }
  };

  const a = result?.analysis;
  const app = result?.application;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg font-body max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Mail className="w-5 h-5 text-brand" />
            {t('emailImportTitle')}
          </DialogTitle>
          <DialogDescription>{t('emailImportDesc')}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'paste' | 'forward')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="paste">{t('tabPaste')}</TabsTrigger>
            <TabsTrigger value="forward">{t('tabForward')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === 'forward' ? <ForwardingPanel /> : (<>

        {!result ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-text" className="text-xs">{t('emailLabel')}</Label>
              <Textarea
                id="email-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="min-h-[200px] text-sm"
                disabled={loading}
              />
            </div>
            {applications.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t('emailTarget')}</Label>
                <Select value={target} onValueChange={setTarget} disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO}>{t('emailTargetAuto')}</SelectItem>
                    {applications.map((ap) => (
                      <SelectItem key={ap.id} value={ap.id}>
                        {ap.company_name} — {ap.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-xs text-muted-foreground flex gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {t('emailPrivacy')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{t(KIND_KEYS[a!.kind])}</Badge>
                {a!.company && <span className="text-sm font-semibold">{a!.company}</span>}
                {a!.jobTitle && <span className="text-sm text-muted-foreground">· {a!.jobTitle}</span>}
              </div>
              {a!.summary && <p className="text-sm text-muted-foreground">{a!.summary}</p>}
            </div>

            <div className="flex items-start gap-2 text-sm">
              {result.action === 'none' ? (
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
              )}
              <div>
                {result.action === 'created' && app && (
                  <p>{t('emailCreated', { status: labels.status(app.status) })}</p>
                )}
                {result.action === 'updated' && app && (
                  result.statusChanged && result.previousStatus ? (
                    <p className="flex items-center gap-1.5 flex-wrap">
                      {t('emailMoved')}
                      <Badge variant="outline">{labels.status(result.previousStatus)}</Badge>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <Badge>{labels.status(app.status)}</Badge>
                    </p>
                  ) : (
                    <p>{t('emailNoteOnly')}</p>
                  )
                )}
                {result.action === 'none' && (
                  <p>{result.reason === 'no_company' ? t('emailNoCompany') : t('emailNotJob')}</p>
                )}
                {app && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {app.company_name} — {app.job_title}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {!result ? (
            <>
              <Button variant="outline" onClick={() => close(false)} disabled={loading}>{tc('cancel')}</Button>
              <Button onClick={submit} disabled={loading || !email.trim()} className="bg-brand hover:bg-brand/90 text-white gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? t('emailReading') : t('emailSubmit')}
              </Button>
            </>
          ) : (
            <>
              {result.action !== 'none' && (
                <Button variant="outline" onClick={undo} disabled={undoing} className="gap-2">
                  {undoing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                  {t('emailUndo')}
                </Button>
              )}
              <Button variant="outline" onClick={reset}>{t('emailAnother')}</Button>
              <Button onClick={() => close(false)} className="bg-brand hover:bg-brand/90 text-white">{t('emailDone')}</Button>
            </>
          )}
        </DialogFooter>
        </>)}
      </DialogContent>
    </Dialog>
  );
}
