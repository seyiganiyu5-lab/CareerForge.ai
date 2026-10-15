import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { isAIConfigured, AIError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/client';
import { getRequestLocale } from '@/lib/ai/locale';
import { processJobEmail } from '@/lib/job-tracker/process-email';

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

    const result = await processJobEmail(auth.userId, parsed.data.email, {
      applicationId: parsed.data.applicationId,
      locale: getRequestLocale(request),
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Job tracker email import error:', error);
    if (error instanceof AIError) {
      return NextResponse.json({ success: false, error: error.userMessage }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to read the email' }, { status: 500 });
  }
}
