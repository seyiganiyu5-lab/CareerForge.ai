'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CoverLetterData, CoverLetterTemplateId, CoverLetterCustomization, AutosaveStatus } from '@/types/cover-letter';
import { createDefaultCoverLetterData } from '@/types/cover-letter';
import { createDefaultCustomization } from '@/lib/cover-letter/template-registry';
import { useTranslations } from '@/i18n/provider';

interface UseCoverLetterReturn {
  data: CoverLetterData;
  letterId: string | null;
  title: string;
  templateId: CoverLetterTemplateId;
  customization: CoverLetterCustomization;
  setData: React.Dispatch<React.SetStateAction<CoverLetterData>>;
  setTitle: (title: string) => void;
  setTemplateId: (id: CoverLetterTemplateId) => void;
  setCustomization: (c: CoverLetterCustomization) => void;
  loading: boolean;
  error: string | null;
  autosaveStatus: AutosaveStatus;
  saveNow: () => Promise<void>;
  createLetter: (opts?: { title?: string; template?: CoverLetterTemplateId }) => Promise<string | null>;
  renameLetter: (id: string, title: string) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  duplicateLetter: (id: string) => Promise<string | null>;
  generateWithAI: (params: {
    jobTitle: string;
    companyName: string;
    hiringManager?: string;
    jobDescription: string;
    resumeId?: string;
    tone?: string;
    language?: 'en' | 'fr';
  }) => Promise<{ success: boolean; content?: Record<string, string>; error?: string }>;
  aiEdit: (params: {
    action: string;
    section: string;
    text: string;
    instruction?: string;
    tone?: string;
    language?: string;
  }) => Promise<{ success: boolean; result?: string; error?: string }>;
}

const AUTOSAVE_DELAY = 3000;
const AUTOSAVE_RETRIES = 2;
const AUTOSAVE_RETRY_DELAY = 1500;

