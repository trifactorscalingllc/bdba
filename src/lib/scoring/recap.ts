// ─── Monthly Performance Recap (PRD F6) ─────────────────────────────────────
// Ported verbatim from dack-ai-app/lib/scoring/recap.ts.

import {
  getAntiPatternFlagsRaw,
  getBusinessLog,
  getCoachingPrescription,
  getProfile,
  getVideos,
} from "@/lib/cis-bridge";
import type { Slug, VideosJsonlRow } from "@/lib/types";
import { computeHealthBar } from "./health-bar";
import { computeFiveTwoWeeks } from "./five-two";

export interface MonthlyRecap {
  student: { slug: Slug; display_name: string };
  month: { name: string; start: string; end: string };
  prior_month: { name: string; start: string; end: string };
  verdict: "Strong" | "Steady" | "Needs Work";
  contentPerformance: {
    posts_this: number;
    posts_last: number;
    strong: number;
    mid: number;
    weak: number;
    strong_pct: number;
    strong_pct_prior: number;
    strong_pct_delta: number;
    top_format: string;
    top_format_count: number;
    flagged_videos: number;
  };
  fiveTwoCompliance: {
    compliant_weeks_this: number;
    compliant_weeks_last: number;
    total_weeks_this: number;
  };
  businessMetrics: {
    new_clients_this: number;
    new_clients_last: number;
    no_show_rate_this: number;
    no_show_rate_last: number;
    cuts_this: number;
    cuts_last: number;
    revenue_this: number;
    revenue_last: number;
    log_days_this: number;
  };
  healthBar: {
    score_this: number;
    status_this: string;
    factors_summary: { name: string; earned: number; max: number }[];
  };
  coachNote: string;
  actionItems: string[];
}

function monthRange(d: Date): { start: string; end: string; name: string } {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0));
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    name: `${monthNames[m]} ${y}`,
  };
}
function priorMonthOf(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
}
function inRange(date: string | undefined, start: string, end: string): boolean {
  return !!date && date >= start && date <= end;
}
function topFormat(rows: VideosJsonlRow[]): { name: string; count: number } {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.hook_type ?? "?"} / ${r.structure_arc ?? "?"}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best = { name: "—", count: 0 };
  for (const [k, v] of counts) if (v > best.count) best = { name: k, count: v };
  return best;
}
function fiveTwoCompliantInMonth(slug: Slug, monthStart: string, monthEnd: string): number {
  return computeFiveTwoWeeks(slug).filter(
    (w) => w.weekStart >= monthStart && w.weekStart <= monthEnd && w.status === "on_track",
  ).length;
}

