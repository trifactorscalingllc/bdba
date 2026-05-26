
CREATE POLICY "public_read_students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_videos" ON public.videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_answers" ON public.answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_business_log" ON public.business_log FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_coaching_library" ON public.coaching_library FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_video_assets" ON public.video_assets FOR SELECT TO anon, authenticated USING (true);
