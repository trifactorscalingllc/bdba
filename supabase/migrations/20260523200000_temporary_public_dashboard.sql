-- ─────────────────────────────────────────────────────────────────────────────
-- D-061 TEMPORARY: open the dashboard tables to anonymous READ access
-- Date: 2026-05-23
--
-- Rationale: supabase-js was deadlocking on sign-in flows that Brad can't
-- afford to keep debugging today. Pulling auth out of the way so Dack can
-- start using the dashboard immediately. Auth comes back in a follow-up
-- (see D-061 entry in BUILD_DEVIATIONS.md for full context).
--
-- Security profile in this mode: ANYONE with the URL can read all dashboard
-- data (student names, audit verdicts, business log, revenue, prescriptions).
-- Acceptable because:
--   * /dashboard isn't linked from the marketing site
--   * the route uses <meta name="robots" content="noindex,nofollow">
--   * Brad will text the URL to Dack manually (same way he would have texted
--     login credentials)
--   * INSERT/UPDATE/DELETE are still coach-only (no anon writes — public
--     can read but never modify)
--
-- ⚠ Drop these 4 policies BEFORE re-enabling Supabase Auth — otherwise
-- students would see each other's data through the public_read path,
-- bypassing the "students read own slug" RLS that the auth flow assumes.
-- The names end in _TEMPORARY_D061 to make them grep-able for cleanup.
-- ─────────────────────────────────────────────────────────────────────────────

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

-- Note: the coach-write policies remain in place. Writes still require an
-- authenticated user with role='coach'. This is read-only public access.
-- The profiles table is intentionally NOT opened up — it stays auth-gated
-- in case we leave the auth scaffolding in place for a quick re-enable.
