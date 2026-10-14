'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResumeData, AutosaveStatus } from '@/types/resume';
import type { TemplateId, TemplateCustomization } from '@/types/template';
import { createDefaultResumeData } from '@/lib/resume/defaults';
import { createDefaultCustomization } from '@/lib/templates/defaults';

interface ResumeAPI {
  id: string;
  title: string;
  data_json: string;
  template: string;
  customization_json: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseResumeReturn {
  resumeData: ResumeData;
  resumeId: string | null;
  resumeTitle: string;
  templateId: TemplateId;
  customization: TemplateCustomization;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  setResumeTitle: (title: string) => void;
  setTemplateId: (id: TemplateId) => void;
  setCustomization: (c: TemplateCustomization) => void;
  loading: boolean;
  error: string | null;
  autosaveStatus: AutosaveStatus;
  saveNow: () => Promise<void>;
  createResume: () => Promise<string | null>;
  renameResume: (id: string, title: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<string | null>;
}

const AUTOSAVE_DELAY = 3000;
const AUTOSAVE_RETRIES = 2;
const AUTOSAVE_RETRY_DELAY = 1500;

export function useResume(): UseResumeReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(createDefaultResumeData());
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitleState] = useState('');
  const [templateId, setTemplateIdState] = useState<TemplateId>('ats-classic');
  const [customization, setCustomizationState] = useState<TemplateCustomization>(createDefaultCustomization('ats-classic'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedJsonRef = useRef<string>('');
  const lastSavedTemplateRef = useRef<string>('');
  const lastSavedCustomizationRef = useRef<string>('');

  // Fetch resume by ID from URL
  const fetchResume = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/resumes/${id}`, { credentials: 'include' });
      if (!res.ok) {
        setError('load_failed');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setResumeId(data.resume.id);
        setResumeTitleState(data.resume.title);
        setTemplateIdState((data.resume.template || 'ats-classic') as TemplateId);

        try {
          const parsed = JSON.parse(data.resume.data_json || '{}') as ResumeData;
          const merged = { ...createDefaultResumeData(), ...parsed };
          setResumeData(merged);
          // Store the MERGED version as last-saved so autosave doesn't
          // detect spurious changes after a page reload.
          lastSavedJsonRef.current = JSON.stringify(merged);
        } catch {
          setResumeData(createDefaultResumeData());
          lastSavedJsonRef.current = JSON.stringify(createDefaultResumeData());
        }

        try {
          const parsedCust = JSON.parse(data.resume.customization_json || '{}') as Partial<TemplateCustomization>;
          const defaults = createDefaultCustomization((data.resume.template || 'ats-classic') as TemplateId);
          const merged = { ...defaults, ...parsedCust };
          setCustomizationState(merged);
          lastSavedCustomizationRef.current = JSON.stringify(merged);
        } catch {
          const defaults = createDefaultCustomization((data.resume.template || 'ats-classic') as TemplateId);
          setCustomizationState(defaults);
          lastSavedCustomizationRef.current = JSON.stringify(defaults);
        }

        lastSavedTemplateRef.current = data.resume.template || 'ats-classic';
      }
    } catch {
      setError('network_error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get resume ID from URL hash — do NOT auto-load most recent resume
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#resume=')) {
      const id = hash.replace('#resume=', '');
      void fetchResume(id);
    } else {
      setLoading(false);
    }
  }, [fetchResume]);

  // Flush any pending save immediately (used by beforeunload and visibilitychange)
  const pendingSaveRef = useRef<{ json: string; template: string; customization: string } | null>(null);

  const flushSave = useCallback(() => {
    if (!resumeId || !pendingSaveRef.current) return;
    const { json, template, customization } = pendingSaveRef.current;
    // Use fetch with keepalive — fires even during page unload, preserves PUT method
    try {
      fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({
          data_json: json,
          template,
          customization_json: customization,
        }),
      });
    } catch {
      // Best-effort during unload
    }
  }, [resumeId]);

  // Autosave when data, template, or customization changes
  useEffect(() => {
    if (!resumeId) return;

    const currentJson = JSON.stringify(resumeData);
    const currentTemplate = templateId;
    const currentCustomization = JSON.stringify(customization);

    const hasChanges =
      currentJson !== lastSavedJsonRef.current ||
      currentTemplate !== lastSavedTemplateRef.current ||
      currentCustomization !== lastSavedCustomizationRef.current;

    if (!hasChanges) return;

    // Store pending save for beforeunload
    pendingSaveRef.current = { json: currentJson, template: currentTemplate, customization: currentCustomization };

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      let success = false;
      for (let attempt = 0; attempt <= AUTOSAVE_RETRIES; attempt++) {
        if (attempt > 0) {
          // Wait before retrying transient failures (502, 503, 504)
          await new Promise((r) => setTimeout(r, AUTOSAVE_RETRY_DELAY));
        }
        try {
          const res = await fetch(`/api/resumes/${resumeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              data_json: currentJson,
              template: currentTemplate,
              customization_json: currentCustomization,
            }),
          });
          if (res.ok) {
            lastSavedJsonRef.current = currentJson;
            lastSavedTemplateRef.current = currentTemplate;
            lastSavedCustomizationRef.current = currentCustomization;
            pendingSaveRef.current = null;
            setAutosaveStatus('saved');
            success = true;
            break;
          }
          // Only retry on gateway / server errors (5xx), not client errors
          if (res.status < 500) {
            console.error('[Autosave] Failed:', res.status);
            setAutosaveStatus('error');
            return;
          }
          // 5xx — will retry
          console.warn(`[Autosave] Server error ${res.status}, retry ${attempt + 1}/${AUTOSAVE_RETRIES}`);
        } catch (err) {
          console.warn(`[Autosave] Network error, retry ${attempt + 1}/${AUTOSAVE_RETRIES}:`, err);
        }
      }
      if (!success) {
        console.error('[Autosave] Failed after retries');
        setAutosaveStatus('error');
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [resumeData, resumeId, templateId, customization]);

  // Save on page unload / tab switch to prevent data loss
  useEffect(() => {
    if (!resumeId) return;

    const handleBeforeUnload = () => { flushSave(); };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') { flushSave(); }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resumeId, flushSave]);

  const saveNow = useCallback(async () => {
    if (!resumeId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setAutosaveStatus('saving');
    const currentJson = JSON.stringify(resumeData);
    const currentCustomization = JSON.stringify(customization);
    let success = false;
    for (let attempt = 0; attempt <= AUTOSAVE_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, AUTOSAVE_RETRY_DELAY));
      }
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            data_json: currentJson,
            template: templateId,
            customization_json: currentCustomization,
          }),
        });
        if (res.ok) {
          lastSavedJsonRef.current = currentJson;
          lastSavedTemplateRef.current = templateId;
          lastSavedCustomizationRef.current = currentCustomization;
          pendingSaveRef.current = null;
          setAutosaveStatus('saved');
          success = true;
          break;
        }
        if (res.status < 500) {
          setAutosaveStatus('error');
          return;
        }
      } catch {
        // network error — will retry
      }
    }
    if (!success) {
      setAutosaveStatus('error');
    }
  }, [resumeId, resumeData, templateId, customization]);

  const setResumeTitle = useCallback(async (title: string) => {
    setResumeTitleState(title);
    if (!resumeId) return;
    try {
      await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });
    } catch {
      // Silent fail for title rename
    }
  }, [resumeId]);

  const setTemplateId = useCallback((id: TemplateId) => {
    setTemplateIdState(id);
    const newCustomization = createDefaultCustomization(id);
    setCustomizationState(newCustomization);
  }, []);

  const setCustomization = useCallback((c: TemplateCustomization) => {
    setCustomizationState(c);
  }, []);

  const createResume = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'Untitled Resume' }),
      });
      const data = await res.json();
      if (data.success) {
        setResumeId(data.resume.id);
        setResumeTitleState(data.resume.title);
        setTemplateIdState((data.resume.template || 'ats-classic') as TemplateId);
        setResumeData(createDefaultResumeData());
        setCustomizationState(createDefaultCustomization('ats-classic'));
        lastSavedJsonRef.current = '{}';
        lastSavedTemplateRef.current = 'ats-classic';
        lastSavedCustomizationRef.current = '{}';
        window.location.hash = `#resume=${data.resume.id}`;
        return data.resume.id;
      }
      if (data.error === 'limit_reached') {
        setError('limit_reached');
      }
      return null;
    } catch {
      setError('create_failed');
      return null;
    }
  }, []);

  const renameResume = useCallback(async (id: string, title: string) => {
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });
    } catch {
      // Silent
    }
  }, []);

  const deleteResume = useCallback(async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (id === resumeId) {
        setResumeId(null);
        setResumeData(createDefaultResumeData());
        setResumeTitleState('');
        setTemplateIdState('ats-classic');
        setCustomizationState(createDefaultCustomization('ats-classic'));
        lastSavedJsonRef.current = '';
        lastSavedTemplateRef.current = '';
        lastSavedCustomizationRef.current = '';
        window.location.hash = '';
      }
    } catch {
      // Silent
    }
  }, [resumeId]);

  const duplicateResume = useCallback(async (id: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) return data.resume.id;
      if (data.error === 'limit_reached') setError('limit_reached');
      return null;
    } catch {
      return null;
    }
  }, []);

  return {
    resumeData, resumeId, resumeTitle, templateId, customization,
    setResumeData, setResumeTitle, setTemplateId, setCustomization,
    loading, error, autosaveStatus, saveNow,
    createResume, renameResume, deleteResume, duplicateResume,
  };
}