'use client';

import { useState, useCallback } from 'react';
import { Loader2, Plus, X, Bell } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STATUSES, EMPLOYMENT_TYPES, WORK_MODES } from './status-config';
import { useJobLabels } from './use-job-labels';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/provider';
import type { JobApplication, Reminder } from '@/hooks/use-job-tracker';

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingApplication: JobApplication | null;
  onSave: (data: Record<string, unknown>) => Promise<JobApplication | null>;
  addReminder: (appId: string, reminder: Omit<Reminder, 'id'>) => Promise<Reminder | null>;
}

interface ReminderForm {
  title: string;
  date: string;
  type: string;
}

const EMPTY_FORM = {
  company_name: '',
  job_title: '',
  job_description: '',
  job_url: '',
  salary: '',
  location: '',
  employment_type: '',
  work_mode: '',
  resume_used: '',
  cover_letter_used: '',
  notes: '',
  status: 'wishlist',
  applied_at: '',
  interview_date: '',
  follow_up_date: '',
  deadline_date: '',
  offer_expiry: '',
};

const REMINDER_TYPES = [
  { value: 'follow_up', labelKey: 'reminderTypeFollowUp' },
  { value: 'interview_prep', labelKey: 'reminderTypeInterviewPrep' },
  { value: 'deadline', labelKey: 'reminderTypeDeadline' },
  { value: 'other', labelKey: 'reminderTypeOther' },
];

function buildFormFromApp(app: JobApplication | null) {
  if (!app) return EMPTY_FORM;
  return {
    company_name: app.company_name || '',
    job_title: app.job_title || '',
    job_description: app.job_description || '',
    job_url: app.job_url || '',
    salary: app.salary || '',
    location: app.location || '',
    employment_type: app.employment_type || '',
    work_mode: app.work_mode || '',
    resume_used: app.resume_used || '',
    cover_letter_used: app.cover_letter_used || '',
    notes: app.notes || '',
    status: app.status || 'wishlist',
    applied_at: app.applied_at ? new Date(app.applied_at).toISOString().split('T')[0] : '',
    interview_date: app.interview_date ? new Date(app.interview_date).toISOString().split('T')[0] : '',
    follow_up_date: app.follow_up_date ? new Date(app.follow_up_date).toISOString().split('T')[0] : '',
    deadline_date: app.deadline_date ? new Date(app.deadline_date).toISOString().split('T')[0] : '',
    offer_expiry: app.offer_expiry ? new Date(app.offer_expiry).toISOString().split('T')[0] : '',
  };
}

