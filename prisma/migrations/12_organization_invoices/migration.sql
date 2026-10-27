-- Payment requests for Enterprise organisations, paid through a private link
CREATE TABLE "OrganizationInvoice" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "organization_name" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "months" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reference" TEXT,
    "payer_email" TEXT,
    "payment_method" TEXT,
    "paid_at" TIMESTAMP(3),
    "access_until" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationInvoice_token_key" ON "OrganizationInvoice"("token");
CREATE UNIQUE INDEX "OrganizationInvoice_reference_key" ON "OrganizationInvoice"("reference");
CREATE INDEX "OrganizationInvoice_organization_id_created_at_idx" ON "OrganizationInvoice"("organization_id", "created_at");

-- Payment records stay when an organisation is deleted
ALTER TABLE "OrganizationInvoice" ADD CONSTRAINT "OrganizationInvoice_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Same as the other tables: no direct access through the Supabase Data API
ALTER TABLE "OrganizationInvoice" ENABLE ROW LEVEL SECURITY;
