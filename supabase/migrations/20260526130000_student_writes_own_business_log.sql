-- ─────────────────────────────────────────────────────────────────────────────
-- Allow students to write their own business_log entries.
--
-- Before this migration, business_log had:
--   - coach reads all                    (existing)
--   - student reads own                  (existing)
--   - coach writes (INSERT/UPDATE/DELETE) (existing)
-- After this migration, also:
--   - student INSERT own slug rows
--   - student UPDATE own slug rows  (so re-submitting the same date overwrites)
--
-- Why split INSERT and UPDATE instead of a single FOR ALL: students should
-- NOT be able to DELETE business-log entries (audit trail integrity). Coach
-- already has FOR ALL and can delete if needed.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "student inserts own business_log" ON public.business_log;
CREATE POLICY "student inserts own business_log" ON public.business_log
  FOR INSERT TO authenticated
  WITH CHECK (slug = public.my_slug());

DROP POLICY IF EXISTS "student updates own business_log" ON public.business_log;
CREATE POLICY "student updates own business_log" ON public.business_log
  FOR UPDATE TO authenticated
  USING (slug = public.my_slug())
  WITH CHECK (slug = public.my_slug());