export function JobFormDialog({ open, onOpenChange, editingApplication, onSave, addReminder }: JobFormDialogProps) {
  const t = useTranslations('dashboard.jobTracker');
  const tu = useTranslations('app.jobTrackerUi');
  const tc = useTranslations('app.common');
  const labels = useJobLabels();
  const [form, setForm] = useState(() => buildFormFromApp(editingApplication));
  const [saving, setSaving] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState<ReminderForm>({ title: '', date: '', type: 'follow_up' });
  const [savingReminder, setSavingReminder] = useState(false);

  const handleSave = useCallback(async () => {
    if (!form.company_name.trim() || !form.job_title.trim()) {
      toast.error(tu('companyPositionRequired'));
      return 'required';
    }
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        company_name: form.company_name.trim(),
        job_title: form.job_title.trim(),
        status: form.status,
      };

      // Only include optional fields if they have values
      if (form.job_description.trim()) data.job_description = form.job_description.trim();
      if (form.job_url.trim()) data.job_url = form.job_url.trim();
      if (form.salary.trim()) data.salary = form.salary.trim();
      if (form.location.trim()) data.location = form.location.trim();
      if (form.employment_type) data.employment_type = form.employment_type;
      if (form.work_mode) data.work_mode = form.work_mode;
      if (form.resume_used.trim()) data.resume_used = form.resume_used.trim();
      if (form.cover_letter_used.trim()) data.cover_letter_used = form.cover_letter_used.trim();
      if (form.notes.trim()) data.notes = form.notes.trim();
      if (form.applied_at) data.applied_at = form.applied_at;
      if (form.interview_date) data.interview_date = form.interview_date;
      if (form.follow_up_date) data.follow_up_date = form.follow_up_date;
      if (form.deadline_date) data.deadline_date = form.deadline_date;
      if (form.offer_expiry) data.offer_expiry = form.offer_expiry;

      const result = await onSave(data);
      setSaving(false);
      return result ? null : 'failed'; // the hook already showed the error
    } catch {
      setSaving(false);
      return 'failed';
    }
  }, [form, onSave, tu]);

  const handleAddReminder = useCallback(async () => {
    if (!editingApplication || !reminderForm.title.trim() || !reminderForm.date) return;
    setSavingReminder(true);
    await addReminder(editingApplication.id, {
      title: reminderForm.title.trim(),
      date: reminderForm.date,
      type: reminderForm.type,
      completed: false,
    });
    setSavingReminder(false);
    setShowReminderForm(false);
    setReminderForm({ title: '', date: '', type: 'follow_up' });
  }, [editingApplication, reminderForm, addReminder]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editingApplication ? t('editApplication') : t('addApplication')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] pl-0.5">
          <div className="space-y-4 pb-4">
            {/* Main Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-body text-xs">{t('companyName')} *</Label>
                <Input
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  placeholder={tu('companyPlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-body text-xs">{t('jobTitle')} *</Label>
                <Input
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  placeholder={tu('jobTitlePlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('status')}</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger className="font-body text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.key} value={s.key} className="font-body text-sm">
                        {labels.status(s.key, s.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('salary')}</Label>
                <Input
                  value={form.salary}
                  onChange={e => set('salary', e.target.value)}
                  placeholder={tu('salaryPlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('location')}</Label>
                <Input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder={tu('locationPlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('jobUrl')}</Label>
                <Input
                  value={form.job_url}
                  onChange={e => set('job_url', e.target.value)}
                  placeholder="https://..."
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('employmentType')}</Label>
                <Select value={form.employment_type} onValueChange={v => set('employment_type', v)}>
                  <SelectTrigger className="font-body text-sm h-9">
                    <SelectValue placeholder={tu('selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map(et => (
                      <SelectItem key={et} value={et} className="font-body text-sm">{labels.employmentType(et)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('workMode')}</Label>
                <Select value={form.work_mode} onValueChange={v => set('work_mode', v)}>
                  <SelectTrigger className="font-body text-sm h-9">
                    <SelectValue placeholder={tu('selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map(m => (
                      <SelectItem key={m} value={m} className="font-body text-sm">{labels.workMode(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs">{t('jobDescription')}</Label>
              <Textarea
                value={form.job_description}
                onChange={e => set('job_description', e.target.value)}
                placeholder={tu('jobDescriptionPlaceholder')}
                className="font-body text-sm min-h-[80px]"
              />
            </div>

            {/* Documents Used */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('resumeUsed')}</Label>
                <Input
                  value={form.resume_used}
                  onChange={e => set('resume_used', e.target.value)}
                  placeholder={tu('resumeUsedPlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">{t('coverLetterUsed')}</Label>
                <Input
                  value={form.cover_letter_used}
                  onChange={e => set('cover_letter_used', e.target.value)}
                  placeholder={tu('coverLetterUsedPlaceholder')}
                  className="font-body text-sm h-9"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs">{t('notes')}</Label>
              <Textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder={tu('notesPlaceholder')}
                className="font-body text-sm min-h-[60px]"
              />
            </div>

            {/* Reminder (only for editing) */}
            {editingApplication && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium font-heading">{t('reminders')}</span>
                </div>
                {!showReminderForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-body gap-1 h-8"
                    onClick={() => setShowReminderForm(true)}
                  >
                    <Plus className="w-3 h-3" /> {t('addReminder')}
                  </Button>
                ) : (
                  <div className="p-3 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium font-heading">{t('newReminder')}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowReminderForm(false)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={reminderForm.title}
                      onChange={e => setReminderForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={t('reminderTitle')}
                      className="font-body text-sm h-8"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={reminderForm.date}
                        onChange={e => setReminderForm(f => ({ ...f, date: e.target.value }))}
                        className="font-body text-sm h-8"
                      />
                      <Select value={reminderForm.type} onValueChange={v => setReminderForm(f => ({ ...f, type: v }))}>
                        <SelectTrigger className="font-body text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_TYPES.map(rt => (
                            <SelectItem key={rt.value} value={rt.value} className="font-body text-sm">{t(rt.labelKey)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs font-body h-8 bg-brand hover:bg-brand/90 text-white"
                      onClick={handleAddReminder}
                      disabled={savingReminder || !reminderForm.title.trim() || !reminderForm.date}
                    >
                      {savingReminder ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      {tc('add')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Important Dates */}
            <div>
              <span className="text-xs font-medium font-heading mb-3 block">{t('importantDates')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-body text-xs">{t('appliedAt')}</Label>
                  <Input
                    type="date"
                    value={form.applied_at}
                    onChange={e => set('applied_at', e.target.value)}
                    className="font-body text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-xs">{t('interviewDate')}</Label>
                  <Input
                    type="date"
                    value={form.interview_date}
                    onChange={e => set('interview_date', e.target.value)}
                    className="font-body text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-xs">{t('followUpDate')}</Label>
                  <Input
                    type="date"
                    value={form.follow_up_date}
                    onChange={e => set('follow_up_date', e.target.value)}
                    className="font-body text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-xs">{t('deadlineDate')}</Label>
                  <Input
                    type="date"
                    value={form.deadline_date}
                    onChange={e => set('deadline_date', e.target.value)}
                    className="font-body text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-body text-xs">{t('offerExpiry')}</Label>
                  <Input
                    type="date"
                    value={form.offer_expiry}
                    onChange={e => set('offer_expiry', e.target.value)}
                    className="font-body text-sm h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body text-sm">
            {tc('cancel')}
          </Button>
          <Button
            onClick={async () => {
              const err = await handleSave();
              if (!err) onOpenChange(false);
            }}
            disabled={saving}
            className="bg-brand hover:bg-brand/90 text-white font-body text-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            {editingApplication ? t('save') : t('addApplication')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
