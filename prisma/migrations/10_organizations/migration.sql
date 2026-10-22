-- Enterprise organisations: members get the Enterprise plan while the
-- organisation is active, up to the number of seats it has.
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "org_type" TEXT NOT NULL DEFAULT 'other',
    "seats" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ends_at" TIMESTAMP(3),
    "invite_code" TEXT NOT NULL,
    "invite_link_enabled" BOOLEAN NOT NULL DEFAULT true,
    "lead_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationInvite" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "invited_by" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_invite_code_key" ON "Organization"("invite_code");
CREATE UNIQUE INDEX "OrganizationMember_user_id_key" ON "OrganizationMember"("user_id");
CREATE INDEX "OrganizationMember_organization_id_idx" ON "OrganizationMember"("organization_id");
CREATE UNIQUE INDEX "OrganizationInvite_token_key" ON "OrganizationInvite"("token");
CREATE INDEX "OrganizationInvite_email_idx" ON "OrganizationInvite"("email");
CREATE UNIQUE INDEX "OrganizationInvite_organization_id_email_key" ON "OrganizationInvite"("organization_id", "email");

ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same as the other tables: no direct access through the Supabase Data API
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationInvite" ENABLE ROW LEVEL SECURITY;
