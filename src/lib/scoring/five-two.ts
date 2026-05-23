// ─── 5-2 Compliance Tracker (PRD F1) ────────────────────────────────────────
// Ported verbatim from dack-ai-app/lib/scoring/five-two.ts. Reads via the
// sync cis-bridge (which is populated by a TanStack Query at page level).

import { getPostType, getVideos } from "@/lib/cis-bridge";
import type { FiveTwoStatus, FiveTwoWeek, Slug } from "@/lib/types";

const TARGET_CONVERTING = 5;
const TARGET_VIRAL = 2;
const PARTIAL_CONVERTING = 3;
const PARTIAL_VIRAL = 1;

function weekStartISO(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00Z");
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d.toISOString().slice(0, 10);
}

function classifyStatus(c: number, v: number): FiveTwoStatus {
  if (c >= TARGET_CONVERTING && v >= TARGET_VIRAL) return "on_track";
  if (c >= PARTIAL_CONVERTING && v >= PARTIAL_VIRAL) return "partial";
  return "off_track";
}

export function computeFiveTwoWeeks(slug: Slug): FiveTwoWeek[] {
  const videos = getVideos(slug);
  const byWeek = new Map<string, { converting: number; viral: number; total: number }>();
  for (const v of videos) {
    if (!v.posted_date || !v.video_id) continue;
    const wk = weekStartISO(v.posted_date);
    const bucket = byWeek.get(wk) ?? { converting: 0, viral: 0, total: 0 };
    bucket.total += 1;
    const pt = getPostType(slug, v.video_id);
    if (pt === "converting") bucket.converting += 1;
    else if (pt === "viral") bucket.viral += 1;
    byWeek.set(wk, bucket);
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, b]) => ({
      weekStart,
      converting: b.converting,
      viral: b.viral,
      total: b.total,
      status: classifyStatus(b.converting, b.viral),
    }));
}

export function computeCurrentWeek(slug: Slug, today = new Date()): FiveTwoWeek | null {
  const todayIso = today.toISOString().slice(0, 10);
  const wk = weekStartISO(todayIso);
  return computeFiveTwoWeeks(slug).find((w) => w.weekStart === wk) ?? null;
}

export function computeStreak(slug: Slug): number {
  const weeks = computeFiveTwoWeeks(slug);
  let streak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].status === "on_track") streak += 1;
    else break;
  }
  return streak;
}

export function fiveTwoFactorForHealthBar(
  slug: Slug,
  today = new Date(),
): { earned: number; max: 25; weeksInWindow: number; weeksCompliant: number } {
  const todayMs = today.getTime();
  const fourWeeksMs = 4 * 7 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(todayMs - fourWeeksMs).toISOString().slice(0, 10);
  const weeks = computeFiveTwoWeeks(slug).filter((w) => w.weekStart >= cutoff);
  const compliant = weeks.filter((w) => w.status === "on_track").length;
  const earned = weeks.length === 0 ? 0 : Math.round((compliant / 4) * 25);
  return { earned, max: 25, weeksInWindow: weeks.length, weeksCompliant: compliant };
}
