-- ─────────────────────────────────────────────────────────────────────────────
-- audit_simple_md column on public.videos
-- Date: 2026-05-23
--
-- Adds the plain-English deterministic audit (D-047 / D-056) to each video
-- row so the bdba StudentDashboard can render the click-to-expand audit
-- panel without needing to port the Python _plainify glossary to TypeScript.
-- CIS already generates audit-simple.md per video — we just import it.
--
-- Nullable + idempotent (the snapshot script writes "" for videos that
-- don't have an audit-simple.md yet; import-cis-snapshot.mjs upserts so
-- re-runs just update the column).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS audit_simple_md TEXT;

COMMENT ON COLUMN public.videos.audit_simple_md IS
  'Deterministic plain-English audit (D-047 / D-056). Mirrors the
   audit-simple.md file CIS writes at students/<slug>/videos/<id>/audit-simple.md.
   Re-populated on every import-cis-snapshot.mjs run.';
