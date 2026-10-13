-- Supabase exposes the public schema through its Data API using the public
-- anon key. The app reads and writes data only through Prisma (as the table
-- owner, which bypasses RLS), so enabling RLS with no policies blocks all
-- direct API access to these tables without affecting the app.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- When a user is deleted in Supabase Auth (e.g. from the dashboard), delete
-- their profile too. Their resumes, cover letters, etc. cascade from it.
-- Skipped when there is no auth schema (plain Postgres in local development).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    CREATE OR REPLACE FUNCTION public.delete_profile_for_auth_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $fn$
    BEGIN
      DELETE FROM public."User" WHERE id = OLD.id::text;
      RETURN OLD;
    END;
    $fn$;

    REVOKE EXECUTE ON FUNCTION public.delete_profile_for_auth_user() FROM PUBLIC;

    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    CREATE TRIGGER on_auth_user_deleted
      AFTER DELETE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.delete_profile_for_auth_user();
  END IF;
END $$;
