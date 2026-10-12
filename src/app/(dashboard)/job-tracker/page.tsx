'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { FadeInUp, FadeIn } from '@/lib/motion';
import {
  Briefcase, Plus, Search, X, LayoutGrid, List, Calendar,
  Filter, ChevronDown, ChevronUp, FileText, TrendingUp, Award, Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureGate } from '@/components/billing/feature-gate';
import { useJobTracker, type JobApplication, type AiSuggestion } from '@/hooks/use-job-tracker';
import { STATUSES, WORK_MODES, EMPLOYMENT_TYPES } from '@/components/job-tracker/status-config';
import { KanbanBoard } from '@/components/job-tracker/kanban-board';
import { ListView } from '@/components/job-tracker/list-view';
import { CalendarView } from '@/components/job-tracker/calendar-view';
import { JobFormDialog } from '@/components/job-tracker/job-form-dialog';
import { AiSuggestionsPanel } from '@/components/job-tracker/ai-suggestions-panel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = 'kanban' | 'list' | 'calendar';

// ---------------------------------------------------------------------------
// Stats Cards
// ---------------------------------------------------------------------------

function StatsCards({ stats, collapsed, onToggle }: {
  stats: { total: number; interviewsScheduled: number; offersReceived: number; responseRate: number; acceptanceRate: number } | null;
  collapsed: boolean;
  onToggle: () => void;
}) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-7 w-12" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-brand', bgColor: 'bg-brand/10' },
    { label: 'Interviews Scheduled', value: stats.interviewsScheduled, icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/40' },
    { label: 'Offers Received', value: stats.offersReceived, icon: Award, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: Percent, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/40' },
    { label: 'Acceptance Rate', value: `${stats.acceptanceRate}%`, icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/40' },
  ];

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body mb-2 w-full justify-end"
      >
        {collapsed ? 'Show Stats' : 'Hide Stats'}
        {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {cards.map(card => (
                <Card key={card.label}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}>
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-body leading-tight">{card.label}</p>
                        <p className="text-lg font-bold font-heading leading-tight">{card.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <FadeInUp
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mb-5">
        <Briefcase className="w-9 h-9 text-brand" />
      </div>
      <h3 className="text-lg font-semibold font-heading mb-1.5">
        No Applications Yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 font-body">
        Start tracking your job applications to stay organized and monitor your progress.
      </p>
      <Button onClick={onAdd} className="bg-brand hover:bg-brand/90 text-white font-body gap-2">
        <Plus className="w-4 h-4" />
        Add Your First Application
      </Button>
    </FadeInUp>
  );
}

// ---------------------------------------------------------------------------
// No Results State
// ---------------------------------------------------------------------------

function NoResults() {
  return (
    <FadeIn className="text-center py-12">
      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground font-body">No applications match your search.</p>
    </FadeIn>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

function JobTrackerContent() {
  const {
    filteredApplications, loading, stats, calendarEvents,
    filters, setFilters, fetchCalendar,
    createApplication, updateApplication, deleteApplication,
    archiveApplication, duplicateApplication, changeStatus,
    addReminder, generateAiSuggestions,
  } = useJobTracker();

  const [view, setView] = useState<ViewMode>('kanban');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiAppId, setAiAppId] = useState<string | null>(null);
  const [aiAppTitle, setAiAppTitle] = useState('');
  const [aiCompanyName, setAiCompanyName] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);

  const handleAdd = useCallback(() => {
    setEditingApp(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((app: JobApplication) => {
    setEditingApp(app);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    if (editingApp) {
      return await updateApplication(editingApp.id, data);
    } else {
      return await createApplication(data);
    }
  }, [editingApp, updateApplication, createApplication]);

  const handleDelete = useCallback((id: string) => {
    deleteApplication(id);
  }, [deleteApplication]);

  const handleArchive = useCallback((id: string) => {
    archiveApplication(id);
  }, [archiveApplication]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateApplication(id);
  }, [duplicateApplication]);

  const handleAiSuggest = useCallback((id: string) => {
    const app = filteredApplications.find(a => a.id === id);
    if (!app) return;
    setAiAppId(id);
    setAiAppTitle(app.job_title);
    setAiCompanyName(app.company_name);
    // Parse existing suggestions
    try {
      setAiSuggestions(app.ai_suggestions ? JSON.parse(app.ai_suggestions) : []);
    } catch {
      setAiSuggestions([]);
    }
    setAiPanelOpen(true);
  }, [filteredApplications]);

  const handleGenerateAi = useCallback(async (id: string, types?: string[]) => {
    return await generateAiSuggestions(id, types);
  }, [generateAiSuggestions]);

  const updateFilters = useCallback((updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, [setFilters]);

  const totalCount = filteredApplications.length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <FadeInUp duration={0.4} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              Job Tracker
              {totalCount > 0 && (
                <Badge variant="secondary" className="text-xs font-body">
                  {totalCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm font-body hidden sm:block">
              Track and manage your job applications
            </p>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          className="bg-brand hover:bg-brand/90 text-white font-body gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </Button>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp delay={0.1} duration={0.35}>
        <StatsCards
          stats={stats}
          collapsed={statsCollapsed}
          onToggle={() => setStatsCollapsed(c => !c)}
        />
      </FadeInUp>

      {/* Toolbar */}
      <FadeInUp delay={0.15} duration={0.35}>
        <div className="flex flex-col gap-3">
          {/* Top Row: View Toggle + Search + Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-lg p-0.5 shrink-0">
              {(
                [
                  { key: 'kanban', icon: LayoutGrid, label: 'Kanban' },
                  { key: 'list', icon: List, label: 'List' },
                  { key: 'calendar', icon: Calendar, label: 'Calendar' },
                ] as const
              ).map(v => (
                <Button
                  key={v.key}
                  variant={view === v.key ? 'default' : 'ghost'}
                  size="sm"
                  className={
                    'h-8 px-2.5 text-xs font-body gap-1.5 ' +
                    (view === v.key ? 'bg-brand text-white hover:bg-brand/90' : 'text-muted-foreground')
                  }
                  onClick={() => setView(v.key as ViewMode)}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={e => updateFilters({ search: e.target.value })}
                placeholder="Search companies, titles, locations..."
                className="pl-9 pr-8 font-body text-sm h-9"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Status Filter */}
              <Select value={filters.status} onValueChange={v => updateFilters({ status: v })}>
                <SelectTrigger className="w-[130px] font-body text-xs h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-body text-xs">All Status</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s.key} value={s.key} className="font-body text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Work Mode Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs font-body gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Filters</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium font-heading">Work Mode</label>
                      <Select value={filters.workMode} onValueChange={v => updateFilters({ workMode: v })}>
                        <SelectTrigger className="font-body text-xs h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-body text-xs">All</SelectItem>
                          {WORK_MODES.map(m => (
                            <SelectItem key={m} value={m} className="font-body text-xs">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium font-heading">Employment Type</label>
                      <Select value={filters.employmentType} onValueChange={v => updateFilters({ employmentType: v })}>
                        <SelectTrigger className="font-body text-xs h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-body text-xs">All</SelectItem>
                          {EMPLOYMENT_TYPES.map(t => (
                            <SelectItem key={t} value={t} className="font-body text-xs">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-body h-7"
                      onClick={() => updateFilters({ workMode: 'all', employmentType: 'all', status: 'all', search: '' })}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredApplications.length === 0 && !filters.search && filters.status === 'all' && filters.workMode === 'all' && filters.employmentType === 'all' ? (
        <EmptyState onAdd={handleAdd} />
      ) : filteredApplications.length === 0 ? (
        <NoResults />
      ) : (
        <FadeInUp delay={0.2} duration={0.35}>
          {view === 'kanban' && (
            <KanbanBoard
              applications={filteredApplications}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onAiSuggest={handleAiSuggest}
              onChangeStatus={changeStatus}
            />
          )}
          {view === 'list' && (
            <ListView
              applications={filteredApplications}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onAiSuggest={handleAiSuggest}
            />
          )}
          {view === 'calendar' && (
            <CalendarView
              calendarEvents={calendarEvents}
              fetchCalendar={fetchCalendar}
            />
          )}
        </FadeInUp>
      )}

      {/* Job Form Dialog */}
      {dialogOpen && (
        <JobFormDialog
          key={editingApp?.id ?? 'new'}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingApplication={editingApp}
          onSave={handleSave}
          addReminder={addReminder}
        />
      )}

      {/* AI Suggestions Panel */}
      <AiSuggestionsPanel
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
        applicationId={aiAppId}
        applicationTitle={aiAppTitle}
        companyName={aiCompanyName}
        existingSuggestions={aiSuggestions}
        generateSuggestions={handleGenerateAi}
      />
    </div>
  );
}

export default function JobTrackerPage() {
  return (
    <FeatureGate featureKey="JOB_TRACKER">
      <JobTrackerContent />
    </FeatureGate>
  );
}
