'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard, FileText, FolderOpen, Mail, Sparkles,
  ShieldCheck, Briefcase, LayoutTemplate, User, CreditCard,
  Settings, HelpCircle, LogOut,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProBadge, useFeatureLocked } from '@/components/billing/pro-badge';
import { LogoMark } from '@/components/brand/logo-mark';

function DrawerProBadge({ featureKey }: { featureKey: string }) {
  return useFeatureLocked(featureKey) ? <ProBadge className="ml-auto" /> : null;
}

const DRAWER_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/home' },
  { key: 'resumeBuilder', icon: FileText, href: '/resume-builder' },
  { key: 'myResumes', icon: FolderOpen, href: '/my-resumes' },
  { key: 'coverLetters', icon: Mail, href: '/cover-letters' },
  { key: 'resumeReview', icon: Sparkles, href: '/resume-review', proFeature: 'AI_RESUME_REVIEW' },
  { key: 'atsChecker', icon: ShieldCheck, href: '/ats-checker' },
  { key: 'jobTracker', icon: Briefcase, href: '/job-tracker', proFeature: 'JOB_TRACKER' },
  { key: 'templates', icon: LayoutTemplate, href: '/templates' },
  { key: 'profile', icon: User, href: '/profile' },
  { key: 'billing', icon: CreditCard, href: '/billing' },
  { key: 'settings', icon: Settings, href: '/settings' },
  { key: 'helpCenter', icon: HelpCircle, href: '/help' },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileDrawer({ open, onClose, pathname }: MobileDrawerProps) {
  const t = useTranslations('dashboard.sidebar');
  const tm = useTranslations('app.misc');
  const { logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2.5">
            <LogoMark className="w-9 h-9 shrink-0" />
            <span className="font-heading text-lg font-bold text-foreground">
              CareerForge <span className="text-brand">AI</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-3">
          <nav className="flex flex-col gap-1" aria-label={tm('mobileNavigation')}>
            {DRAWER_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-brand/10 text-brand' : 'text-muted-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand')} />
                  <span className="font-body">{t(item.key)}</span>
                  {'proFeature' in item && item.proFeature && <DrawerProBadge featureKey={item.proFeature} />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="px-3 py-3">
          <button
            onClick={async () => { await logout(); window.location.href = '/'; }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full text-muted-foreground hover:bg-accent hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-body">{t('logout')}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}