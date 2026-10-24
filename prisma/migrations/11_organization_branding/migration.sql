-- Enterprise branding: logo, colour and recommended CV templates
ALTER TABLE "Organization" ADD COLUMN "brand_color" TEXT;
ALTER TABLE "Organization" ADD COLUMN "logo" BYTEA;
ALTER TABLE "Organization" ADD COLUMN "logo_mime" TEXT;
ALTER TABLE "Organization" ADD COLUMN "logo_updated_at" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "recommended_templates" TEXT NOT NULL DEFAULT '[]';
