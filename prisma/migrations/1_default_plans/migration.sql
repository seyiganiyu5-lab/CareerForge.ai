-- Default plans and their feature limits.
-- Uses ON CONFLICT DO NOTHING so it never overwrites or deletes existing data.

INSERT INTO "Plan" ("id", "name", "display_name", "price_monthly", "price_yearly", "currency", "billing_cycle", "features", "description", "sort_order", "is_active", "updated_at")
VALUES ('plan_free', 'free', 'Free', 0, 0, 'USD', 'monthly', '["CREATE_RESUME","CREATE_COVER_LETTER","TEMPLATES","PDF_EXPORT","BASIC_ATS_SCORE","AI_RESUME_BUILDER","AI_COVER_LETTER","AI_RESUME_REVIEW","ATS_CHECKER","JOB_TRACKER","DOCX_EXPORT","VERSION_HISTORY","AI_REQUESTS"]', 'Get started with basic resume building tools', 0, true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "PlanFeature" ("id", "plan_id", "feature_key", "enabled", "limit_value")
VALUES
  ('plan_free_create_resume', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'CREATE_RESUME', true, 1),
  ('plan_free_create_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'CREATE_COVER_LETTER', true, 3),
  ('plan_free_templates', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'TEMPLATES', true, 3),
  ('plan_free_pdf_export', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'PDF_EXPORT', true, 3),
  ('plan_free_basic_ats_score', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'BASIC_ATS_SCORE', true, -1),
  ('plan_free_ai_resume_builder', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'AI_RESUME_BUILDER', true, 3),
  ('plan_free_ai_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'AI_COVER_LETTER', false, 0),
  ('plan_free_ai_resume_review', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'AI_RESUME_REVIEW', false, 0),
  ('plan_free_ats_checker', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'ATS_CHECKER', false, 0),
  ('plan_free_job_tracker', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'JOB_TRACKER', false, 0),
  ('plan_free_docx_export', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'DOCX_EXPORT', false, 0),
  ('plan_free_version_history', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'VERSION_HISTORY', false, 0),
  ('plan_free_ai_requests', (SELECT "id" FROM "Plan" WHERE "name" = 'free'), 'AI_REQUESTS', true, 3)
ON CONFLICT ("plan_id", "feature_key") DO NOTHING;

INSERT INTO "Plan" ("id", "name", "display_name", "price_monthly", "price_yearly", "currency", "billing_cycle", "features", "description", "sort_order", "is_active", "updated_at")
VALUES ('plan_pro', 'pro', 'Pro', 799, 7999, 'USD', 'monthly', '["CREATE_RESUME","CREATE_COVER_LETTER","TEMPLATES","PDF_EXPORT","BASIC_ATS_SCORE","AI_RESUME_BUILDER","AI_COVER_LETTER","AI_RESUME_REVIEW","ATS_CHECKER","JOB_TRACKER","DOCX_EXPORT","VERSION_HISTORY","AI_REQUESTS"]', 'Unlock AI-powered tools and unlimited documents', 1, true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "PlanFeature" ("id", "plan_id", "feature_key", "enabled", "limit_value")
VALUES
  ('plan_pro_create_resume', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'CREATE_RESUME', true, -1),
  ('plan_pro_create_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'CREATE_COVER_LETTER', true, -1),
  ('plan_pro_templates', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'TEMPLATES', true, -1),
  ('plan_pro_pdf_export', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'PDF_EXPORT', true, -1),
  ('plan_pro_basic_ats_score', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'BASIC_ATS_SCORE', true, -1),
  ('plan_pro_ai_resume_builder', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'AI_RESUME_BUILDER', true, -1),
  ('plan_pro_ai_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'AI_COVER_LETTER', true, -1),
  ('plan_pro_ai_resume_review', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'AI_RESUME_REVIEW', true, -1),
  ('plan_pro_ats_checker', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'ATS_CHECKER', true, -1),
  ('plan_pro_job_tracker', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'JOB_TRACKER', true, -1),
  ('plan_pro_docx_export', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'DOCX_EXPORT', true, -1),
  ('plan_pro_version_history', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'VERSION_HISTORY', true, -1),
  ('plan_pro_ai_requests', (SELECT "id" FROM "Plan" WHERE "name" = 'pro'), 'AI_REQUESTS', true, 100)
ON CONFLICT ("plan_id", "feature_key") DO NOTHING;

INSERT INTO "Plan" ("id", "name", "display_name", "price_monthly", "price_yearly", "currency", "billing_cycle", "features", "description", "sort_order", "is_active", "updated_at")
VALUES ('plan_enterprise', 'enterprise', 'Enterprise', 0, 0, 'USD', 'monthly', '["CREATE_RESUME","CREATE_COVER_LETTER","TEMPLATES","PDF_EXPORT","BASIC_ATS_SCORE","AI_RESUME_BUILDER","AI_COVER_LETTER","AI_RESUME_REVIEW","ATS_CHECKER","JOB_TRACKER","DOCX_EXPORT","VERSION_HISTORY","AI_REQUESTS","TEAM_MANAGEMENT","RECRUITER_DASHBOARD","COMPANY_BRANDING","ANALYTICS","MULTIPLE_WORKSPACES","API_ACCESS"]', 'Team management, analytics, and custom branding', 2, true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "PlanFeature" ("id", "plan_id", "feature_key", "enabled", "limit_value")
VALUES
  ('plan_enterprise_create_resume', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'CREATE_RESUME', true, -1),
  ('plan_enterprise_create_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'CREATE_COVER_LETTER', true, -1),
  ('plan_enterprise_templates', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'TEMPLATES', true, -1),
  ('plan_enterprise_pdf_export', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'PDF_EXPORT', true, -1),
  ('plan_enterprise_basic_ats_score', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'BASIC_ATS_SCORE', true, -1),
  ('plan_enterprise_ai_resume_builder', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'AI_RESUME_BUILDER', true, -1),
  ('plan_enterprise_ai_cover_letter', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'AI_COVER_LETTER', true, -1),
  ('plan_enterprise_ai_resume_review', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'AI_RESUME_REVIEW', true, -1),
  ('plan_enterprise_ats_checker', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'ATS_CHECKER', true, -1),
  ('plan_enterprise_job_tracker', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'JOB_TRACKER', true, -1),
  ('plan_enterprise_docx_export', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'DOCX_EXPORT', true, -1),
  ('plan_enterprise_version_history', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'VERSION_HISTORY', true, -1),
  ('plan_enterprise_ai_requests', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'AI_REQUESTS', true, -1),
  ('plan_enterprise_team_management', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'TEAM_MANAGEMENT', true, -1),
  ('plan_enterprise_recruiter_dashboard', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'RECRUITER_DASHBOARD', true, -1),
  ('plan_enterprise_company_branding', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'COMPANY_BRANDING', true, -1),
  ('plan_enterprise_analytics', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'ANALYTICS', true, -1),
  ('plan_enterprise_multiple_workspaces', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'MULTIPLE_WORKSPACES', true, -1),
  ('plan_enterprise_api_access', (SELECT "id" FROM "Plan" WHERE "name" = 'enterprise'), 'API_ACCESS', true, -1)
ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
