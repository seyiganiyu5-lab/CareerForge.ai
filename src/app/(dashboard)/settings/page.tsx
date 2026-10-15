'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/lib/motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale, useTranslations } from '@/i18n/provider';
import type { Locale } from '@/i18n/config';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/auth/password-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Shield,
  Trash2,
  KeyRound,
  Loader2,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: 'light', label: 'themeLight', icon: Sun },
  { value: 'dark', label: 'themeDark', icon: Moon },
  { value: 'system', label: 'themeSystem', icon: Monitor },
] as const;

// Only languages the site has translations for; shown in their own language
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
] as const;

type ThemeValue = 'light' | 'dark' | 'system';

// ── Helpers ──────────────────────────────────────────────────────────────────

function applyTheme(theme: ThemeValue) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    }
  } else {
    root.classList.add(theme);
  }
}

// ── Animation ────────────────────────────────────────────────────────────────

// Replaced framer-motion variants with FadeInUp from @/lib/motion

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-64" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations('app.settings');
  const tc = useTranslations('app.common');
  const { locale, setLocale } = useLocale();
  const [theme, setTheme] = useState<ThemeValue>('system');
  const [loading, setLoading] = useState(true);
  const [themeUpdating, setThemeUpdating] = useState(false);
  const [langUpdating, setLangUpdating] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/user/settings', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.settings) {
        setTheme((data.settings.theme as ThemeValue) || 'system');
      } else {
        toast.error(data.error || t('loadFailed'));
      }
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleThemeChange = async (newTheme: ThemeValue) => {
    // Apply immediately for instant feedback
    applyTheme(newTheme);
    setThemeUpdating(true);
    setTheme(newTheme);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('themeUpdated'));
      } else {
        toast.error(data.error || t('themeFailed'));
      }
    } catch {
      toast.error(t('themeFailed'));
    } finally {
      setThemeUpdating(false);
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setLangUpdating(true);
    if (newLang === 'en' || newLang === 'fr') setLocale(newLang as Locale);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('languageUpdated'));
      } else {
        toast.error(data.error || t('languageFailed'));
      }
    } catch {
      toast.error(t('languageFailed'));
    } finally {
      setLangUpdating(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDontMatch'));
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('passwordChanged'));
        setPasswordDialogOpen(false);
        resetPasswordForm();
      } else {
        toast.error(data.error || t('passwordFailed'));
      }
    } catch {
      toast.error(t('passwordFailed'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('accountDeleted'));
        window.location.href = '/';
        return;
      }
      toast.error(data.error || t('deleteFailed'));
    } catch {
      toast.error(t('deleteFailed'));
    }
    setDeleting(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <FadeInUp className="space-y-6 max-w-3xl mx-auto" duration={0.4}>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <FadeInUp className="space-y-1" delay={0}>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Settings className="size-6 text-brand" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground font-body">
          {t('subtitle')}
        </p>
      </FadeInUp>

      {/* ── Theme Card ────────────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 1}>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Sun className="size-5 text-brand" />
              {t('theme')}
            </CardTitle>
            <CardDescription className="font-body">
              {t('themeSub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleThemeChange(opt.value)}
                    disabled={themeUpdating}
                    className={`
                      relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4
                      transition-all duration-200 cursor-pointer
                      font-body
                      ${
                        isActive
                          ? 'border-brand bg-brand/5 text-brand shadow-sm'
                          : 'border-border bg-card hover:border-brand/40 hover:bg-muted/50 text-foreground'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {themeUpdating && isActive && (
                      <Loader2 className="absolute top-2 right-2 size-3 animate-spin text-brand" />
                    )}
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{t(opt.label)}</span>
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand flex items-center justify-center">
                        <svg
                          className="size-2.5 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeInUp>

      {/* ── Language Card ─────────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 2}>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Globe className="size-5 text-brand" />
              {t('language')}
            </CardTitle>
            <CardDescription className="font-body">
              {t('languageSub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select
                value={locale}
                onValueChange={handleLanguageChange}
                disabled={langUpdating}
              >
                <SelectTrigger className="w-full font-body">
                  {langUpdating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    <SelectValue placeholder={t('selectLanguage')} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>

      {/* ── Danger Zone Card ──────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 3}>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-destructive">
              <Shield className="size-5" />
              {t('dangerZone')}
            </CardTitle>
            <CardDescription className="font-body">
              {t('dangerZoneSub')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium font-body flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground shrink-0" />
                  {t('changePassword')}
                </p>
                <p className="text-sm text-muted-foreground font-body pl-6">
                  {t('changePasswordSub')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPasswordDialogOpen(true)}
                className="shrink-0 font-body w-full sm:w-auto"
              >
                {t('changePassword')}
              </Button>
              <Dialog
                open={passwordDialogOpen}
                onOpenChange={(open) => {
                  setPasswordDialogOpen(open);
                  if (!open) resetPasswordForm();
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">{t('changePassword')}</DialogTitle>
                    <DialogDescription className="font-body">
                      {t('changePasswordDialog')}
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleChangePassword();
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="font-body">{t('currentPassword')}</Label>
                      <PasswordInput id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-body">{t('newPassword')}</Label>
                      <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <p className="text-xs text-muted-foreground font-body">
                        {t('passwordHint')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-body">{t('confirmPassword')}</Label>
                      <PasswordInput id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        className="font-body"
                        onClick={() => setPasswordDialogOpen(false)}
                      >
                        {tc('cancel')}
                      </Button>
                      <Button
                        type="submit"
                        className="font-body"
                        disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                      >
                        {passwordSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                        {t('saveNewPassword')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium font-body flex items-center gap-2">
                  <Trash2 className="size-4 text-destructive shrink-0" />
                  {t('deleteAccount')}
                </p>
                <p className="text-sm text-muted-foreground font-body pl-6">
                  {t('deleteAccountSub')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="shrink-0 font-body w-full sm:w-auto"
                  >
                    <Trash2 className="size-4 mr-2" />
                    {t('deleteAccount')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">
                      {t('deleteConfirmTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      {t('deleteConfirmBody')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-body">
                      {tc('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAccount();
                      }}
                      disabled={deleting}
                      className="font-body bg-destructive text-white hover:bg-destructive/90"
                    >
                      {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
                      {t('deleteConfirmYes')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>
    </FadeInUp>
  );
}