-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: add abdoul (@abdoultheebarber) to public.students
-- Date: 2026-05-25
--
-- Adds the 6th student (Abdoul) to Dack's roster. Mirrors the same row
-- shape that scripts/import-cis-snapshot.mjs would write, so when the
-- import script is later run from Lovable's tools (or via Lovable chat
-- "re-import CIS snapshot"), this row will be UPDATEd in place — not
-- duplicated.
--
-- No videos / answers / business_log rows yet — Abdoul has 0 audited
-- reels at the time this seed lands. His queue.txt in CIS has 29 URLs
-- pending audit; once those run, the next snapshot import will fill in
-- the per-video rows.
--
-- Idempotent (ON CONFLICT DO NOTHING): re-running this migration is safe
-- and will NOT clobber a more up-to-date row already populated by a later
-- snapshot import.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.students (slug, display_name, ig_handle, shop_name, location, profile_md)
VALUES (
  'abdoul',
  'Abdoul',
  'abdoultheebarber',
  NULL,
  NULL,
  $abdoul_profile$# Abdoul — Profile

_New student added 2026-05-25. No CIS audits yet — every section below is a placeholder. Fill from batch 1 audits._

The `/audit-student` command reads this file every time it audits a video to tailor the verdict and recommendation to THIS student's archetype.

---

## Identity

- **Handle (Instagram):** @abdoultheebarber
- **Handle (TikTok):** TBD — Dack confirm
- **Handle (YouTube):** TBD — Dack confirm
- **Display name:** TBD — backfill from first audit's meta.json uploader
- **Real name (optional):** Abdoul (TBD — Dack confirm)
- **Location:** TBD — Dack confirm
- **Languages:** TBD — backfill from first audit

## Niche & Specialty

- **Primary niche:** TBD — backfill from first 3-5 audits
- **Sub-specialties:** TBD
- **Tools/products they're known for:** TBD

## Archetype

- **Content archetype:** TBD (skill-heavy / personality-led / educator / community-builder / hybrid)
- **Voice / personality:** TBD
- **Tone defaults:** TBD
- **Tier:** TBD (top-skilled / mid-skilled / coming-up)

## Audience

- **Estimated demo:** TBD — backfill from audience cues
- **Follower count (snapshot date — 2026-05-25):**
  - IG: TBD
  - TikTok: TBD
  - YouTube: TBD
- **Typical engagement-per-view baseline:** TBD — backfill from first 5 audits
- **What they comment most:** TBD — observe over time

## Performance baseline

- **Average views per post (last 30d):** TBD
- **Top-performing format historically:** TBD
- **Worst-performing format historically:** TBD
- **Last update:** 2026-05-25

## Strengths (what they already do well)

- TBD — backfill from first batch

## Weaknesses / Coaching Areas (where Dack is actively pushing them)

- TBD — backfill from first batch

## Series / Recurring formats

- TBD — surface after first 5 audits

## Goals / North Star

- **Short-term (90d):** TBD — Dack confirm
- **Long-term:** TBD — Dack confirm
- **Primary metric to grow:** TBD — Dack confirm

## Notes

- Newly added to CIS 2026-05-25 with a 29-URL strategic queue (all 2026+ posts, pre-filtered by the operator's IG console-listener tool).

---

_Last updated: 2026-05-25 (initial scaffold)._
$abdoul_profile$
)
ON CONFLICT (slug) DO NOTHING;
