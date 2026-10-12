'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Loader2, FileText, Sparkles, LogOut, Settings, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/i18n/provider';
import { cn } from '@/lib/utils';

function ProtectedTopBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const t = useTranslations('dashboard');
  const router = useRouter();

  const initials = user
    ? [user.first_name, user.last_name].filter(Boolean).map((n) => n![0].toUpperCase()).join('') || 'U'
    : 'U';

  const displayName = user?.first_name || user?.email || 'User';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10">
            <FileText className="w-5 h-5 text-brand" strokeWidth={2} />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-violet" fill="currentColor" />
          </div>
          <span className="font-[family-name:var(--font-poppins)] text-lg font-bold text-foreground">
            CareerForge <span className="text-brand">AI</span>
          </span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2.5 rounded-full pl-1.5 pr-3 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium text-foreground max-w-[120px] truncate">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer gap-2">
              <User className="h-4 w-4" />
              {t('userMenu.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              {t('userMenu.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/billing')} className="cursor-pointer gap-2">
              <CreditCard className="h-4 w-4" />
              {t('userMenu.billing')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              {t('userMenu.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground font-[family-name:var(--font-inter)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background">
        <ProtectedTopBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}