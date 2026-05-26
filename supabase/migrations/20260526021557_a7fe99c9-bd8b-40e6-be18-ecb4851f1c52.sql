
DROP POLICY IF EXISTS "public_read_answers_TEMPORARY_D061" ON public.answers;
DROP POLICY IF EXISTS "public_read_business_log_TEMPORARY_D061" ON public.business_log;
DROP POLICY IF EXISTS "public_read_coaching_library_TEMPORARY_D061" ON public.coaching_library;
DROP POLICY IF EXISTS "public_read_students_TEMPORARY_D061" ON public.students;
DROP POLICY IF EXISTS "public_read_videos_TEMPORARY_D061" ON public.videos;
DROP POLICY IF EXISTS "public_read_video_assets_TEMPORARY_D061" ON public.video_assets;

REVOKE EXECUTE ON FUNCTION public.is_coach() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.my_slug() FROM PUBLIC, anon, authenticated;
