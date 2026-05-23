// ─── CIS bridge — Supabase fetcher + sync read API ─────────────────────────
// Two-layer design:
//   1. fetchCisFromSupabase() — async; pulls all dashboard data in one
//      TanStack Query at the dashboard page level, then populates an
//      in-memory module cache.
//   2. Sync read API (getStudents, getVideos, etc.) — used by the scoring
//      engines (health-bar, five-two, recap, sparkline) which were designed
//      to be pure-sync functions. They read through the module cache.
//
// Why this shape (vs. making the scoring engines async): the scoring engines
// are ~700 lines of pure logic that already work. Refactoring all of them
// to be async would touch every call site and add unnecessary plumbing.
// The cache pattern lets us drop them in unchanged.
//
// The cache is populated ONCE per page load (TanStack handles
// invalidation/refetching). Stale-while-revalidate is fine for dashboard
// data — Brad/Dack tolerate ~minute-old data.

import { supabase } from "@/integrations/supabase/client";
import type {
  AnswersJson,
  BusinessLogEntry,
  CisCache,
  Slug,
  StudentProfile,
  VideosJsonlRow,
} from "./types";

// Module-scoped cache. Populated by fetchCisFromSupabase().
let _cache: CisCache | null = null;

// ─── Async fetcher (called by useCisData TanStack hook) ────────────────────

/** Best-effort parse of CIS profile.md into a StudentProfile. Forgiving
 *  because profile.md is human-edited. Mirrors the dack-ai-app implementation. */
function parseProfileMd(slug: Slug, txt: string): StudentProfile {
  const profile: StudentProfile = {
    slug,
    display_name: slug.charAt(0).toUpperCase() + slug.slice(1),
  };
  if (!txt) return profile;
  const m = txt.match(/^#\s+(.+?)\s+—/);
  if (m) profile.display_name = m[1].trim();
  const ig = txt.match(/Handle \(Instagram\):\*?\*?\s*@?(\S+)/i);
  if (ig) profile.ig_handle = ig[1].replace(/[*\s]/g, "");
  const shop = txt.match(/Business name[^:]*:\*?\*?\s*\*?\*?([A-Z][^\n*]+?)\*?\*?\s*—/);
  if (shop) profile.shop_name = shop[1].trim();
  const loc = txt.match(/\*\*Location:\*\*\s*([^\n]+)/);
  if (loc) profile.location = loc[1].trim().replace(/\([^)]*\)\s*$/, "").trim();
  return profile;
}

/** Fetch all dashboard data from Supabase, populate the cache, return the
 *  normalized shape. This is the canonical TanStack queryFn. */
