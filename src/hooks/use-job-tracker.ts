'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface JobApplication {
  id: string;
  user_id?: string;
  company_name: string;
  job_title: string;
  job_description?: string | null;
  job_url?: string | null;
  salary?: string | null;
  location?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  resume_used?: string | null;
  cover_letter_used?: string | null;
  notes?: string | null;
  status: string;
  is_archived: boolean;
  applied_at?: string | null;
  interview_date?: string | null;
  follow_up_date?: string | null;
  deadline_date?: string | null;
  offer_expiry?: string | null;
  calendar_events?: string | null;
  reminders?: string | null;
  ai_suggestions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
  completed: boolean;
}

export interface AiSuggestion {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interviewsScheduled: number;
  offersReceived: number;
  accepted: number;
  rejected: number;
  responseRate: number;
  acceptanceRate: number;
  byStatus: Record<string, number>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  completed: boolean;
  applicationId?: string;
  applicationTitle?: string;
  companyName?: string;
}

interface Filters {
  search: string;
  status: string;
  workMode: string;
  employmentType: string;
}

export function useJobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    workMode: 'all',
    employmentType: 'all',
  });

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status !== 'all') params.set('status', filters.status);
      const res = await fetch(`/api/job-tracker?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        if (data.error !== 'Unauthorized') toast.error(data.error || 'Failed to fetch');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/job-tracker/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {
      // silent
    }
  }, []);

  // Fetch calendar events
  const fetchCalendar = useCallback(async (from?: string, to?: string) => {
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/job-tracker/calendar?${params.toString()}`);
      const data = await res.json();
      if (data.success) setCalendarEvents(data.events);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications, fetchStats]);

  // Create
  const createApplication = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/job-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Application added');
        fetchApplications();
        fetchStats();
        return result.application;
      } else {
        toast.error(result.error || 'Failed to create');
        return null;
      }
    } catch {
      toast.error('Network error');
      return null;
    }
  }, [fetchApplications, fetchStats]);

  // Update
  const updateApplication = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Application updated');
        fetchApplications();
        fetchStats();
        return result.application;
      } else {
        toast.error(result.error || 'Failed to update');
        return null;
      }
    } catch {
      toast.error('Network error');
      return null;
    }
  }, [fetchApplications, fetchStats]);

  // Delete
  const deleteApplication = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Application deleted');
        fetchApplications();
        fetchStats();
        return true;
      } else {
        toast.error(result.error || 'Failed to delete');
        return false;
      }
    } catch {
      toast.error('Network error');
      return false;
    }
  }, [fetchApplications, fetchStats]);

  // Archive
  const archiveApplication = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/archive`, { method: 'PATCH' });
      const result = await res.json();
      if (result.success) {
        toast.success(result.application.is_archived ? 'Application archived' : 'Application unarchived');
        fetchApplications();
        fetchStats();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchApplications, fetchStats]);

  // Duplicate
  const duplicateApplication = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/duplicate`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        toast.success('Application duplicated');
        fetchApplications();
        fetchStats();
        return result.application;
      } else {
        toast.error(result.error || 'Failed to duplicate');
        return null;
      }
    } catch {
      toast.error('Network error');
      return null;
    }
  }, [fetchApplications, fetchStats]);

  // Change status (for Kanban)
  const changeStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.success) {
        // Optimistic update
        setApplications(prev =>
          prev.map(app => (app.id === id ? { ...app, status, updated_at: new Date().toISOString() } : app))
        );
        fetchStats();
        return true;
      } else {
        toast.error(result.error || 'Failed to update status');
        fetchApplications();
        return false;
      }
    } catch {
      toast.error('Network error');
      fetchApplications();
      return false;
    }
  }, [fetchApplications, fetchStats]);

  // Reminders
  const fetchReminders = useCallback(async (id: string): Promise<Reminder[]> => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/reminders`);
      const data = await res.json();
      return data.success ? data.reminders : [];
    } catch {
      return [];
    }
  }, []);

  const addReminder = useCallback(async (id: string, reminder: Omit<Reminder, 'id'>) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      const data = await res.json();
      if (data.success) return data.reminder;
      return null;
    } catch {
      return null;
    }
  }, []);

  const updateReminder = useCallback(async (id: string, reminder: Partial<Reminder>) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/reminders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      const data = await res.json();
      if (data.success) return data.reminder;
      return null;
    } catch {
      return null;
    }
  }, []);

  const deleteReminder = useCallback(async (id: string, reminderId: string) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/reminders`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reminderId }),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }, []);

  // AI Suggestions
  const generateAiSuggestions = useCallback(async (id: string, types?: string[]) => {
    try {
      const res = await fetch(`/api/job-tracker/${id}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types }),
      });
      const data = await res.json();
      if (data.success) return data.suggestions;
      if (data.error === 'limit_reached') {
        toast.error('AI usage limit reached. Upgrade your plan for more.');
      } else {
        toast.error(data.error || 'Failed to generate suggestions');
      }
      return null;
    } catch {
      toast.error('Network error');
      return null;
    }
  }, []);

  // Client-side filtering (for work mode, employment type)
  const filteredApplications = applications.filter(app => {
    if (filters.workMode !== 'all' && app.work_mode !== filters.workMode) return false;
    if (filters.employmentType !== 'all' && app.employment_type !== filters.employmentType) return false;
    return true;
  });

  return {
    applications,
    filteredApplications,
    loading,
    stats,
    calendarEvents,
    filters,
    setFilters,
    fetchApplications,
    fetchStats,
    fetchCalendar,
    createApplication,
    updateApplication,
    deleteApplication,
    archiveApplication,
    duplicateApplication,
    changeStatus,
    fetchReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    generateAiSuggestions,
  };
}