export function useCoverLetter(): UseCoverLetterReturn {
  const t = useTranslations('app.coverLetterEditor');
  const tc = useTranslations('app.common');
  const [data, setData] = useState<CoverLetterData>(createDefaultCoverLetterData());
  const [letterId, setLetterId] = useState<string | null>(null);
  const [title, setTitleState] = useState('');
  const [templateId, setTemplateIdState] = useState<CoverLetterTemplateId>('professional');
  const [customization, setCustomizationState] = useState<CoverLetterCustomization>(createDefaultCustomization('professional'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const lastSavedTemplateRef = useRef<string>('');
  const lastSavedCustomizationRef = useRef<string>('');

  // Fetch cover letter by ID from URL hash
  const fetchLetter = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cover-letters/${id}`, { credentials: 'include' });
      if (!res.ok) {
        setError('Failed to load cover letter');
        return;
      }
      const json = await res.json();
      if (json.success) {
        const letter = json.coverLetter;
        setLetterId(letter.id);
        setTitleState(letter.title);
        setTemplateIdState((letter.template || 'professional') as CoverLetterTemplateId);

        try {
          const parsed = JSON.parse(letter.data_json || '{}') as CoverLetterData;
          const merged = { ...createDefaultCoverLetterData(), ...parsed };
          setData(merged);
          lastSavedDataRef.current = JSON.stringify(merged);
        } catch {
          setData(createDefaultCoverLetterData());
          lastSavedDataRef.current = JSON.stringify(createDefaultCoverLetterData());
        }

        try {
          const parsedCust = JSON.parse(letter.customization_json || '{}') as Partial<CoverLetterCustomization>;
          const tid = (letter.template || 'professional') as CoverLetterTemplateId;
          const defaults = createDefaultCustomization(tid);
          const merged = { ...defaults, ...parsedCust };
          setCustomizationState(merged);
          lastSavedCustomizationRef.current = JSON.stringify(merged);
        } catch {
          const defaults = createDefaultCustomization('professional');
          setCustomizationState(defaults);
          lastSavedCustomizationRef.current = JSON.stringify(defaults);
        }

        lastSavedTemplateRef.current = letter.template || 'professional';
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#letter=')) {
      const id = hash.replace('#letter=', '');
      void fetchLetter(id);
    } else {
      setLoading(false);
    }
  }, [fetchLetter]);

  // Autosave
  const pendingSaveRef = useRef<{ json: string; template: string; customization: string } | null>(null);

  const flushSave = useCallback(() => {
    if (!letterId || !pendingSaveRef.current) return;
    const { json, template, customization: cust } = pendingSaveRef.current;
    try {
      fetch(`/api/cover-letters/${letterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({
          data_json: json,
          template,
          customization_json: cust,
        }),
      });
    } catch {
      // Best-effort during unload
    }
  }, [letterId]);

  useEffect(() => {
    if (!letterId) return;

    const currentJson = JSON.stringify(data);
    const currentTemplate = templateId;
    const currentCustomization = JSON.stringify(customization);

    const hasChanges =
      currentJson !== lastSavedDataRef.current ||
      currentTemplate !== lastSavedTemplateRef.current ||
      currentCustomization !== lastSavedCustomizationRef.current;

    if (!hasChanges) return;

    pendingSaveRef.current = { json: currentJson, template: currentTemplate, customization: currentCustomization };

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      let success = false;
      for (let attempt = 0; attempt <= AUTOSAVE_RETRIES; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, AUTOSAVE_RETRY_DELAY));
        try {
          const res = await fetch(`/api/cover-letters/${letterId}`, {
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
            lastSavedDataRef.current = currentJson;
            lastSavedTemplateRef.current = currentTemplate;
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
          // Will retry
        }
      }
      if (!success) setAutosaveStatus('error');
    }, AUTOSAVE_DELAY);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data, letterId, templateId, customization]);

  // Save on unload
  useEffect(() => {
    if (!letterId) return;
    const handleBeforeUnload = () => flushSave();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [letterId, flushSave]);

  const saveNow = useCallback(async () => {
    if (!letterId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setAutosaveStatus('saving');
    const currentJson = JSON.stringify(data);
    const currentCustomization = JSON.stringify(customization);
    let success = false;
    for (let attempt = 0; attempt <= AUTOSAVE_RETRIES; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, AUTOSAVE_RETRY_DELAY));
      try {
        const res = await fetch(`/api/cover-letters/${letterId}`, {
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
          lastSavedDataRef.current = currentJson;
          lastSavedTemplateRef.current = templateId;
          lastSavedCustomizationRef.current = currentCustomization;
          pendingSaveRef.current = null;
          setAutosaveStatus('saved');
          success = true;
          break;
        }
        if (res.status < 500) { setAutosaveStatus('error'); return; }
      } catch { /* retry */ }
    }
    if (!success) setAutosaveStatus('error');
  }, [letterId, data, templateId, customization]);

  const setTitle = useCallback(async (newTitle: string) => {
    setTitleState(newTitle);
    if (!letterId) return;
    try {
      await fetch(`/api/cover-letters/${letterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      });
    } catch { /* silent */ }
  }, [letterId]);

  const setTemplateId = useCallback((id: CoverLetterTemplateId) => {
    setTemplateIdState(id);
    setCustomizationState(createDefaultCustomization(id));
  }, []);

  const setCustomization = useCallback((c: CoverLetterCustomization) => {
    setCustomizationState(c);
  }, []);

  const createLetter = useCallback(async (opts?: { title?: string; template?: CoverLetterTemplateId }): Promise<string | null> => {
    try {
      const res = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: opts?.title || 'Untitled Cover Letter',
          template: opts?.template || 'professional',
        }),
      });
      const json = await res.json();
      if (json.success) {
        const letter = json.coverLetter;
        setLetterId(letter.id);
        setTitleState(letter.title);
        setTemplateIdState((letter.template || 'professional') as CoverLetterTemplateId);
        setData(createDefaultCoverLetterData());
        setCustomizationState(createDefaultCustomization('professional'));
        lastSavedDataRef.current = '{}';
        lastSavedTemplateRef.current = 'professional';
        lastSavedCustomizationRef.current = '{}';
        window.location.hash = `#letter=${letter.id}`;
        return letter.id;
      }
      if (json.error === 'limit_reached') setError('limit_reached');
      return null;
    } catch {
      setError('Failed to create cover letter');
      return null;
    }
  }, []);

  const renameLetter = useCallback(async (id: string, newTitle: string) => {
    try {
      await fetch(`/api/cover-letters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      });
    } catch { /* silent */ }
  }, []);

  const deleteLetter = useCallback(async (id: string) => {
    try {
      await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (id === letterId) {
        setLetterId(null);
        setData(createDefaultCoverLetterData());
        setTitleState('');
        setTemplateIdState('professional');
        setCustomizationState(createDefaultCustomization('professional'));
        lastSavedDataRef.current = '';
        window.location.hash = '';
      }
    } catch { /* silent */ }
  }, [letterId]);

  const duplicateLetter = useCallback(async (id: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/cover-letters/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) return json.coverLetter.id;
      if (json.error === 'limit_reached') setError('limit_reached');
      return null;
    } catch { return null; }
  }, []);

  const generateWithAI = useCallback(async (params: {
    jobTitle: string;
    companyName: string;
    hiringManager?: string;
    jobDescription: string;
    resumeId?: string;
    tone?: string;
    language?: 'en' | 'fr';
  }) => {
    try {
      const res = await fetch('/api/cover-letters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (json.success && json.content) {
        setData((prev) => ({
          ...prev,
          jobTitle: params.jobTitle,
          companyName: params.companyName,
          hiringManager: params.hiringManager || '',
          jobDescription: params.jobDescription,
          salutation: json.content.salutation || prev.salutation,
          opening: json.content.opening || prev.opening,
          body: json.content.body || prev.body,
          closing: json.content.closing || prev.closing,
          signOff: json.content.signOff || prev.signOff,
          language: params.language || prev.language,
          tone: (params.tone as CoverLetterData['tone']) || prev.tone,
        }));
        return { success: true, content: json.content };
      }
      return { success: false, error: json.error || t('generationFailed') };
    } catch {
      return { success: false, error: tc('networkError') };
    }
  }, [t, tc]);

  const aiEdit = useCallback(async (params: {
    action: string;
    section: string;
    text: string;
    instruction?: string;
    tone?: string;
    language?: string;
  }) => {
    if (!letterId) return { success: false, error: t('noLetterSelected') };
    try {
      const res = await fetch(`/api/cover-letters/${letterId}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (json.success) {
        const section = params.section as keyof CoverLetterData;
        if (section in data && typeof data[section] === 'string') {
          setData((prev) => ({ ...prev, [section]: json.result }));
        }
        return { success: true, result: json.result };
      }
      return { success: false, error: json.error || t('aiEditFailed') };
    } catch {
      return { success: false, error: tc('networkError') };
    }
  }, [letterId, data, t, tc]);

  return {
    data, letterId, title, templateId, customization,
    setData, setTitle, setTemplateId, setCustomization,
    loading, error, autosaveStatus, saveNow,
    createLetter, renameLetter, deleteLetter, duplicateLetter,
    generateWithAI, aiEdit,
  };
}
