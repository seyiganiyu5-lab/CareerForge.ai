import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { checkAndIncrementUsage, recordUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { generateText, parseJsonReply, isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { getRequestLocale, replyLanguageInstruction } from '@/lib/ai/locale';
import {
  EMAIL_SYSTEM_PROMPT,
  KIND_TO_STATUS,
  findMatch,
  nextStatus,
  normalizeAnalysis,
} from '@/lib/job-tracker/email-update';
import { db } from '@/lib/db';
import type { JobApplication } from '@prisma/client';

const bodySchema = z.object({
  email: z.string().trim().min(20).max(20000),
  // Optional: the application this email is about (skips automatic matching)
  applicationId: z.string().optional(),
});

/**
 * POST /api/job-tracker/from-email
 * Reads a pasted recruiter email with AI, then creates or updates the matching
 * application. Returns what changed plus the previous values so the client can undo.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAIConfigured()) {
      return NextResponse.json({ success: false, error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'invalid_email' }, { status: 400 });
    }
    const { email, applicationId } = parsed.data;

    // AI use is only counted once the AI replies
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.AI_REQUESTS, false);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: 'limit_reached', planName: access.planName, limit: access.limit, used: access.used },
        { status: 403 },
      );
    }

    let target: JobApplication | null = null;
    if (applicationId) {
      target = await db.jobApplication.findFirst({ where: { id: applicationId, user_id: auth.userId } });
      if (!target) {
        return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
      }
    }

    // 1. Understand the email
    const raw = await generateText(
      [
        { role: 'system', content: EMAIL_SYSTEM_PROMPT + replyLanguageInstruction(getRequestLocale(request)) },
        { role: 'user', content: `Email:\n"""\n${email}\n"""` },
      ],
      { json: true, temperature: 0.1 },
    );
    await recordUsage(auth.userId, FEATURE_KEYS.AI_REQUESTS);
    const analysis = normalizeAnalysis(parseJsonReply<Record<string, unknown>>(raw));

    if (analysis.kind === 'other') {
      return NextResponse.json({ success: true, analysis, action: 'none', reason: 'not_job_email' });
    }

    // 2. Find the application it belongs to
    if (!target) {
      const apps = await db.jobApplication.findMany({
        where: { user_id: auth.userId, is_archived: false },
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
        return NextResponse.json({ success: true, analysis, action: 'none', reason: 'no_company' });
      }
      const canCreate = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.JOB_TRACKER);
      if (!canCreate.allowed) {
        return NextResponse.json(
          { success: false, error: 'limit_reached', planName: canCreate.planName, limit: canCreate.limit, used: canCreate.used },
          { status: 403 },
        );
      }
      const status = KIND_TO_STATUS[analysis.kind] ?? 'applied';
      const application = await db.jobApplication.create({
        data: {
          user_id: auth.userId,
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
      return NextResponse.json({ success: true, analysis, action: 'created', application });
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

    return NextResponse.json({
      success: true,
      analysis,
      action: 'updated',
      statusChanged: !!status,
      application,
      previous,
    });
  } catch (error) {
    console.error('Job tracker email import error:', error);
    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to read the email' }, { status: 500 });
  }
}