export async function fetchCisFromSupabase(): Promise<CisCache> {
  // Fetch in parallel — RLS gates per-row so the coach gets all rows, a
  // student gets only their own slug (which is enough to render their
  // dashboard).
  const [studentsRes, videosRes, answersRes, businessRes] = await Promise.all([
    supabase.from("students").select("*").order("slug"),
    supabase.from("videos").select("*"),
    supabase.from("answers").select("slug,video_id,payload"),
    supabase.from("business_log").select("*"),
  ]);
  if (studentsRes.error) throw studentsRes.error;
  if (videosRes.error) throw videosRes.error;
  if (answersRes.error) throw answersRes.error;
  if (businessRes.error) throw businessRes.error;

  const cache: CisCache = {
    students: (studentsRes.data ?? []).map((s) => s.slug),
    data: {},
  };

  // Seed per-student buckets.
  for (const s of studentsRes.data ?? []) {
    const slug = s.slug as string;
    cache.data[slug] = {
      profile: parseProfileMd(slug, s.profile_md ?? ""),
      profile_md: s.profile_md ?? "",
      videos: [],
      business_log: [],
      answers: {},
    };
    // Patch in profile fields from the row directly (override the md parse
    // for the structured columns).
    cache.data[slug].profile.display_name = s.display_name ?? cache.data[slug].profile.display_name;
    if (s.ig_handle) cache.data[slug].profile.ig_handle = s.ig_handle;
    if (s.shop_name) cache.data[slug].profile.shop_name = s.shop_name;
    if (s.location) cache.data[slug].profile.location = s.location;
  }

  // Map videos in. The Supabase columns match VideosJsonlRow 1:1 with one
  // rename (`source_url` → `url`).
  for (const v of videosRes.data ?? []) {
    const slug = v.slug as string;
    if (!cache.data[slug]) continue;
    cache.data[slug].videos.push({
      video_id: v.video_id,
      url: v.source_url ?? undefined,
      posted_date: v.posted_date ?? undefined,
      audited_date: v.audited_date ?? undefined,
      hook_type: v.hook_type ?? undefined,
      structure_arc: v.structure_arc ?? undefined,
      format_typicality: (v.format_typicality ?? undefined) as VideosJsonlRow["format_typicality"],
      verdict_tier: (v.verdict_tier ?? undefined) as VideosJsonlRow["verdict_tier"],
      verdict_oneline: v.verdict_oneline ?? undefined,
      likes: v.likes ?? undefined,
      comments: v.comments ?? undefined,
      views: v.views ?? undefined,
    });
  }
  // Sort each student's videos by posted_date for stable iteration.
  for (const slug of Object.keys(cache.data)) {
    cache.data[slug].videos.sort((a, b) =>
      (a.posted_date || "").localeCompare(b.posted_date || ""),
    );
  }

  // Answers payload is JSONB — already the AnswersJson shape from CIS.
  for (const a of answersRes.data ?? []) {
    const slug = a.slug as string;
    if (!cache.data[slug]) continue;
    cache.data[slug].answers[a.video_id] = a.payload as AnswersJson;
  }

  // Business log.
  for (const e of businessRes.data ?? []) {
    const slug = e.slug as string;
    if (!cache.data[slug]) continue;
    cache.data[slug].business_log.push({
      date: e.date,
      new_clients: e.new_clients ?? 0,
      returning: e.returning ?? 0,
      cuts: e.cuts ?? 0,
      no_shows: e.no_shows ?? 0,
      revenue: e.revenue ?? null,
      notes: e.notes ?? undefined,
    });
  }
  for (const slug of Object.keys(cache.data)) {
    cache.data[slug].business_log.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }

  _cache = cache;
  return cache;
}

// ─── Sync read API — used by the scoring engines ───────────────────────────

export function getStudents(): Slug[] {
  return [...(_cache?.students ?? [])];
}

export function getVideos(slug: Slug): VideosJsonlRow[] {
  return _cache?.data[slug]?.videos ?? [];
}

export function getBusinessLog(slug: Slug): BusinessLogEntry[] {
  return _cache?.data[slug]?.business_log ?? [];
}

export function getProfile(slug: Slug): StudentProfile {
  return _cache?.data[slug]?.profile ?? {
    slug,
    display_name: slug.charAt(0).toUpperCase() + slug.slice(1),
  };
}

export function getAnswers(slug: Slug, videoId: string): AnswersJson | null {
  return _cache?.data[slug]?.answers[videoId] ?? null;
}

export function answerValue(answers: AnswersJson | null, qid: string): unknown {
  if (!answers) return undefined;
  return answers.answers?.[qid]?.value;
}

export function getPostType(slug: Slug, videoId: string): "converting" | "viral" | undefined {
  const v = answerValue(getAnswers(slug, videoId), "post_type");
  return v === "converting" || v === "viral" ? v : undefined;
}

export function getAntiPatternFlags(slug: Slug, videoId: string): string[] {
  const v = answerValue(getAnswers(slug, videoId), "anti_pattern_flags");
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function getAntiPatternFlagsRaw(slug: Slug, videoId: string): string[] | null {
  const answers = getAnswers(slug, videoId);
  if (!answers) return null;
  const cell = answers.answers?.["anti_pattern_flags"];
  if (!cell || cell.value === undefined || cell.value === null) return null;
  return Array.isArray(cell.value)
    ? cell.value.filter((x): x is string => typeof x === "string")
    : [];
}

export function getCoachingPrescription(slug: Slug, videoId: string): string {
  const v = answerValue(getAnswers(slug, videoId), "verdict_next_video_prescription");
  return typeof v === "string" ? v : "";
}

export function getAntiPatternFlagCount(slug: Slug, videoId: string): number {
  return getAntiPatternFlags(slug, videoId).length;
}

// Allow tests / Storybook to inject a synthetic cache.
export function _setCacheForTesting(cache: CisCache | null) {
  _cache = cache;
}
