'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

/** The member's organisation (logo and name) at the top of the menu */
export default function OrgBadge({ collapsed = false, onClick }: { collapsed?: boolean; onClick?: () => void }) {
  const { user } = useAuth();
  const org = user?.organization;
  if (!org) return null;

  return (
    <Link
      href="/organization"
      onClick={onClick}
      title={org.name}
      className={cn(
        'flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 hover:bg-accent transition-colors',
        collapsed && 'justify-center px-1.5',
      )}
    >
      {org.logo_url ? (
        <img src={org.logo_url} alt="" className="w-7 h-7 shrink-0 rounded object-contain bg-white" />
      ) : (
        <span className="w-7 h-7 shrink-0 rounded bg-brand/10 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-brand" />
        </span>
      )}
      {!collapsed && <span className="min-w-0 truncate text-sm font-medium font-body text-foreground">{org.name}</span>}
    </Link>
  );
}