export function computeMonthlyRecap(
  slug: Slug,
  today = new Date(),
  monthOffset = 0,
): MonthlyRecap {
  const profile = getProfile(slug);
  const videos = getVideos(slug);
  const businessLog = getBusinessLog(slug);

  const targetDate = new Date(today);
  targetDate.setUTCMonth(targetDate.getUTCMonth() + monthOffset);
  const month = monthRange(targetDate);
  const priorMonth = monthRange(priorMonthOf(targetDate));

  const thisMonthVideos = videos.filter((v) => inRange(v.audited_date, month.start, month.end));
  const lastMonthVideos = videos.filter((v) => inRange(v.audited_date, priorMonth.start, priorMonth.end));
  const strong = thisMonthVideos.filter((v) => v.verdict_tier === "strong").length;
  const mid = thisMonthVideos.filter((v) => v.verdict_tier === "mid").length;
  const weak = thisMonthVideos.filter((v) => v.verdict_tier === "weak").length;
  const strongPct = thisMonthVideos.length > 0 ? (strong / thisMonthVideos.length) * 100 : 0;
  const lastStrong = lastMonthVideos.filter((v) => v.verdict_tier === "strong").length;
  const strongPctPrior = lastMonthVideos.length > 0 ? (lastStrong / lastMonthVideos.length) * 100 : 0;
  const tf = topFormat(thisMonthVideos);
  const flaggedVideos = thisMonthVideos.filter((v) => {
    if (!v.video_id) return false;
    const flags = getAntiPatternFlagsRaw(slug, v.video_id);
    return flags !== null && flags.length > 0;
  }).length;

  const compliantThis = fiveTwoCompliantInMonth(slug, month.start, month.end);
  const compliantLast = fiveTwoCompliantInMonth(slug, priorMonth.start, priorMonth.end);
  const totalWeeksThis = computeFiveTwoWeeks(slug).filter(
    (w) => w.weekStart >= month.start && w.weekStart <= month.end,
  ).length;

  const sumBiz = (start: string, end: string) => {
    const rows = businessLog.filter((e) => e.date >= start && e.date <= end);
    return {
      new_clients: rows.reduce((s, e) => s + (e.new_clients ?? 0), 0),
      cuts: rows.reduce((s, e) => s + (e.cuts ?? 0), 0),
      no_shows: rows.reduce((s, e) => s + (e.no_shows ?? 0), 0),
      revenue: rows.reduce((s, e) => s + (e.revenue ?? 0), 0),
      log_days: rows.length,
    };
  };
  const bizThis = sumBiz(month.start, month.end);
  const bizLast = sumBiz(priorMonth.start, priorMonth.end);
  const noShowRate = (b: typeof bizThis) =>
    b.cuts + b.no_shows > 0 ? (b.no_shows / (b.cuts + b.no_shows)) * 100 : 0;

  const healthBar = computeHealthBar(slug, today);
  const factorsSummary = [
    { name: "5-2 Compliance", earned: healthBar.factors.fiveTwoCompliance.earned, max: 25 as const },
    { name: "Strong-Tier %",  earned: healthBar.factors.strongTierShare.earned,   max: 20 as const },
    { name: "New Clients",    earned: healthBar.factors.newClients.earned,        max: 20 as const },
    { name: "No-Show Rate",   earned: healthBar.factors.noShowRate.earned,        max: 15 as const },
    { name: "Zero Anti-Pattern", earned: healthBar.factors.zeroAntiPattern.earned, max: 10 as const },
    { name: "Engagement Growth", earned: healthBar.factors.engagementGrowth.earned, max: 10 as const },
  ];

  let verdict: MonthlyRecap["verdict"];
  if (healthBar.total >= 71 && strongPct >= 50 && compliantThis >= 2) verdict = "Strong";
  else if (healthBar.total >= 41 || strongPct >= 40) verdict = "Steady";
  else verdict = "Needs Work";

  const noteParts: string[] = [];
  if (strongPct >= 50) {
    noteParts.push(`Strong month for your posts — ${strong} of ${thisMonthVideos.length} (${Math.round(strongPct)}%) worked.`);
  } else if (thisMonthVideos.length > 0) {
    noteParts.push(`${strong} of ${thisMonthVideos.length} posts (${Math.round(strongPct)}%) worked — below the 50% goal.`);
  } else {
    noteParts.push("No posts reviewed this month — first thing: post + send them in to get reviewed.");
  }
  if (compliantThis >= 3) {
    noteParts.push(`You hit the 5-and-2 plan ${compliantThis} weeks this month — solid.`);
  } else if (totalWeeksThis > 0) {
    noteParts.push(`You only hit the 5-and-2 plan ${compliantThis} of ${totalWeeksThis} weeks — needs work.`);
  }
  if (bizThis.new_clients > bizLast.new_clients && bizLast.new_clients > 0) {
    noteParts.push(`New clients up: ${bizThis.new_clients} vs ${bizLast.new_clients} last month.`);
  } else if (bizThis.new_clients > 0) {
    noteParts.push(`${bizThis.new_clients} new clients booked this month.`);
  }
  if (noShowRate(bizThis) >= 15) {
    noteParts.push(`No-shows at ${noShowRate(bizThis).toFixed(1)}% — over 15%, send confirmation DMs the day before.`);
  }
  if (flaggedVideos > 0) {
    noteParts.push(`${flaggedVideos} of ${thisMonthVideos.length} posts had coaching flags — review those in the My Content table.`);
  }
  const coachNote = noteParts.join(" ");

  const actionItems: string[] = [];
  const sortedFactors = [...factorsSummary].sort((a, b) => a.earned / a.max - b.earned / b.max);
  const weakestFactor = sortedFactors[0];
  if (weakestFactor && weakestFactor.earned / weakestFactor.max < 0.5) {
    const factorAction: Record<string, string> = {
      "5-2 Compliance":      "Post 5 booking-type videos + 2 reach-type videos each week. Hit that for 4 weeks straight to earn the full 25 points.",
      "Strong-Tier %":       "Get more than half your recent posts rated 'WORKED' — focus your next 4-5 posts on the formats Dack has already approved for you.",
      "New Clients":         "Bring in at least 8 new bookings this month — make the booking call-to-action stronger and add 'link in bio' to every post.",
      "No-Show Rate":        "Get no-shows under 15% — send a confirmation DM 24 hours before every booking.",
      "Zero Anti-Pattern":   "Fix the things-to-fix flags showing up on your last 5 posts (look at your recent posts list).",
      "Engagement Growth":   "Get more likes + comments in the next 30 days than the last 30 days — your trend line on the dashboard shows where you stand.",
    };
    if (factorAction[weakestFactor.name]) actionItems.push(factorAction[weakestFactor.name]);
  }
  const mostRecent = thisMonthVideos
    .sort((a, b) => (b.audited_date || "").localeCompare(a.audited_date || ""))[0] ||
    videos[videos.length - 1];
  if (mostRecent?.video_id) {
    const presc = getCoachingPrescription(slug, mostRecent.video_id);
    if (presc) {
      const firstSentence = presc.split(/(?<=[.!?])\s+/)[0].slice(0, 200);
      actionItems.push(firstSentence);
    }
  }
  if (totalWeeksThis === 0 || thisMonthVideos.length < 7) {
    actionItems.push(`Post more — aim for 7 posts a week (5 booking + 2 reach) to make the 5-and-2 plan work. This month you posted ${thisMonthVideos.length}.`);
  }

  const seen = new Set<string>();
  const dedup: string[] = [];
  for (const a of actionItems) {
    if (!seen.has(a)) { seen.add(a); dedup.push(a); }
    if (dedup.length >= 3) break;
  }

  return {
    student: { slug, display_name: profile.display_name },
    month,
    prior_month: priorMonth,
    verdict,
    contentPerformance: {
      posts_this: thisMonthVideos.length,
      posts_last: lastMonthVideos.length,
      strong, mid, weak,
      strong_pct: Math.round(strongPct),
      strong_pct_prior: Math.round(strongPctPrior),
      strong_pct_delta: Math.round(strongPct - strongPctPrior),
      top_format: tf.name,
      top_format_count: tf.count,
      flagged_videos: flaggedVideos,
    },
    fiveTwoCompliance: {
      compliant_weeks_this: compliantThis,
      compliant_weeks_last: compliantLast,
      total_weeks_this: totalWeeksThis,
    },
    businessMetrics: {
      new_clients_this: bizThis.new_clients,
      new_clients_last: bizLast.new_clients,
      no_show_rate_this: Math.round(noShowRate(bizThis) * 10) / 10,
      no_show_rate_last: Math.round(noShowRate(bizLast) * 10) / 10,
      cuts_this: bizThis.cuts,
      cuts_last: bizLast.cuts,
      revenue_this: bizThis.revenue,
      revenue_last: bizLast.revenue,
      log_days_this: bizThis.log_days,
    },
    healthBar: {
      score_this: healthBar.total,
      status_this: healthBar.status,
      factors_summary: factorsSummary,
    },
    coachNote,
    actionItems: dedup,
  };
}

