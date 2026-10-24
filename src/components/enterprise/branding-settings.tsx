'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Building2, ImageUp, Loader2, Palette, LayoutTemplate, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTemplates } from '@/lib/templates/registry';
import { MAX_LOGO_BYTES, MAX_RECOMMENDED_TEMPLATES, MIN_CONTRAST, contrastWithWhite } from '@/lib/enterprise/branding';
import { cn } from '@/lib/utils';

const DEFAULT_BRAND = '#2563eb';
const HEX = /^#[0-9a-f]{6}$/i;

interface Branding {
  name: string;
  brand_color: string | null;
  logo_url: string | null;
  recommended_templates: string[];
}

export default function BrandingSettings({ org, reload }: { org: Branding; reload: () => Promise<void> }) {
  const t = useTranslations('app.orgBranding');
  const { refreshSession } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(org.brand_color ?? '');
  const [picked, setPicked] = useState<string[]>(org.recommended_templates);

  const shown = HEX.test(color) ? color : DEFAULT_BRAND;
  const readable = !color || (HEX.test(color) && contrastWithWhite(color) >= MIN_CONTRAST);
  const dirty = (color || null) !== (org.brand_color ?? null) || picked.join() !== org.recommended_templates.join();

  // Menu, colours and template badges come from the session
  const refresh = async () => { await Promise.all([reload(), refreshSession(true)]); };

  const upload = async (file: File) => {
    if (file.size > MAX_LOGO_BYTES) { toast.error(t('tooBig')); return; }
    setUploading(true);
    const body = new FormData();
    body.append('logo', file);
    const res = await fetch('/api/organization/logo', { method: 'POST', credentials: 'include', body }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setUploading(false);
    if (res?.ok) {
      toast.success(t('logoSaved'));
      refresh();
    } else {
      toast.error(data?.error === 'too_big' ? t('tooBig') : data?.error === 'bad_type' ? t('badType') : t('failed'));
    }
  };

  const removeLogo = async () => {
    const res = await fetch('/api/organization/logo', { method: 'DELETE', credentials: 'include' }).catch(() => null);
    if (res?.ok) { toast.success(t('logoRemoved')); refresh(); } else toast.error(t('failed'));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/organization/branding', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_color: color || null, recommended_templates: picked }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setSaving(false);
    if (res?.ok) {
      toast.success(t('saved'));
      refresh();
    } else {
      toast.error(data?.error === 'low_contrast' ? t('lowContrast') : data?.error === 'invalid_color' ? t('invalidColor') : t('failed'));
    }
  };

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX_RECOMMENDED_TEMPLATES ? [...p, id] : p));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground font-body">{t('intro')}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2"><ImageUp className="w-5 h-5 text-brand" /> {t('logoTitle')}</CardTitle>
            <CardDescription className="font-body">{t('logoBody')}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {org.logo_url ? (
              <img src={org.logo_url} alt={t('logoAlt', { organization: org.name })} className="w-20 h-20 rounded-xl object-contain bg-white border border-border" />
            ) : (
              <div className="w-20 h-20 rounded-xl border border-dashed border-border flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="font-body gap-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
                  {org.logo_url ? t('replaceLogo') : t('uploadLogo')}
                </Button>
                {org.logo_url && (
                  <Button variant="ghost" className="font-body gap-2 text-muted-foreground" onClick={removeLogo}>
                    <Trash2 className="w-4 h-4" /> {t('removeLogo')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-body">{t('logoHint')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Colour */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-brand" /> {t('colorTitle')}</CardTitle>
            <CardDescription className="font-body">{t('colorBody')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={shown}
                onChange={(e) => setColor(e.target.value)}
                aria-label={t('colorTitle')}
                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value.trim())} placeholder={DEFAULT_BRAND} maxLength={7} className="w-28 font-mono text-sm" aria-label={t('hex')} />
              <span className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-white font-body" style={{ backgroundColor: shown }}>
                {t('preview')}
              </span>
              {color && (
                <Button variant="ghost" size="sm" className="font-body text-muted-foreground" onClick={() => setColor('')}>{t('useDefault')}</Button>
              )}
            </div>
            {!readable && (
              <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 font-body">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {HEX.test(color) ? t('lowContrast') : t('invalidColor')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended templates */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-brand" /> {t('templatesTitle')}</CardTitle>
          <CardDescription className="font-body">{t('templatesBody', { max: MAX_RECOMMENDED_TEMPLATES })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {getAllTemplates().map((tpl) => {
              const on = picked.includes(tpl.id);
              const full = !on && picked.length >= MAX_RECOMMENDED_TEMPLATES;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => toggle(tpl.id)}
                  disabled={full}
                  aria-pressed={on}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-50',
                    on ? 'border-brand bg-brand/5' : 'border-border hover:bg-accent',
                  )}
                >
                  <span className={cn('w-5 h-5 shrink-0 rounded border flex items-center justify-center', on ? 'bg-brand border-brand text-white' : 'border-border')}>
                    {on && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-body text-foreground truncate">{tpl.name}</span>
                  {on && <span className="text-xs font-semibold text-brand tabular-nums">{picked.indexOf(tpl.id) + 1}</span>}
                  {tpl.tier === 'pro' && <Badge variant="outline" className="text-[10px] font-body">Pro</Badge>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-brand hover:bg-brand/90 text-white font-body gap-2" disabled={!dirty || !readable || saving} onClick={save}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t('save')}
        </Button>
      </div>
    </div>
  );
}
