-- ─────────────────────────────────────────────────────────────────────────────
-- Restore the D-061 temporary public-read dashboard policies + the helper
-- function grants that the previous cleanup migration (20260526021557)
-- removed prematurely.
--
-- Why: Dashboard.tsx (lines 23-26) still relies on anon SELECT through the
-- public_read_*_TEMPORARY_D061 policies — the code-side "re-enable auth"
-- follow-up that D-061 promised has not shipped yet. Meanwhile the cleanup
-- migration left the per-table `student reads own X` policies in place,
-- every one of which calls public.my_slug() in its USING clause. Combined
-- with the REVOKE on my_slug, that turned every authenticated request into
-- `42501 permission denied for function my_slug`.
--
-- This migration:
--   1. Re-grants EXECUTE on is_coach() and my_slug() to anon + authenticated
--      so any policy that calls them can evaluate (current OR future).
--   2. Re-creates the public_read_*_TEMPORARY_D061 policies for the six
--      dashboard tables the React code reads (students, videos, answers,
--      business_log, coaching_library, video_assets).
--
-- INSERT/UPDATE/DELETE remain coach-only (those policies were never touched).
-- The `student reads own X` policies remain in place — harmless once
-- my_slug() is callable again.
--
-- Roll back D-061 properly by restoring useAuth() in Dashboard.tsx
-- (and StudentDashboard/AppNavbar), THEN drop these public_read_* policies
-- in a follow-up migration. Don't drop them before the code change ships.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Re-grant EXECUTE on the helper functions.
GRANT EXECUTE ON FUNCTION public.is_coach() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_slug()  TO anon, authenticated;

-- 2. Re-create the temporary public-read policies. Idempotent via DROP IF
--    EXISTS so this migration can be re-run safely.

DROP POLICY IF EXISTS "public_read_students_TEMPORARY_D061"        ON public.students;
DROP POLICY IF EXISTS "public_read_videos_TEMPORARY_D061"          ON public.videos;
DROP POLICY IF EXISTS "public_read_answers_TEMPORARY_D061"         ON public.answers;
DROP POLICY IF EXISTS "public_read_business_log_TEMPORARY_D061"    ON public.business_log;
DROP POLICY IF EXISTS "public_read_coaching_library_TEMPORARY_D061" ON public.coaching_library;
DROP POLICY IF EXISTS "public_read_video_assets_TEMPORARY_D061"    ON public.video_assets;

CREATE POLICY "public_read_students_TEMPORARY_D061" ON public.students
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_videos_TEMPORARY_D061" ON public.videos
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_answers_TEMPORARY_D061" ON public.answers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_business_log_TEMPORARY_D061" ON public.business_log
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_coaching_library_TEMPORARY_D061" ON public.coaching_library
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_video_assets_TEMPORARY_D061" ON public.video_assets
  FOR SELECT TO anon, authenticated
  USING (true);
