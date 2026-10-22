'use client';

import { useState } from 'react';
import {
  GraduationCap, School, Briefcase, HeartHandshake, Building2, Users, Link2, BarChart3,
  ShieldCheck, Palette, CreditCard, ArrowRight, CheckCircle2, Loader2, Info,
} from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORG_TYPES, TEAM_SIZES } from '@/lib/enterprise/leads';

const WHO = [
  { key: 'university', icon: GraduationCap },
  { key: 'training', icon: School },
  { key: 'agency', icon: Briefcase },
  { key: 'ngo', icon: HeartHandshake },
  { key: 'company', icon: Building2 },
] as const;

const INCLUDED = [
  { key: 'seats', icon: Users },
  { key: 'invites', icon: Link2 },
  { key: 'dashboard', icon: BarChart3 },
  { key: 'privacy', icon: ShieldCheck },
  { key: 'branding', icon: Palette },
  { key: 'billing', icon: CreditCard },
] as const;

const EMPTY = { name: '', email: '', organization: '', org_type: '', team_size: '', country: '', phone: '', message: '', website: '' };

export default function EnterprisePage() {
  const t = useTranslations('enterprise');
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.organization.trim() || !form.org_type || !form.team_size) {
      setError(t('errors.required'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t('errors.email'));
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/enterprise/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSentTo(form.email.trim());
        setForm(EMPTY);
      } else {
        setError(
          data.error === 'rate_limited' ? t('errors.rateLimited')
            : data.error === 'invalid' ? (data.fields?.includes('email') ? t('errors.email') : t('errors.required'))
              : t('errors.failed'),
        );
      }
    } catch {
      setError(t('errors.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-violet/5 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <span className="inline-block bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body">
            {t('badge')}
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mt-6 max-w-3xl mx-auto">{t('title')}</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto font-body md:text-lg">{t('subtitle')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
              <a href="#contact">{t('ctaPrimary')} <ArrowRight className="w-4 h-4" /></a>
            </Button>
            <Button asChild variant="outline" className="font-body">
              <a href="#included">{t('ctaSecondary')}</a>
            </Button>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground font-body">
            <Info className="w-4 h-4 text-brand shrink-0" /> {t('rollout')}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Who it's for */}
        <section className="py-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center">{t('whoTitle')}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WHO.map(({ key, icon: Icon }) => (
              <div key={key} className="rounded-xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-foreground">{t(`who.${key}.title`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{t(`who.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section id="included" className="py-16 border-t border-border/50 scroll-mt-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center">{t('includedTitle')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map(({ key, icon: Icon }) => (
              <div key={key} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-violet/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-violet" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{t(`included.${key}.title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground font-body">{t(`included.${key}.body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 border-t border-border/50">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center">{t('howTitle')}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {(['1', '2', '3'] as const).map((n) => (
              <li key={n} className="rounded-xl border border-border bg-card p-6">
                <span className="flex w-8 h-8 items-center justify-center rounded-full bg-brand text-white text-sm font-bold font-heading">{n}</span>
                <h3 className="mt-4 font-heading font-semibold text-foreground">{t(`how.${n}.title`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{t(`how.${n}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Contact form */}
        <section id="contact" className="py-16 border-t border-border/50 scroll-mt-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center">{t('formTitle')}</h2>
            <p className="mt-2 text-center text-muted-foreground font-body">{t('formSubtitle')}</p>

            {sentTo ? (
              <div className="mt-8 rounded-xl border border-emerald/30 bg-emerald/5 p-8 text-center" role="status">
                <CheckCircle2 className="w-10 h-10 text-emerald mx-auto" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{t('successTitle')}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{t('successBody', { email: sentTo })}</p>
                <Button variant="outline" className="mt-6 font-body" onClick={() => setSentTo(null)}>{t('sendAnother')}</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8 space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label={`${t('fields.name')} *`}>
                    <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set('name')(e.target.value)} maxLength={120} />
                  </Field>
                  <Field id="email" label={`${t('fields.email')} *`}>
                    <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email')(e.target.value)} maxLength={200} />
                  </Field>
                  <Field id="organization" label={`${t('fields.organization')} *`}>
                    <Input id="organization" autoComplete="organization" value={form.organization} onChange={(e) => set('organization')(e.target.value)} maxLength={160} />
                  </Field>
                  <Field id="country" label={t('fields.country')}>
                    <Input id="country" autoComplete="country-name" value={form.country} onChange={(e) => set('country')(e.target.value)} maxLength={80} />
                  </Field>
                  <Field id="org_type" label={`${t('fields.orgType')} *`}>
                    <Select value={form.org_type} onValueChange={set('org_type')}>
                      <SelectTrigger id="org_type" className="w-full"><SelectValue placeholder={t('select')} /></SelectTrigger>
                      <SelectContent>
                        {ORG_TYPES.map((o) => <SelectItem key={o} value={o}>{t(`orgTypes.${o}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="team_size" label={`${t('fields.teamSize')} *`}>
                    <Select value={form.team_size} onValueChange={set('team_size')}>
                      <SelectTrigger id="team_size" className="w-full"><SelectValue placeholder={t('select')} /></SelectTrigger>
                      <SelectContent>
                        {TEAM_SIZES.map((s) => <SelectItem key={s} value={s}>{t(`teamSizes.${s}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="phone" label={t('fields.phone')}>
                    <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} maxLength={40} />
                  </Field>
                </div>
                <Field id="message" label={t('fields.message')}>
                  <Textarea id="message" rows={4} placeholder={t('fields.messagePlaceholder')} value={form.message} onChange={(e) => set('message')(e.target.value)} maxLength={2000} />
                </Field>
                {/* Hidden from people; bots fill it in */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => set('website')(e.target.value)} />

                {error && <p className="text-sm text-destructive font-body" role="alert">{error}</p>}

                <Button type="submit" disabled={sending} className="w-full bg-brand hover:bg-brand/90 text-white font-body gap-2">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('sending')}</> : <>{t('submit')} <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <p className="text-xs text-muted-foreground text-center font-body">{t('privacyNote')}</p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-body">{label}</Label>
      {children}
    </div>
  );
}
