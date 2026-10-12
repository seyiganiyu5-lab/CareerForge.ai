'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/i18n/provider';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function NotificationDropdown() {
  const t = useTranslations('dashboard.notifications');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={t('title')}>
          <Bell className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold font-heading">
            {t('title')}
          </h3>
        </div>

        {/* Empty state */}
        <div className="px-4 py-8 text-center">
          <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-body">
            {t('noNotifications')}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}