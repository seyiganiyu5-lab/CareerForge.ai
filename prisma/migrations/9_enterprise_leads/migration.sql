-- Requests from organisations interested in Enterprise (Contact Sales form)
CREATE TABLE "EnterpriseLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "org_type" TEXT NOT NULL,
    "team_size" TEXT NOT NULL,
    "country" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL DEFAULT '',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'new',
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnterpriseLead_status_created_at_idx" ON "EnterpriseLead"("status", "created_at");

-- Same as the other tables: no direct access through the Supabase Data API
ALTER TABLE "EnterpriseLead" ENABLE ROW LEVEL SECURITY;
