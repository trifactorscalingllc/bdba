DROP POLICY IF EXISTS public_read_answers ON public.answers;
DROP POLICY IF EXISTS public_read_business_log ON public.business_log;
DROP POLICY IF EXISTS public_read_students ON public.students;
DROP POLICY IF EXISTS public_read_videos ON public.videos;
DROP POLICY IF EXISTS public_read_video_assets ON public.video_assets;
DROP POLICY IF EXISTS public_read_coaching_library ON public.coaching_library;

-- Add scoped read policies for video_assets and coaching_library (others already have them)
CREATE POLICY "coach reads all video_assets" ON public.video_assets FOR SELECT TO authenticated USING (is_coach());
CREATE POLICY "student reads own video_assets" ON public.video_assets FOR SELECT TO authenticated USING (slug = my_slug());
CREATE POLICY "authenticated reads coaching_library" ON public.coaching_library FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.answers, public.business_log, public.students, public.videos, public.video_assets, public.coaching_library FROM anon;