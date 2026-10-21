'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';
import { Sparkles } from 'lucide-react';

type DayPart = 'hello' | 'goodMorning' | 'goodAfternoon' | 'goodEvening';

/** Part of the day on the user's own clock (morning 5–12, afternoon 12–18, evening otherwise). */
function dayPart(): DayPart {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'goodMorning';
  if (hour >= 12 && hour < 18) return 'goodAfternoon';
  return 'goodEvening';
}

// Re-check every minute so the greeting changes while the page stays open
function subscribeToClock(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

export default function WelcomeHero() {
  const t = useTranslations('dashboard.welcome');
  const { user } = useAuth();

  // The server doesn't know the user's time zone: it renders a neutral
  // "Hello" and the browser swaps in the right greeting for its local time
  const greeting = t(useSyncExternalStore(subscribeToClock, dayPart, () => 'hello' as DayPart));

  const firstName = user?.first_name || 'User';

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-6 md:p-8 opacity-0 animate-[slideUpLg_0.5s_ease-out_forwards]"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-brand" />
          <span className="text-sm font-medium text-brand font-body">
            {greeting}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          {t('greeting', { name: firstName })} 👋
        </h1>
        <p className="mt-2 text-muted-foreground font-body text-sm md:text-base max-w-lg">
          {t('message')}
        </p>
      </div>
      {/* Decorative gradient circles */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-violet/5 blur-2xl pointer-events-none" />
    </div>
  );
}