export function formatRecapForMessage(r: MonthlyRecap): string {
  const lines: string[] = [];
  lines.push(`📊 ${r.student.display_name} — ${r.month.name} Recap`);
  lines.push(`Verdict: ${r.verdict}`);
  lines.push("");
  lines.push("YOUR POSTS");
  lines.push(`  ${r.contentPerformance.posts_this} posts (vs ${r.contentPerformance.posts_last} last month)`);
  lines.push(`  Worked / OK / Didn't: ${r.contentPerformance.strong} / ${r.contentPerformance.mid} / ${r.contentPerformance.weak}`);
  if (r.contentPerformance.posts_this > 0) {
    const deltaPct = r.contentPerformance.strong_pct_delta;
    lines.push(`  % that worked: ${r.contentPerformance.strong_pct}% ${deltaPct > 0 ? `↑ +${deltaPct}` : deltaPct < 0 ? `↓ ${deltaPct}` : "→ same"} points vs last month`);
    lines.push(`  Most-used format: ${r.contentPerformance.top_format}`);
    if (r.contentPerformance.flagged_videos > 0) {
      lines.push(`  ⚠ ${r.contentPerformance.flagged_videos} posts have things to fix`);
    }
  }
  lines.push("");
  lines.push("5-AND-2 POSTING PLAN");
  lines.push(`  You hit the plan ${r.fiveTwoCompliance.compliant_weeks_this} of ${r.fiveTwoCompliance.total_weeks_this} weeks (last month: ${r.fiveTwoCompliance.compliant_weeks_last})`);
  lines.push("");
  lines.push("YOUR SHOP NUMBERS");
  lines.push(`  New clients: ${r.businessMetrics.new_clients_this} (vs ${r.businessMetrics.new_clients_last})`);
  lines.push(`  Total cuts: ${r.businessMetrics.cuts_this} (vs ${r.businessMetrics.cuts_last})`);
  if (r.businessMetrics.cuts_this > 0 || r.businessMetrics.no_show_rate_this > 0) {
    lines.push(`  No-shows: ${r.businessMetrics.no_show_rate_this}% (vs ${r.businessMetrics.no_show_rate_last}%)`);
  }
  if (r.businessMetrics.revenue_this > 0) {
    lines.push(`  Money made: $${r.businessMetrics.revenue_this.toLocaleString()}`);
  }
  lines.push("");
  lines.push(`YOUR SCORE: ${r.healthBar.score_this}/100 (${r.healthBar.status_this.replace(/_/g, " ").toUpperCase()})`);
  lines.push("");
  lines.push("NOTE FROM YOUR COACH");
  lines.push(`  ${r.coachNote}`);
  lines.push("");
  lines.push("WHAT TO DO NEXT MONTH");
  r.actionItems.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  return lines.join("\n");
}
