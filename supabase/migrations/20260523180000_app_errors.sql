-- ─────────────────────────────────────────────────────────────────────────────
-- app_errors — frontend runtime error capture
-- Date: 2026-05-23
--
-- Stores every uncaught error from the dashboard (and login page) so Brad can
-- review issues without having to be in the room when Dack hits them.
--
-- Insert is unrestricted (anon or authenticated) so even pre-auth errors
-- (like a login-page render crash) get captured. SELECT is coach-only — Dack
-- doesn't need to see error logs; only Brad/Dack-the-coach does.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.app_errors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT,
  route        TEXT,
  message      TEXT NOT NULL,
  stack        TEXT,
  context      JSONB,
  user_agent   TEXT,
  severity     TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_errors_created ON public.app_errors (created_at DESC);
CREATE INDEX idx_app_errors_user ON public.app_errors (user_id, created_at DESC);
CREATE INDEX idx_app_errors_severity ON public.app_errors (severity, created_at DESC);

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

-- Anyone can write an error (pre-auth errors need this — e.g. login-page crash)
CREATE POLICY "anyone can log errors" ON public.app_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only coach can read errors (operator-only debug surface)
CREATE POLICY "coach reads errors" ON public.app_errors
  FOR SELECT TO authenticated
  USING (public.is_coach());

-- Only coach can delete errors (cleanup after fix)
CREATE POLICY "coach deletes errors" ON public.app_errors
  FOR DELETE TO authenticated
  USING (public.is_coach());
