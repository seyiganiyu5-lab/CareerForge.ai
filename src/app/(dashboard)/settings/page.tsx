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
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
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
  const [theme, setTheme] = useState<ThemeValue>('system');
  const [language, setLanguage] = useState('en');
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
        setLanguage(data.settings.language || 'en');
      } else {
        toast.error(data.error || 'Failed to load settings');
      }
    } catch {
      toast.error('Failed to load settings');
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
        toast.success('Theme updated');
      } else {
        toast.error(data.error || 'Failed to update theme');
      }
    } catch {
      toast.error('Failed to update theme');
    } finally {
      setThemeUpdating(false);
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setLangUpdating(true);
    setLanguage(newLang);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Language updated');
      } else {
        toast.error(data.error || 'Failed to update language');
      }
    } catch {
      toast.error('Failed to update language');
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
      toast.error('The new passwords do not match.');
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
        toast.success('Your password has been changed.');
        setPasswordDialogOpen(false);
        resetPasswordForm();
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
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
        toast.success('Your account has been deleted.');
        window.location.href = '/';
        return;
      }
      toast.error(data.error || 'Failed to delete account');
    } catch {
      toast.error('Failed to delete account');
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
          Settings
        </h1>
        <p className="text-muted-foreground font-body">
          Manage your application preferences.
        </p>
      </FadeInUp>

      {/* ── Theme Card ────────────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 1}>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Sun className="size-5 text-brand" />
              Theme
            </CardTitle>
            <CardDescription className="font-body">
              Choose how the application looks to you.
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
                    <span className="text-sm font-medium">{opt.label}</span>
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
              Language
            </CardTitle>
            <CardDescription className="font-body">
              Select your preferred language for the interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select
                value={language}
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
                    <SelectValue placeholder="Select language" />
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
              Danger Zone
            </CardTitle>
            <CardDescription className="font-body">
              Irreversible and sensitive account actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium font-body flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground shrink-0" />
                  Change Password
                </p>
                <p className="text-sm text-muted-foreground font-body pl-6">
                  Update your account password.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPasswordDialogOpen(true)}
                className="shrink-0 font-body w-full sm:w-auto"
              >
                Change Password
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
                    <DialogTitle className="font-heading">Change Password</DialogTitle>
                    <DialogDescription className="font-body">
                      Enter your current password, then choose a new one.
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
                      <Label htmlFor="current-password" className="font-body">Current password</Label>
                      <PasswordInput id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-body">New password</Label>
                      <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <p className="text-xs text-muted-foreground font-body">
                        At least 8 characters, with a mix of upper and lower case letters, numbers or symbols.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-body">Confirm new password</Label>
                      <PasswordInput id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        className="font-body"
                        onClick={() => setPasswordDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="font-body"
                        disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                      >
                        {passwordSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                        Save new password
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
                  Delete Account
                </p>
                <p className="text-sm text-muted-foreground font-body pl-6">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="shrink-0 font-body w-full sm:w-auto"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      This action cannot be undone. This will permanently delete
                      your account and all your resumes, cover letters, job
                      applications and payment history. Any paid plan ends
                      immediately and is not refunded.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-body">
                      Cancel
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
                      Yes, delete my account
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