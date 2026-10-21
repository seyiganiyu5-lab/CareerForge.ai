'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/i18n/provider';
import { useAuth, useSignedInDisplay } from '@/lib/auth/context';
import { LogOut, User, Settings, CreditCard, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/** Account menu (initials, name, email, links, log out). `showDashboard` adds a Dashboard link, for pages outside the app. */
export default function UserMenu({ showDashboard = false }: { showDashboard?: boolean } = {}) {
  const t = useTranslations('dashboard.userMenu');
  const tm = useTranslations('app.misc');
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useSignedInDisplay();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const initials = user
    ? `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}` || (user.email?.[0] || 'U').toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label={tm('userMenu')}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold font-body">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium font-body text-foreground max-w-[120px] truncate">
            {user?.first_name || tm('userFallback')}
          </span>
          <ChevronDown className="hidden md:block w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium font-body">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground font-body truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showDashboard && (
          <DropdownMenuItem onClick={() => router.push('/home')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t('dashboard')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          {t('profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          {t('settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          {t('billing')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}