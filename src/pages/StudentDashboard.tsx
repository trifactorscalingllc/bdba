// ─── /dashboard/student/:slug — per-student drill-down ─────────────────────
// Coach-facing detail view: opens when you click a student card on the
// main /dashboard. Shows everything for that one student — Health Bar with
// full factor breakdown + sparkline, 5-2 weekly strip with last-4-weeks
// history, recent audited posts table, shop numbers, coaching items,
// and the monthly recap card.
//
// D-061 (2026-05-23): No auth. Public via /dashboard/student/:slug URL.

import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import PostRow from "@/components/dashboard/PostRow";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CoachingPatterns from "@/components/dashboard/CoachingPatterns";
import {
  fetchCisFromSupabase,
  getBusinessLog,
  getProfile,
  getStudents,
  getVideos,
} from "@/lib/cis-bridge";
import { computeHealthBar } from "@/lib/scoring/health-bar";
import { computeCurrentWeek, computeFiveTwoWeeks, computeStreak } from "@/lib/scoring/five-two";
import { computeMonthlyRecap } from "@/lib/scoring/recap";
import type { HealthBarScore } from "@/lib/types";

// ─── tiny helpers ──────────────────────────────────────────────────────────

function statusBadge(status: HealthBarScore["status"]): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    price_raise_ready: { cls: "bg-green-500/15 text-green-400 border-green-500/30", label: "✓ Price raise ready" },
    almost_there:      { cls: "bg-green-500/15 text-green-400 border-green-500/30", label: "◐ Almost there" },
    building:          { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", label: "◐ Building" },
    not_ready:         { cls: "bg-red-500/15 text-red-400 border-red-500/30", label: "✕ Not ready" },
  };
  return map[status] ?? { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", label: status };
}

function barColor(total: number): string {
  if (total >= 90) return "from-green-600 to-green-500";
  if (total >= 71) return "from-orange-600 to-orange-500";
  if (total >= 41) return "from-yellow-700 to-yellow-500";
  return "from-red-800 to-red-500";
}

function factorClass(earned: number, max: number): string {
  if (max === 0) return "text-yellow-400";
  const pct = earned / max;
  if (pct >= 0.9) return "text-green-400";
  if (pct >= 0.5) return "text-yellow-400";
  return "text-red-400";
}


