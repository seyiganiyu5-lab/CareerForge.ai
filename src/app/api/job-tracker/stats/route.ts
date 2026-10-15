import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { requireFeature } from '@/lib/subscription/gate';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';

/**
 * GET /api/job-tracker/stats — Dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const locked = await requireFeature(auth.userId, FEATURE_KEYS.JOB_TRACKER);
    if (locked) return locked;

    const userId = auth.userId;

    // Get all non-archived applications
    const applications = await db.jobApplication.findMany({
      where: { user_id: userId, is_archived: false },
      select: { status: true, interview_date: true },
    });

    const total = applications.length;

    // Count by status
    const byStatus: Record<string, number> = {
      wishlist: 0,
      applied: 0,
      viewed: 0,
      assessment: 0,
      interview: 0,
      final_interview: 0,
      offer: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const app of applications) {
      if (byStatus[app.status] !== undefined) {
        byStatus[app.status]++;
      }
    }

    const applied = byStatus.applied + byStatus.viewed + byStatus.assessment + byStatus.interview + byStatus.final_interview + byStatus.offer + byStatus.accepted + byStatus.rejected + byStatus.withdrawn;
    const interviewsScheduled = applications.filter(
      a => a.interview_date && (a.status === 'interview' || a.status === 'final_interview')
    ).length;
    const offersReceived = byStatus.offer;
    const accepted = byStatus.accepted;
    const rejected = byStatus.rejected;

    // Response rate: responded (assessment + interview + final_interview + offer + accepted + rejected) / applied
    const responded = byStatus.assessment + byStatus.interview + byStatus.final_interview + byStatus.offer + byStatus.accepted + byStatus.rejected;
    const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

    // Acceptance rate: accepted / (offer + accepted)
    const totalOffers = byStatus.offer + byStatus.accepted;
    const acceptanceRate = totalOffers > 0 ? Math.round((accepted / totalOffers) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        applied,
        interviewsScheduled,
        offersReceived,
        accepted,
        rejected,
        responseRate,
        acceptanceRate,
        byStatus,
      },
    });
  } catch (error) {
    console.error('Job tracker stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
