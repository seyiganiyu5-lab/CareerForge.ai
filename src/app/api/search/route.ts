import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docAccess } from '@/lib/subscription/documents';
import { canAccess } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';

const LIMIT = 5;

/**
 * GET /api/search?q=... — the user's resumes, cover letters and job
 * applications whose title matches (only what their plan lets them see).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
    if (q.length < 2) {
      return NextResponse.json({ success: true, resumes: [], coverLetters: [], jobs: [] });
    }
    const contains = { contains: q, mode: 'insensitive' as const };

    const [{ where }, jobAccess] = await Promise.all([
      docAccess(auth.userId),
      canAccess(auth.userId, FEATURE_KEYS.JOB_TRACKER),
    ]);
    const jobsVisible = jobAccess.allowed || jobAccess.reason === 'limit_reached';

    const [resumes, coverLetters, jobs] = await Promise.all([
      db.resume.findMany({
        where: { ...where, title: contains },
        orderBy: { updated_at: 'desc' },
        take: LIMIT,
        select: { id: true, title: true, updated_at: true },
      }),
      db.coverLetter.findMany({
        where: { ...where, title: contains },
        orderBy: { updated_at: 'desc' },
        take: LIMIT,
        select: { id: true, title: true, updated_at: true },
      }),
      jobsVisible
        ? db.jobApplication.findMany({
          where: {
            user_id: auth.userId,
            OR: [{ company_name: contains }, { job_title: contains }],
          },
          orderBy: { updated_at: 'desc' },
          take: LIMIT,
          select: { id: true, company_name: true, job_title: true, status: true },
        })
        : [],
    ]);

    return NextResponse.json({ success: true, resumes, coverLetters, jobs });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
