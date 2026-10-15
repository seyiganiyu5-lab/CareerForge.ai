-- Remember which plan each resume / cover letter was created on.
-- On the Free plan, documents created while on Pro are hidden (not deleted)
-- and come back when the user upgrades again.
ALTER TABLE "Resume" ADD COLUMN "plan_tier" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "CoverLetter" ADD COLUMN "plan_tier" TEXT NOT NULL DEFAULT 'free';

-- Existing documents: work out which ones must have been created on Pro.
-- 1. Anything beyond the Free plan's limit (by creation order) needs Pro,
--    so the user's earliest documents stay on Free.
UPDATE "Resume" r SET "plan_tier" = 'pro'
FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "user_id" ORDER BY "created_at") AS rn FROM "Resume") x
WHERE x."id" = r."id"
  AND x.rn > (SELECT pf."limit_value" FROM "PlanFeature" pf JOIN "Plan" p ON p."id" = pf."plan_id"
              WHERE p."name" = 'free' AND pf."feature_key" = 'CREATE_RESUME' AND pf."enabled" AND pf."limit_value" >= 0);

UPDATE "CoverLetter" c SET "plan_tier" = 'pro'
FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "user_id" ORDER BY "created_at") AS rn FROM "CoverLetter") x
WHERE x."id" = c."id"
  AND x.rn > (SELECT pf."limit_value" FROM "PlanFeature" pf JOIN "Plan" p ON p."id" = pf."plan_id"
              WHERE p."name" = 'free' AND pf."feature_key" = 'CREATE_COVER_LETTER' AND pf."enabled" AND pf."limit_value" >= 0);

-- 2. Anything created during the user's current paid period is Pro.
UPDATE "Resume" r SET "plan_tier" = 'pro'
FROM "Subscription" s JOIN "Plan" p ON p."id" = s."plan_id"
WHERE s."user_id" = r."user_id" AND p."name" <> 'free' AND r."created_at" >= s."current_period_start";

UPDATE "CoverLetter" c SET "plan_tier" = 'pro'
FROM "Subscription" s JOIN "Plan" p ON p."id" = s."plan_id"
WHERE s."user_id" = c."user_id" AND p."name" <> 'free' AND c."created_at" >= s."current_period_start";

CREATE INDEX "Resume_user_id_plan_tier_idx" ON "Resume"("user_id", "plan_tier");
CREATE INDEX "CoverLetter_user_id_plan_tier_idx" ON "CoverLetter"("user_id", "plan_tier");
