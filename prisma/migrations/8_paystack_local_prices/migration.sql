-- Payments move from Flutterwave to Paystack: provider-neutral columns.
ALTER TABLE "Payment" RENAME COLUMN "flutterwave_transaction_id" TO "provider_transaction_id";
ALTER INDEX "Payment_flutterwave_transaction_id_key" RENAME TO "Payment_provider_transaction_id_key";
ALTER TABLE "Payment" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'paystack';
UPDATE "Payment" SET "provider" = 'flutterwave' WHERE "provider_transaction_id" IS NOT NULL;
-- The plan and period that were bought (history used to show the current plan instead)
ALTER TABLE "Payment" ADD COLUMN "plan_id" TEXT;
ALTER TABLE "Payment" ADD COLUMN "billing_cycle" TEXT;

ALTER TABLE "Subscription" RENAME COLUMN "flutterwave_subscription_id" TO "provider_subscription_id";

-- Price of each paid plan in each currency, in the currency's subunit
-- (x100, as Paystack expects: kobo, cents; CFA francs are also x100).
-- Change prices here (Supabase -> Table editor -> PlanPrice).
CREATE TABLE "PlanPrice" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "price_monthly" INTEGER NOT NULL,
    "price_yearly" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlanPrice_plan_id_currency_key" ON "PlanPrice"("plan_id", "currency");

ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same as the other tables: no direct access through the Supabase Data API
ALTER TABLE "PlanPrice" ENABLE ROW LEVEL SECURITY;

-- Pro: $7.99 / $79.99, ₦7,900 / ₦79,000, 4,900 / 49,000 FCFA
INSERT INTO "PlanPrice" ("id", "plan_id", "currency", "price_monthly", "price_yearly", "updated_at")
SELECT 'price_pro_usd', "id", 'USD', "price_monthly", "price_yearly", CURRENT_TIMESTAMP FROM "Plan" WHERE "name" = 'pro'
UNION ALL
SELECT 'price_pro_ngn', "id", 'NGN', 790000, 7900000, CURRENT_TIMESTAMP FROM "Plan" WHERE "name" = 'pro'
UNION ALL
SELECT 'price_pro_xof', "id", 'XOF', 490000, 4900000, CURRENT_TIMESTAMP FROM "Plan" WHERE "name" = 'pro'
ON CONFLICT ("plan_id", "currency") DO NOTHING;
