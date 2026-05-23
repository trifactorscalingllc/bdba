// ─── Sparkline trend (PRD F4) ───────────────────────────────────────────────
// Ported verbatim from dack-ai-app/lib/scoring/sparkline.ts.

import { getVideos } from "@/lib/cis-bridge";
import type { Slug, SparklineTrend, VideosJsonlRow } from "@/lib/types";

function engagementProxy(r: VideosJsonlRow): number | null {
  if (typeof r.likes !== "number" || r.likes < 0) return null;
  return r.likes + (typeof r.comments === "number" && r.comments > 0 ? r.comments : 0);
}

export function computeSparkline(slug: Slug, n = 8): SparklineTrend | null {
  const videos = getVideos(slug)
    .filter((v) => v.audited_date)
    .sort((a, b) => (a.audited_date || "").localeCompare(b.audited_date || ""));
  const points: number[] = [];
  for (const v of videos) {
    const p = engagementProxy(v);
    if (p !== null) points.push(p);
  }
  const last = points.slice(-n);
  if (last.length === 0) return null;
  if (last.length === 1) {
    return { points: last, arrow: "flat", label: "flat", deltaPct: 0, n: 1 };
  }
  const half = Math.max(Math.floor(last.length / 2), 1);
  const firstHalf = last.slice(0, half);
  const secondHalf = last.slice(-half);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const delta = avgSecond - avgFirst;
  const floor = Math.max(avgFirst, 1);
  const deltaPct = Math.round((delta / floor) * 100);
  if (Math.abs(deltaPct) < 10) {
    return { points: last, arrow: "flat", label: "flat", deltaPct, n: last.length };
  }
  if (delta > 0) {
    return { points: last, arrow: "up", label: "trending", deltaPct, n: last.length };
  }
  return { points: last, arrow: "down", label: "dropping", deltaPct, n: last.length };
}

export function engagementGrowthFactor(
  slug: Slug,
  today = new Date(),
): { earned: number; max: 10; explain: string } {
  const todayMs = today.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const last30Cutoff = new Date(todayMs - 30 * dayMs).toISOString().slice(0, 10);
  const prior30Cutoff = new Date(todayMs - 60 * dayMs).toISOString().slice(0, 10);
  const videos = getVideos(slug);
  const last30 = videos.filter((v) => v.audited_date && v.audited_date >= last30Cutoff);
  const prior30 = videos.filter(
    (v) => v.audited_date && v.audited_date >= prior30Cutoff && v.audited_date < last30Cutoff,
  );
  const sum = (arr: VideosJsonlRow[]) =>
    arr.reduce((s, v) => s + (engagementProxy(v) ?? 0), 0);
  const lastSum = sum(last30);
  const priorSum = sum(prior30);
  if (prior30.length === 0) {
    return { earned: 0, max: 10, explain: "no prior-30d baseline" };
  }
  if (lastSum > priorSum) {
    return {
      earned: 10,
      max: 10,
      explain: `last-30d ${lastSum.toLocaleString()} > prior-30d ${priorSum.toLocaleString()}`,
    };
  }
  return {
    earned: 0,
    max: 10,
    explain: `last-30d ${lastSum.toLocaleString()} ≤ prior-30d ${priorSum.toLocaleString()}`,
  };
}
