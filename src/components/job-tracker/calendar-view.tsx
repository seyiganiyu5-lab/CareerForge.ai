'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Video, Clock, AlertTriangle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/hooks/use-job-tracker';

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  fetchCalendar: (from?: string, to?: string) => void;
}

const EVENT_STYLES: Record<string, { dot: string; bg: string; text: string; label: string; icon: typeof Video }> = {
  interview: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', label: 'Interview', icon: Video },
  follow_up: { dot: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/50', text: 'text-yellow-700 dark:text-yellow-300', label: 'Follow-up', icon: Clock },
  deadline: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-300', label: 'Deadline', icon: AlertTriangle },
  offer_expiry: { dot: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-300', label: 'Offer Expiry', icon: Gift },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ calendarEvents, fetchCalendar }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch events for visible month
  useEffect(() => {
    const from = new Date(year, month, 1).toISOString().split('T')[0];
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
    fetchCalendar(from, to);
  }, [year, month, fetchCalendar]);

  const prevMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Map events to date strings
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of calendarEvents) {
      const dateStr = new Date(event.date).toISOString().split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    }
    return map;
  }, [calendarEvents]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Selected day events
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return calendarEvents
      .filter(e => {
        const d = new Date(e.date);
        return d >= now && d <= thirtyDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }, [calendarEvents]);

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-semibold font-heading">{monthLabel}</h3>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground font-heading py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-16" />;
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={
                    'h-16 p-1 rounded-lg text-left transition-colors relative font-body ' +
                    (isSelected
                      ? 'bg-primary/10 ring-1 ring-primary/40'
                      : 'hover:bg-muted/60')
                  }
                >
                  <span className={
                    'text-xs font-medium ' +
                    (isToday
                      ? 'bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center'
                      : 'text-foreground')
                  }>
                    {day}
                  </span>
                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap">
                      {dayEvents.slice(0, 3).map(ev => {
                        const style = EVENT_STYLES[ev.type] || EVENT_STYLES.deadline;
                        return (
                          <span key={ev.id} className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          <AnimatePresence>
            {selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border"
              >
                <p className="text-xs font-medium font-heading mb-2">
                  Events on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="space-y-1.5">
                  {selectedEvents.map(ev => {
                    const style = EVENT_STYLES[ev.type] || EVENT_STYLES.deadline;
                    const Icon = style.icon;
                    return (
                      <div key={ev.id} className={cn('flex items-center gap-2 p-2 rounded-lg text-xs', style.bg)}>
                        <Icon className={cn('w-3.5 h-3.5 shrink-0', style.text)} />
                        <div className="min-w-0">
                          <p className={cn('font-medium truncate', style.text)}>{ev.title}</p>
                          {ev.companyName && (
                            <p className="text-muted-foreground truncate">{ev.companyName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Upcoming Events Sidebar */}
      <Card className="hidden lg:block">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold font-heading mb-3">Upcoming Events</h3>
          <ScrollArea className="max-h-[400px]">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground font-body py-8 text-center">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(ev => {
                  const style = EVENT_STYLES[ev.type] || EVENT_STYLES.deadline;
                  const Icon = style.icon;
                  return (
                    <div key={ev.id} className={cn('p-2.5 rounded-lg text-xs', style.bg)}>
                      <div className="flex items-start gap-2">
                        <Icon className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', style.text)} />
                        <div className="min-w-0">
                          <p className={cn('font-medium font-body', style.text)}>{ev.title}</p>
                          {ev.companyName && (
                            <p className="text-muted-foreground font-body">{ev.companyName}</p>
                          )}
                          <p className="text-muted-foreground font-body mt-0.5">
                            {new Date(ev.date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
