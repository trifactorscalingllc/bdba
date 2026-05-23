-- D-061 TEMPORARY: open the dashboard tables to anonymous READ access
-- The profiles table is intentionally NOT opened up.

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