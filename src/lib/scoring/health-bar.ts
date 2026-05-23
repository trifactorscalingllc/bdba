// ─── Playbook Health Bar — composite scoring (PRD F2) ──────────────────────
// Ported verbatim from dack-ai-app/lib/scoring/health-bar.ts.

import {
  getAntiPatternFlagsRaw,
  getBusinessLog,
  getVideos,
} from "@/lib/cis-bridge";
import type { HealthBarScore, Slug } from "@/lib/types";
import { fiveTwoFactorForHealthBar } from "./five-two";
import { engagementGrowthFactor } from "./sparkline";

const STRONG_PCT_THRESHOLD = 50;
const NO_SHOW_RATE_THRESHOLD = 0.15;
const DEFAULT_NEW_CLIENTS_MONTHLY_TARGET = 8;

function strongShareFactor(slug: Slug, today: Date): { earned: number; max: 20; explain: string } {
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = getVideos(slug).filter((v) => v.audited_date && v.audited_date >= cutoff);
  if (recent.length === 0) return { earned: 0, max: 20, explain: "no audits in last 30d" };
  const strong = recent.filter((v) => v.verdict_tier === "strong").length;
  const pct = (strong / recent.length) * 100;
  const earned = pct >= STRONG_PCT_THRESHOLD ? 20 : Math.round((pct / 100) * 20);
  return {
    earned,
    max: 20,
    explain: `${strong}/${recent.length} = ${Math.round(pct)}% Strong (≥${STRONG_PCT_THRESHOLD}% threshold)`,
  };
}

function newClientsFactor(
  slug: Slug,
  today: Date,
  monthlyTarget = DEFAULT_NEW_CLIENTS_MONTHLY_TARGET,
): { earned: number; max: 20; explain: string } {
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = getBusinessLog(slug).filter((e) => e.date >= cutoff);
  if (recent.length === 0) return { earned: 0, max: 20, explain: "no business-log entries (yet)" };
  const total = recent.reduce((s, e) => s + (e.new_clients ?? 0), 0);
  const earned = total >= monthlyTarget ? 20 : Math.max(0, Math.round((total / monthlyTarget) * 20));
  return {
    earned,
    max: 20,
    explain: `${total} new clients / ${monthlyTarget} target (last 30d, ${recent.length} log days)`,
  };
}

function noShowRateFactor(slug: Slug, today: Date): { earned: number; max: 15; explain: string } {
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = getBusinessLog(slug).filter((e) => e.date >= cutoff);
  if (recent.length === 0) return { earned: 0, max: 15, explain: "no business-log entries (yet)" };
  const cuts = recent.reduce((s, e) => s + (e.cuts ?? 0), 0);
  const noShows = recent.reduce((s, e) => s + (e.no_shows ?? 0), 0);
  const denom = cuts + noShows;
  if (denom === 0) return { earned: 0, max: 15, explain: "no cuts or no-shows logged (last 30d)" };
  const rate = noShows / denom;
  const earned = rate < NO_SHOW_RATE_THRESHOLD ? 15 : 0;
  return {
    earned,
    max: 15,
    explain: `${noShows}/${denom} = ${(rate * 100).toFixed(1)}% no-show (<${NO_SHOW_RATE_THRESHOLD * 100}% threshold)`,
  };
}

function zeroAntiPatternFactor(slug: Slug, today: Date): { earned: number; max: 10; explain: string } {
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = getVideos(slug).filter(
    (v) => v.audited_date && v.audited_date >= cutoff && v.video_id,
  );
  if (recent.length === 0) return { earned: 0, max: 10, explain: "no audits in last 30d" };
  type Stat = { vid: string; flags: string[] | null };
  const stats: Stat[] = recent.map((v) => ({
    vid: v.video_id,
    flags: getAntiPatternFlagsRaw(slug, v.video_id),
  }));
  const covered = stats.filter((s) => s.flags !== null);
  if (covered.length < Math.max(1, Math.ceil(recent.length * 0.5))) {
    return {
      earned: 0,
      max: 10,
      explain: `coverage too low: only ${covered.length}/${recent.length} videos have v4 anti_pattern_flags`,
    };
  }
  const flagged = covered.filter((s) => (s.flags as string[]).length > 0);
  if (flagged.length === 0) {
    return { earned: 10, max: 10, explain: `0 flags across ${covered.length} v4-audited videos` };
  }
  return {
    earned: 0,
    max: 10,
    explain: `${flagged.length}/${covered.length} v4-audited videos have anti-pattern flags`,
  };
}

function classifyStatus(total: number): HealthBarScore["status"] {
  if (total >= 90) return "price_raise_ready";
  if (total >= 71) return "almost_there";
  if (total >= 41) return "building";
  return "not_ready";
}

export function computeHealthBar(slug: Slug, today = new Date()): HealthBarScore {
  const fiveTwo = fiveTwoFactorForHealthBar(slug, today);
  const strongShare = strongShareFactor(slug, today);
  const newClients = newClientsFactor(slug, today);
  const noShow = noShowRateFactor(slug, today);
  const zeroAP = zeroAntiPatternFactor(slug, today);
  const growth = engagementGrowthFactor(slug, today);

  const total =
    fiveTwo.earned + strongShare.earned + newClients.earned +
    noShow.earned + zeroAP.earned + growth.earned;

  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const auditedInWindow = getVideos(slug).filter(
    (v) => v.audited_date && v.audited_date >= cutoff,
  ).length;
  const businessLogDays = getBusinessLog(slug).filter((e) => e.date >= cutoff).length;

  return {
    total,
    status: classifyStatus(total),
    factors: {
      fiveTwoCompliance: {
        earned: fiveTwo.earned,
        max: 25,
        explain: `${fiveTwo.weeksCompliant}/${fiveTwo.weeksInWindow} weeks fully compliant (5C+2V)`,
      },
      strongTierShare: strongShare,
      newClients,
      noShowRate: noShow,
      zeroAntiPattern: zeroAP,
      engagementGrowth: growth,
    },
    coverage: {
      audited_in_window: auditedInWindow,
      business_log_days: businessLogDays,
    },
  };
}
