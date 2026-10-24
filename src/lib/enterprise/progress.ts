import { db } from '@/lib/db';
import { scoreResume } from '@/lib/ats/scoring';
import { resumeDataToText } from '@/lib/resume/to-text';
import type { ResumeData } from '@/types/resume';

/**
 * Progress of an organisation's members for its owners and admins.
 * Only numbers, scores and dates leave this file: never the content of
 * anyone's CVs, cover letters or job applications.
 */

// Furthest step a member has reached, in order
export const STAGES = ['not_started', 'cv_ready', 'applying', 'interviewing', 'offer', 'hired'] as const;
export type Stage = (typeof STAGES)[number];

const INTERVIEW_OR_LATER = ['interview', 'final_interview', 'offer', 'accepted'];
const OFFER_OR_LATER = ['offer', 'accepted'];
const DAY = 86_400_000;

export interface MemberProgress {
  id: string;
  name: string;
  email: string;
  role: string;
  joined_at: Date;
  cvs: number;
  letters: number;
  /** ATS score (0–100) of their most recently edited CV, without a job description */
  ats: number | null;
  applications: number;
  interviews: number;
  offers: number;
  hired: boolean;
  last_active: Date | null;
  stage: Stage;
}

/** Score of a CV the same way the ATS checker does without a job description; null when it's empty */
function atsScore(dataJson: string): number | null {
  try {
    const data = JSON.parse(dataJson) as ResumeData;
    const text = resumeDataToText(data);
    if (text.replace(/\s+/g, '').length < 80) return null;
    return scoreResume(text, data).totalScore;
  } catch {
    return null;
  }
}

const latest = (...dates: (Date | null | undefined)[]) =>
  dates.reduce<Date | null>((max, d) => (d && (!max || d > max) ? d : max), null);

export async function organizationProgress(organizationId: string, now = new Date()) {
  const members = await db.organizationMember.findMany({
    where: { organization_id: organizationId },
    orderBy: { joined_at: 'asc' },
    take: 5000,
    select: { id: true, role: true, joined_at: true, user_id: true, user: { select: { first_name: true, last_name: true, email: true } } },
  });
  const ids = members.map((m) => m.user_id);

  const [resumeCounts, letterCounts, jobCounts, latestResumes] = await Promise.all([
    db.resume.groupBy({ by: ['user_id'], where: { user_id: { in: ids } }, _count: { _all: true }, _max: { updated_at: true } }),
    db.coverLetter.groupBy({ by: ['user_id'], where: { user_id: { in: ids } }, _count: { _all: true }, _max: { updated_at: true } }),
    db.jobApplication.groupBy({ by: ['user_id', 'status'], where: { user_id: { in: ids } }, _count: { _all: true }, _max: { updated_at: true } }),
    // Each member's most recently edited CV, only to work out its score here
    db.resume.findMany({
      where: { user_id: { in: ids } },
      orderBy: { updated_at: 'desc' },
      distinct: ['user_id'],
      select: { user_id: true, data_json: true },
    }),
  ]);

  const resumesBy = new Map(resumeCounts.map((r) => [r.user_id, r]));
  const lettersBy = new Map(letterCounts.map((r) => [r.user_id, r]));
  const scoreBy = new Map(latestResumes.map((r) => [r.user_id, atsScore(r.data_json)]));
  const jobsBy = new Map<string, { status: string; count: number; updated: Date | null }[]>();
  for (const j of jobCounts) {
    const list = jobsBy.get(j.user_id) ?? [];
    list.push({ status: j.status, count: j._count._all, updated: j._max.updated_at });
    jobsBy.set(j.user_id, list);
  }

  const rows: MemberProgress[] = members.map((m) => {
    const jobs = jobsBy.get(m.user_id) ?? [];
    const sum = (statuses: string[] | null) =>
      jobs.filter((j) => (statuses ? statuses.includes(j.status) : j.status !== 'wishlist')).reduce((n, j) => n + j.count, 0);
    const cvs = resumesBy.get(m.user_id)?._count._all ?? 0;
    const applications = sum(null);
    const interviews = sum(INTERVIEW_OR_LATER);
    const offers = sum(OFFER_OR_LATER);
    const hired = sum(['accepted']) > 0;
    const stage: Stage = hired ? 'hired' : offers ? 'offer' : interviews ? 'interviewing' : applications ? 'applying' : cvs ? 'cv_ready' : 'not_started';
    return {
      id: m.id,
      name: [m.user.first_name, m.user.last_name].filter(Boolean).join(' '),
      email: m.user.email,
      role: m.role,
      joined_at: m.joined_at,
      cvs,
      letters: lettersBy.get(m.user_id)?._count._all ?? 0,
      ats: scoreBy.get(m.user_id) ?? null,
      applications,
      interviews,
      offers,
      hired,
      last_active: latest(resumesBy.get(m.user_id)?._max.updated_at, lettersBy.get(m.user_id)?._max.updated_at, ...jobs.map((j) => j.updated)),
      stage,
    };
  });

  const scores = rows.map((r) => r.ats).filter((s): s is number => s !== null);
  const totals = {
    members: rows.length,
    with_cv: rows.filter((r) => r.cvs > 0).length,
    avg_ats: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    applications: rows.reduce((n, r) => n + r.applications, 0),
    interviewing: rows.filter((r) => r.interviews > 0).length,
    with_offer: rows.filter((r) => r.offers > 0).length,
    hired: rows.filter((r) => r.hired).length,
    active_7d: rows.filter((r) => r.last_active && now.getTime() - r.last_active.getTime() < 7 * DAY).length,
  };
  const stages = Object.fromEntries(STAGES.map((s) => [s, rows.filter((r) => r.stage === s).length])) as Record<Stage, number>;

  return { totals, stages, members: rows };
}
