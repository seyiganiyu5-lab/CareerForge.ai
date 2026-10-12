// Feature key constants for type safety
export const FEATURE_KEYS = {
  CREATE_RESUME: 'CREATE_RESUME',
  CREATE_COVER_LETTER: 'CREATE_COVER_LETTER',
  TEMPLATES: 'TEMPLATES',
  PDF_EXPORT: 'PDF_EXPORT',
  BASIC_ATS_SCORE: 'BASIC_ATS_SCORE',
  AI_RESUME_BUILDER: 'AI_RESUME_BUILDER',
  AI_COVER_LETTER: 'AI_COVER_LETTER',
  AI_RESUME_REVIEW: 'AI_RESUME_REVIEW',
  ATS_CHECKER: 'ATS_CHECKER',
  JOB_TRACKER: 'JOB_TRACKER',
  DOCX_EXPORT: 'DOCX_EXPORT',
  VERSION_HISTORY: 'VERSION_HISTORY',
  AI_REQUESTS: 'AI_REQUESTS',
  TEAM_MANAGEMENT: 'TEAM_MANAGEMENT',
  RECRUITER_DASHBOARD: 'RECRUITER_DASHBOARD',
  COMPANY_BRANDING: 'COMPANY_BRANDING',
  ANALYTICS: 'ANALYTICS',
  MULTIPLE_WORKSPACES: 'MULTIPLE_WORKSPACES',
  API_ACCESS: 'API_ACCESS',
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

// Premium features (require Pro or Enterprise)
export const PREMIUM_FEATURES: FeatureKey[] = [
  FEATURE_KEYS.AI_RESUME_BUILDER,
  FEATURE_KEYS.AI_COVER_LETTER,
  FEATURE_KEYS.AI_RESUME_REVIEW,
  FEATURE_KEYS.ATS_CHECKER,
  FEATURE_KEYS.JOB_TRACKER,
  FEATURE_KEYS.DOCX_EXPORT,
  FEATURE_KEYS.VERSION_HISTORY,
];

// Feature to usage field mapping
export const FEATURE_USAGE_MAP: Record<string, keyof import('@prisma/client').UserUsage | null> = {
  [FEATURE_KEYS.CREATE_RESUME]: 'resume_count',
  [FEATURE_KEYS.CREATE_COVER_LETTER]: 'cover_letter_count',
  [FEATURE_KEYS.PDF_EXPORT]: 'exports_count',
  [FEATURE_KEYS.AI_REQUESTS]: 'ai_requests',
  [FEATURE_KEYS.AI_RESUME_REVIEW]: 'resume_reviews',
  [FEATURE_KEYS.ATS_CHECKER]: 'ats_checks',
  [FEATURE_KEYS.AI_RESUME_BUILDER]: 'ai_requests',
  [FEATURE_KEYS.AI_COVER_LETTER]: 'ai_requests',
  [FEATURE_KEYS.BASIC_ATS_SCORE]: null,
  [FEATURE_KEYS.TEMPLATES]: null,
  [FEATURE_KEYS.VERSION_HISTORY]: null,
  [FEATURE_KEYS.JOB_TRACKER]: 'job_applications_count',
  [FEATURE_KEYS.DOCX_EXPORT]: 'exports_count',
  [FEATURE_KEYS.TEAM_MANAGEMENT]: null,
  [FEATURE_KEYS.RECRUITER_DASHBOARD]: null,
  [FEATURE_KEYS.COMPANY_BRANDING]: null,
  [FEATURE_KEYS.ANALYTICS]: null,
  [FEATURE_KEYS.MULTIPLE_WORKSPACES]: null,
  [FEATURE_KEYS.API_ACCESS]: null,
};

// Display info for features
export const FEATURE_DISPLAY_INFO: Record<string, { label: string; description: string }> = {
  [FEATURE_KEYS.CREATE_RESUME]: { label: 'Resumes', description: 'Create resumes' },
  [FEATURE_KEYS.CREATE_COVER_LETTER]: { label: 'Cover Letters', description: 'Create cover letters' },
  [FEATURE_KEYS.TEMPLATES]: { label: 'Templates', description: 'Access templates' },
  [FEATURE_KEYS.PDF_EXPORT]: { label: 'PDF Exports', description: 'Export to PDF' },
  [FEATURE_KEYS.BASIC_ATS_SCORE]: { label: 'Basic ATS Score', description: 'Basic ATS compatibility score' },
  [FEATURE_KEYS.AI_RESUME_BUILDER]: { label: 'AI Resume Builder', description: 'AI-powered resume building' },
  [FEATURE_KEYS.AI_COVER_LETTER]: { label: 'AI Cover Letter', description: 'AI-generated cover letters' },
  [FEATURE_KEYS.AI_RESUME_REVIEW]: { label: 'AI Resume Review', description: 'AI-powered resume review' },
  [FEATURE_KEYS.ATS_CHECKER]: { label: 'ATS Checker', description: 'Full ATS compatibility analysis' },
  [FEATURE_KEYS.JOB_TRACKER]: { label: 'Job Tracker', description: 'Track job applications' },
  [FEATURE_KEYS.DOCX_EXPORT]: { label: 'DOCX Export', description: 'Export to DOCX format' },
  [FEATURE_KEYS.VERSION_HISTORY]: { label: 'Version History', description: 'Document version history' },
  [FEATURE_KEYS.AI_REQUESTS]: { label: 'AI Requests', description: 'AI-powered requests' },
};