// ─── page ──────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { slug } = useParams<{ slug: string }>();

  const cisQuery = useQuery({
    queryKey: ["cis"],
    queryFn: fetchCisFromSupabase,
    staleTime: 60_000,
  });

  if (cisQuery.isLoading) {
    return (
      <>
        <AppNavbar variant="dashboard" />
        <div className="min-h-screen flex items-center justify-center pt-32">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Loading student…</div>
        </div>
      </>
    );
  }
  if (cisQuery.error) {
    return (
      <>
        <AppNavbar variant="dashboard" />
        <div className="min-h-screen flex items-center justify-center pt-32 px-4">
          <div className="max-w-md glass-card rounded-3xl p-8 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red mb-3">Couldn't load student data</div>
            <div className="text-sm text-white/70">{String(cisQuery.error)}</div>
          </div>
        </div>
      </>
    );
  }

  // Unknown slug → bounce back to coach view (instead of 404'ing)
  if (!slug || !getStudents().includes(slug)) {
    return <Navigate to="/dashboard" replace />;
  }

  const today = new Date();
  const profile = getProfile(slug);
  const videos = getVideos(slug);
  const healthBar = computeHealthBar(slug, today);
  const currentWeek = computeCurrentWeek(slug, today);
  const allWeeks = computeFiveTwoWeeks(slug);
  const last4Weeks = allWeeks.slice(-4);
  const streak = computeStreak(slug);
  const businessLog = getBusinessLog(slug);
  const last30dCutoff = new Date(today.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const recentBiz = businessLog.filter((e) => e.date >= last30dCutoff);
  const monthlyBiz = {
    new_clients: recentBiz.reduce((s, e) => s + (e.new_clients ?? 0), 0),
    returning:   recentBiz.reduce((s, e) => s + (e.returning ?? 0), 0),
    cuts:        recentBiz.reduce((s, e) => s + (e.cuts ?? 0), 0),
    no_shows:    recentBiz.reduce((s, e) => s + (e.no_shows ?? 0), 0),
    revenue:     recentBiz.reduce((s, e) => s + (e.revenue ?? 0), 0),
  };
  const noShowRatePct = monthlyBiz.cuts + monthlyBiz.no_shows > 0
    ? (monthlyBiz.no_shows / (monthlyBiz.cuts + monthlyBiz.no_shows)) * 100
    : 0;

  // ALL audited posts, newest first. PostRow handles expand/collapse per row.
  const allAuditedContent = [...videos]
    .filter((v) => v.audited_date)
    .sort((a, b) => (b.audited_date || "").localeCompare(a.audited_date || ""));

  const recap = computeMonthlyRecap(slug, today);
  const badge = statusBadge(healthBar.status);
  const f = healthBar.factors;

  return (
    <>
      <Helmet>
        <title>{profile.display_name} · PB Assistant</title>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
      </Helmet>

      <AppNavbar variant="dashboard" />

      <main className="max-w-[1200px] mx-auto pt-36 pb-20 px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between pb-7 border-b border-white/10 mb-10"
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-2">Student detail</div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight leading-none">
              <span className="text-red-shimmer">{profile.display_name}</span>
            </h1>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 flex flex-wrap gap-x-3 gap-y-1">
              <span>{videos.length} audits</span>
              {profile.ig_handle && <span>· @{profile.ig_handle}</span>}
              {profile.shop_name && <span>· {profile.shop_name}</span>}
              {profile.location && <span>· {profile.location}</span>}
            </div>
          </div>
          <Link
            to="/dashboard"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white border border-white/10 hover:border-brand-red rounded-full px-4 py-2 transition-all whitespace-nowrap"
          >
            ← Coach view
          </Link>
        </motion.header>

        {/* ── Health Bar (big) ───────────────────────────────────────── */}
        <SectionLabel num="Score" title="Playbook Health Bar" />
        <article className="glass-card rounded-2xl p-7 mb-12">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Score (out of 100)</div>
              <div className="text-xs text-white/40">How close to raising prices</div>
            </div>
            <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-6xl md:text-7xl font-black italic tracking-tight leading-none">{healthBar.total}</span>
            <span className="text-lg text-white/40">/ 100</span>
          </div>

          <div className="h-3.5 bg-black/60 border border-white/10 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barColor(healthBar.total)} transition-[width] duration-500`}
              style={{ width: `${healthBar.total}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-white/40 mb-5">
            <span>0</span>
            <span>41 · BUILDING</span>
            <span>71 · ALMOST</span>
            <span>90 · READY</span>
            <span>100</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Factor label="5-2 Compliance" earned={f.fiveTwoCompliance.earned} max={f.fiveTwoCompliance.max} explain={f.fiveTwoCompliance.explain} />
            <Factor label="Strong-Tier %" earned={f.strongTierShare.earned} max={f.strongTierShare.max} explain={f.strongTierShare.explain} />
            <Factor label="New Clients" earned={f.newClients.earned} max={f.newClients.max} explain={f.newClients.explain} />
            <Factor label="No-Show Rate" earned={f.noShowRate.earned} max={f.noShowRate.max} explain={f.noShowRate.explain} />
            <Factor label="Anti-Patterns" earned={f.zeroAntiPattern.earned} max={f.zeroAntiPattern.max} explain={f.zeroAntiPattern.explain} />
            <Factor label="Engagement ↑" earned={f.engagementGrowth.earned} max={f.engagementGrowth.max} explain={f.engagementGrowth.explain} />
          </div>

          {/* 30-day mini trend — Brad's ask: a quick "how am I trending right
              now" preview inside the Health Bar card. The full multi-range
              chart lives below in its own section. */}
          <div className="pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                Last 30 days · engagement per post
              </div>
              <div className="font-mono text-[10px] text-white/40">log scale</div>
            </div>
            <PerformanceChart videos={videos} initialRange={30} compact />
          </div>
        </article>

        {/* ── 5-2 Compliance ─────────────────────────────────────────── */}
        <SectionLabel num="Posting" title="5-and-2 Posting Plan" />
        <article className="glass-card rounded-2xl p-7 mb-12">
          {currentWeek ? (
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-mono text-2xl">
                  <span className="text-green-400 font-bold">{currentWeek.converting}</span>
                  <span className="text-white/40"> booking</span>
                  <span className="text-white/40 mx-2">/</span>
                  <span className="text-orange-400 font-bold">{currentWeek.viral}</span>
                  <span className="text-white/40"> reach</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                  Goal: 5 booking + 2 reach per week
                </div>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${
                currentWeek.status === "on_track"  ? "bg-green-500/15 text-green-400 border-green-500/30"
                : currentWeek.status === "partial" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}>
                {currentWeek.status === "on_track" ? "ON TRACK" : currentWeek.status === "partial" ? "PARTIAL" : "OFF TRACK"}
              </span>
            </div>
          ) : (
            <div className="text-sm text-white/60 mb-5">No posts logged this week yet.</div>
          )}

          {streak > 0 && (
            <div className="pt-4 mb-4 border-t border-white/10 text-sm">
              🔥 <b>{streak}-week streak</b> hitting the 5-and-2 plan
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 mb-2">Last 4 weeks</div>
            {last4Weeks.length === 0 ? (
              <div className="text-sm text-white/60">No prior weeks with posts.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {last4Weeks.map((w) => {
                  const c =
                    w.status === "on_track"  ? "border-green-500/30 text-green-400"
                    : w.status === "partial" ? "border-yellow-500/30 text-yellow-400"
                    : "border-red-500/30 text-red-400";
                  return (
                    <div key={w.weekStart} className={`bg-black/40 border ${c} rounded-lg px-3 py-2.5`}>
                      <div className="font-mono text-[10px] text-white/40">{w.weekStart}</div>
                      <div className="font-mono text-sm font-semibold mt-0.5">
                        {w.converting}B / {w.viral}R
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>

        {/* ── Performance bar chart (30/60/90 toggle) ────────────────── */}
        <SectionLabel num="Trend" title="Posting & Engagement" />
        <article className="glass-card rounded-2xl p-7 mb-12">
          <PerformanceChart videos={videos} />
        </article>

        {/* ── All audited posts (click any row to expand) ────────────── */}
        <SectionLabel num="Content" title={`All Audited Posts (${allAuditedContent.length})`} />
        <article className="glass-card rounded-2xl overflow-hidden mb-12">
          {allAuditedContent.length === 0 ? (
            <div className="p-7 text-sm text-white/40 italic">No audited posts yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-[24px_1fr_1.5fr_1fr_1.5fr_1fr] gap-3 px-4 py-3 bg-black/40 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border-b border-white/10">
                <span />
                <span>Posted</span>
                <span>Hook</span>
                <span>How it did</span>
                <span>Likes / Comments</span>
                <span>Flags</span>
              </div>
              <div>
                {allAuditedContent.map((v) => (
                  <PostRow key={v.video_id} slug={slug} video={v} />
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/10 font-mono text-[11px] text-white/40">
                Click any row to expand the full plain-English audit. Showing all{" "}
                {allAuditedContent.length} reviewed posts.
              </div>
            </>
          )}
        </article>

        {/* ── Shop numbers ──────────────────────────────────────────── */}
        <SectionLabel num="Business" title="Shop Numbers — Last 30 Days" />
        <article className="glass-card rounded-2xl p-7 mb-12">
          {recentBiz.length === 0 ? (
            <div className="text-sm text-white/40 italic">No business-log entries in the last 30 days.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat label="New clients" val={monthlyBiz.new_clients} cls="text-green-400" />
              <Stat label="Returning" val={monthlyBiz.returning} cls="text-white" />
              <Stat label="Total cuts" val={monthlyBiz.cuts} cls="text-white" />
              <Stat
                label="No-shows"
                val={
                  <>
                    {monthlyBiz.no_shows}
                    <span className="font-mono text-[11px] text-white/40 ml-1">({noShowRatePct.toFixed(1)}%)</span>
                  </>
                }
                cls={noShowRatePct < 15 ? "text-green-400" : "text-red-400"}
              />
              <Stat
                label="Revenue"
                val={monthlyBiz.revenue > 0 ? `$${monthlyBiz.revenue.toLocaleString()}` : "—"}
                cls="text-white"
              />
            </div>
          )}
        </article>

        {/* ── Coaching synthesis — what's working vs what keeps hurting ── */}
        <SectionLabel num="Coaching" title="What's Working vs What's Not" />
        <div className="mb-12">
          <CoachingPatterns slug={slug} videos={videos} />
        </div>

        {/* ── Monthly Recap ─────────────────────────────────────────── */}
        <SectionLabel num="Recap" title={`${recap.month.name} Recap`} />
        <article className="glass-card rounded-2xl overflow-hidden">
          <header className="bg-gradient-to-br from-red-950/50 to-red-950/20 border-b border-white/10 px-7 py-6 flex justify-between items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-red mb-1.5">
                {recap.month.name}
              </div>
              <div className="text-3xl font-black italic uppercase tracking-tight">{profile.display_name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Overall</div>
              <div className={`text-xl font-black italic uppercase tracking-tight ${
                recap.verdict === "Strong" ? "text-green-400"
                : recap.verdict === "Steady" ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {recap.verdict} month
              </div>
            </div>
          </header>
          <div className="p-7">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-5 py-4 mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400 mb-2.5">Coach's note</div>
              <div className="text-[13px] leading-relaxed">{recap.coachNote}</div>
            </div>
            {recap.actionItems.length > 0 && (
              <div className="bg-black/40 border border-red-500/20 border-l-[3px] border-l-brand-red rounded-r-xl px-5 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red mb-3">Next month priorities</div>
                {recap.actionItems.map((item, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-white/10 last:border-b-0 text-[13px]">
                    <span className="font-mono text-[11px] text-brand-red min-w-[24px]">{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>
    </>
  );
}

// ─── small layout sub-components ───────────────────────────────────────────

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-2">{num}</div>
      <h2 className="text-2xl font-black italic uppercase tracking-tight mb-6 border-l-[3px] border-brand-red pl-3.5">
        {title}
      </h2>
    </>
  );
}

function Factor({ label, earned, max, explain }: { label: string; earned: number; max: number; explain: string }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5" title={explain}>
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/60 mb-1">{label}</div>
      <div className={`text-lg font-black italic ${factorClass(earned, max)}`}>{earned} / {max}</div>
    </div>
  );
}

function Stat({ label, val, cls }: { label: string; val: React.ReactNode; cls?: string }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1">{label}</div>
      <div className={`text-2xl font-black italic tracking-tight ${cls ?? ""}`}>{val}</div>
    </div>
  );
}
