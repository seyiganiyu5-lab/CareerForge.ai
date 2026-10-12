import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';

// ─── Types ──────────────────────────────────────────────────────────────

interface HistoryReport {
  id: string;
  overallScore: number;
  resumeId: string;
  resumeTitle: string;
  categoryScores: Record<string, { score: number; label: string }>;
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    suggested: string[];
    matchPercentage: number;
  };
  hasJobDescription: boolean;
  previousScore: number | null;
  scoreChange: number | null;
  createdAt: string;
}

// ─── GET Handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Fetch reports (latest first, max 20)
    const reports = await db.atsReport.findMany({
      where: { user_id: user.userId },
      include: {
        resume: {
          select: { id: true, title: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // 3. Build response with score comparison data
    const formattedReports: HistoryReport[] = reports.map((report, index) => {
      let categoryScores: Record<string, { score: number; label: string }> = {};
      try {
        categoryScores =
          typeof report.category_scores === 'string'
            ? JSON.parse(report.category_scores)
            : report.category_scores;
      } catch {
        categoryScores = {};
      }

      let keywordAnalysis: HistoryReport['keywordAnalysis'] = {
        matched: [],
        missing: [],
        suggested: [],
        matchPercentage: 0,
      };
      try {
        keywordAnalysis =
          typeof report.keyword_analysis === 'string'
            ? JSON.parse(report.keyword_analysis)
            : report.keyword_analysis;
      } catch {
        // keep default
      }

      // Score comparison: compare with the next (more recent = older index) report for the same resume
      let previousScore: number | null = null;
      let scoreChange: number | null = null;

      if (index < reports.length - 1) {
        // Look ahead for the next report for the same resume
        for (let i = index + 1; i < reports.length; i++) {
          if (reports[i].resume_id === report.resume_id) {
            previousScore = reports[i].overall_score;
            scoreChange = report.overall_score - previousScore;
            break;
          }
        }
      }

      return {
        id: report.id,
        overallScore: report.overall_score,
        resumeId: report.resume_id,
        resumeTitle: report.resume?.title || 'Untitled Resume',
        categoryScores,
        keywordAnalysis,
        hasJobDescription: !!report.job_description && report.job_description.trim().length > 0,
        previousScore,
        scoreChange,
        createdAt: report.created_at.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      reports: formattedReports,
    });
  } catch (error) {
    console.error('[ATS Check History] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}