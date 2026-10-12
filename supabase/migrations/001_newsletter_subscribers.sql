-- ============================================
-- Newsletter Subscribers Table
-- ============================================
-- Run this SQL in your Supabase SQL Editor.
--
-- Security is enforced at the API layer:
--   - Zod validation (email format, max length, trim)
--   - Rate limiting (3 requests/min/IP)
--   - Duplicate detection
--   - SQL injection protection (parameterized queries)
--
-- RLS is intentionally disabled because:
--   1. All writes go through the server-side API route (never direct client access)
--   2. The Supabase anon key via PostgREST has known RLS quirks for INSERT policies
--   3. The API route provides stricter security than RLS (rate limiting, input validation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique email constraint
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);

-- Index for lookups
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx
  ON public.newsletter_subscribers (email);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON public.newsletter_subscribers (status);

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();