import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { generateText, parseJsonReply } from '@/lib/ai/client';
import { replyLanguageInstruction, type AiLocale } from '@/lib/ai/locale';
import {
  EMAIL_SYSTEM_PROMPT,
  KIND_TO_STATUS,
  findMatch,
  nextStatus,
  normalizeAnalysis,
} from '@/lib/job-tracker/email-update';
import { db } from '@/lib/db';
import { notifyJobStatus } from '@/lib/notifications';
import type { JobApplication } from '@prisma/client';

export interface ProcessEmailResult {
  status: number;
  body: Record<string, unknown>;
}

const reply = (body: Record<string, unknown>, status = 200): ProcessEmailResult => ({ status, body });

/**
 * Reads a recruiter email with AI, then creates or updates the matching
 * application (and notifies the user). Used both for pasted emails and for
 * emails forwarded to the user's personal address.
 * Returns what changed plus the previous values so a change can be undone.
 * AI errors (AIError) are thrown to the caller.
 */
export async function processJobEmail(
  userId: string,
  email: string,
  { applicationId, locale }: { applicationId?: string; locale: AiLocale },
): Promise<ProcessEmailResult> {
  // AI use is only counted once the AI replies
  const access = await checkAndIncrementUsage(userId, FEATURE_KEYS.AI_REQUESTS, false);
  if (!access.allowed) {
    return reply({ success: false, error: 'limit_reached', planName: access.planName, limit: access.limit, used: access.used }, 403);
  }

  let target: JobApplication | null = null;
  if (applicationId) {
    target = await db.jobApplication.findFirst({ where: { id: applicationId, user_id: userId } });
    if (!target) {
      return reply({ success: false, error: 'Job application not found' }, 404);
    }
  }

  // 1. Understand the email
  const raw = await generateText(
    [
      { role: 'system', content: EMAIL_SYSTEM_PROMPT + replyLanguageInstruction(locale) },
      { role: 'user', content: `Email:\n"""\n${email}\n"""` },
    ],
    { json: true, temperature: 0.1 },
  );
  await recordUsage(userId, FEATURE_KEYS.AI_REQUESTS);
  const analysis = normalizeAnalysis(parseJsonReply<Record<string, unknown>>(raw));

  if (analysis.kind === 'other') {
    return reply({ success: true, analysis, action: 'none', reason: 'not_job_email' });
  }

  // 2. Find the application it belongs to
  if (!target) {
    const apps = await db.jobApplication.findMany({
      where: { user_id: userId, is_archived: false },
      select: { id: true, company_name: true, job_title: true, updated_at: true },
    });
    const match = findMatch(apps, analysis);
    if (match) target = await db.jobApplication.findUnique({ where: { id: match.id } });
  }

  const date = analysis.date ? new Date(analysis.date) : null;
  const noteLine = `📧 ${new Date().toISOString().slice(0, 10)} — ${analysis.summary || analysis.kind}`;

  // 3a. No existing application: create one
  if (!target) {
    if (!analysis.company) {
      return reply({ success: true, analysis, action: 'none', reason: 'no_company' });
    }
    const canCreate = await checkAndIncrementUsage(userId, FEATURE_KEYS.JOB_TRACKER);
    if (!canCreate.allowed) {
      return reply({ success: false, error: 'limit_reached', planName: canCreate.planName, limit: canCreate.limit, used: canCreate.used }, 403);
    }
    const status = KIND_TO_STATUS[analysis.kind] ?? 'applied';
    const application = await db.jobApplication.create({
      data: {
        user_id: userId,
        company_name: analysis.company,
        job_title: analysis.jobTitle || '—',
        job_url: analysis.jobUrl || null,
        location: analysis.location || null,
        status,
        notes: noteLine,
        applied_at: new Date(),
        interview_date: analysis.kind === 'interview' ? date : null,
        deadline_date: analysis.kind === 'assessment' ? date : null,
      },
    });
    const notificationId = await notifyJobStatus(userId, {
      applicationId: application.id,
      company: application.company_name,
      jobTitle: application.job_title,
      from: null,
      to: application.status,
      source: 'email',
      date: analysis.date,
    });
    return reply({ success: true, analysis, action: 'created', application, notificationId });
  }

  // 3b. Update the existing application
  const previous = {
    status: target.status,
    notes: target.notes,
    applied_at: target.applied_at?.toISOString() ?? null,
    interview_date: target.interview_date?.toISOString() ?? null,
    deadline_date: target.deadline_date?.toISOString() ?? null,
    job_url: target.job_url,
    location: target.location,
  };
  const status = nextStatus(target.status, analysis.kind);
  const application = await db.jobApplication.update({
    where: { id: target.id },
    data: {
      ...(status ? { status } : {}),
      notes: target.notes ? `${target.notes}\n${noteLine}` : noteLine,
      ...(!target.applied_at && analysis.kind !== 'rejection' ? { applied_at: new Date() } : {}),
      ...(analysis.kind === 'interview' && date ? { interview_date: date } : {}),
      ...(analysis.kind === 'assessment' && date ? { deadline_date: date } : {}),
      ...(!target.job_url && analysis.jobUrl ? { job_url: analysis.jobUrl } : {}),
      ...(!target.location && analysis.location ? { location: analysis.location } : {}),
    },
  });

  const notificationId = status
    ? await notifyJobStatus(userId, {
      applicationId: application.id,
      company: application.company_name,
      jobTitle: application.job_title,
      from: previous.status,
      to: status,
      source: 'email',
      date: analysis.date,
    })
    : null;

  return reply({
    success: true,
    analysis,
    action: 'updated',
    statusChanged: !!status,
    application,
    previous,
    notificationId,
  });
}
