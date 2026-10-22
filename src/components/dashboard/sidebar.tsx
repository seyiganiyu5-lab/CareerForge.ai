'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { useUsage } from '@/lib/usage/context';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Sparkles,
  ShieldCheck,
  Briefcase,
  LayoutTemplate,
  User,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/logo-mark';

interface NavItem {
  key: string;
  icon: React.ElementType;
  href: string;
  section: 'main' | 'resources' | 'account' | 'bottom';
  isPremium?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/home', section: 'main' },
  { key: 'resumeBuilder', icon: FileText, href: '/resume-builder', section: 'main' },
  { key: 'coverLetters', icon: Mail, href: '/cover-letters', section: 'main' },
  { key: 'resumeReview', icon: Sparkles, href: '/resume-review', section: 'main', isPremium: true },
  { key: 'atsChecker', icon: ShieldCheck, href: '/ats-checker', section: 'main' },
  { key: 'jobTracker', icon: Briefcase, href: '/job-tracker', section: 'main', isPremium: true },
  { key: 'templates', icon: LayoutTemplate, href: '/templates', section: 'resources' },
  { key: 'profile', icon: User, href: '/profile', section: 'account' },
  { key: 'billing', icon: CreditCard, href: '/billing', section: 'account' },
  { key: 'settings', icon: Settings, href: '/settings', section: 'account' },
  { key: 'helpCenter', icon: HelpCircle, href: '/help', section: 'account' },
];

// Only shown to the accounts listed in ADMIN_EMAILS
const ADMIN_ITEMS: NavItem[] = [
  { key: 'adminLeads', icon: Inbox, href: '/admin/leads', section: 'account' },
  { key: 'adminOrgs', icon: Building2, href: '/admin/organizations', section: 'account' },
];
// Shown to members of an Enterprise organisation
const ORG_ITEM: NavItem = { key: 'organization', icon: Building2, href: '/organization', section: 'account' };

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
}

// Memoize nav items since they never change
const NavItemComponent = React.memo(function NavItemComponent({
  item,
  collapsed,
  isActive,
  t,
  proLabel,
  onLogout,
  showProBadge,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  t: (key: string) => string;
  proLabel: string;
  onLogout?: () => void;
  showProBadge: boolean;
}) {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    if (item.key === 'logout') {
      onLogout?.();
      window.location.href = '/';
    }
  }, [item.key, onLogout]);

  const content = (
    <Link
      href={item.key === 'logout' ? '#' : item.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive
          ? 'bg-brand/10 text-brand'
          : 'text-muted-foreground',
        collapsed && 'justify-center px-2'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand')} />
      {!collapsed && (
        <span className="whitespace-nowrap overflow-hidden font-body flex items-center gap-2">
          {t(item.key)}
          {item.isPremium && showProBadge && (
            <Badge
              variant="secondary"
              className="bg-brand/15 text-brand hover:bg-brand/20 text-[10px] px-1.5 py-0 h-4 font-semibold font-body"
            >
              {proLabel}
            </Badge>
          )}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="flex items-center gap-2">
              {t(item.key)}
              {item.isPremium && showProBadge && (
                <Badge
                  variant="secondary"
                  className="bg-brand/15 text-brand text-[10px] px-1.5 py-0 h-4 font-semibold font-body"
                >
                  {proLabel}
                </Badge>
              )}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
});

// Memoize sections computation
const SECTIONS = [
  { key: 'main' as const, items: NAV_ITEMS.filter(i => i.section === 'main') },
  { key: 'resources' as const, items: NAV_ITEMS.filter(i => i.section === 'resources') },
  { key: 'account' as const, items: NAV_ITEMS.filter(i => i.section === 'account') },
];

export default function Sidebar({ collapsed, onToggle, pathname }: SidebarProps) {
  const t = useTranslations('dashboard.sidebar');
  const tc = useTranslations('app.common');
  const tm = useTranslations('app.misc');
  const { user, logout } = useAuth();
  const { data: usageData, isLoading: usageLoading } = useUsage();

  // Use shared usage context — no separate API call needed
  const showProBadge = !usageLoading && usageData ? !usageData.isPremium : false;

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <Link href="/home" className="flex items-center gap-2.5 shrink-0">
          <LogoMark className="w-9 h-9 shrink-0" />
          {!collapsed && (
            <span className="font-heading text-lg font-bold text-foreground whitespace-nowrap overflow-hidden">
              CareerForge <span className="text-brand">AI</span>
            </span>
          )}
        </Link>
      </div>

      <Separator className="mx-3" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1" aria-label={tm('mainNavigation')}>
          {SECTIONS.map((section, si) => (
            <React.Fragment key={section.key}>
              {si > 0 && <Separator className="my-2" />}
              {(section.key === 'account'
                ? [...section.items, ...(user?.organization ? [ORG_ITEM] : []), ...(user?.is_admin ? ADMIN_ITEMS : [])]
                : section.items).map(item => (
                <NavItemComponent
                  key={item.key}
                  item={item}
                  collapsed={collapsed}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  t={t}
                  proLabel={tc('pro')}
                  showProBadge={showProBadge}
                />
              ))}
            </React.Fragment>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="mx-3" />

      {/* Bottom: Logout + Collapse Toggle */}
      <div className="px-3 py-3 space-y-1 shrink-0">
        <NavItemComponent
          item={{ key: 'logout', icon: LogOut, href: '#', section: 'bottom' }}
          collapsed={collapsed}
          isActive={false}
          t={t}
          proLabel={tc('pro')}
          showProBadge={showProBadge}
          onLogout={logout}
        />
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center px-2'
          )}
          aria-label={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-body">{t('collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
