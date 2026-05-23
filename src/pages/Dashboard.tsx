// ─── /dashboard — coach view (Phase 1) ───────────────────────────────────────
// Renders the 3 mockup-approved sections: Playbook Health Bar, 5-2 Split
// Compliance, Monthly Performance Recap. Reads from Supabase via TanStack
// Query, populates the cis-bridge in-memory cache, then runs the (sync)
// scoring engines for each student.
//
// Role gating: this file is the coach view. A future PR adds StudentDashboard
// for /student/[slug]/dashboard. For Phase 1 we render the coach view for
// anyone with role='coach'; students who land here see a placeholder until
// the student-view PR ships.

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import { fetchCisFromSupabase, getStudents, getProfile, getVideos, getPostType as getPostTypeFromAnswers } from "@/lib/cis-bridge";
import { computeHealthBar } from "@/lib/scoring/health-bar";
import { computeCurrentWeek, computeFiveTwoWeeks, computeStreak } from "@/lib/scoring/five-two";
import { computeMonthlyRecap } from "@/lib/scoring/recap";
import type { HealthBarScore } from "@/lib/types";

// D-061 (2026-05-23): Auth pulled out. This route is reachable by direct
// URL without sign-in. RLS public_read_*_TEMPORARY_D061 policies grant
// anon SELECT on the dashboard tables. Re-enable auth by restoring the
// useAuth() / profile gating below from git history.

// ─── helpers ───────────────────────────────────────────────────────────────

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

function formatWeekRange(weekStartIso: string): string {
  const start = new Date(weekStartIso + "T00:00:00Z");
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Week of ${months[start.getUTCMonth()]} ${start.getUTCDate()} – ${months[end.getUTCMonth()]} ${end.getUTCDate()}`;
}

// (currentWeekDayStrip was removed when the 5-2 section switched from the
// blank-7-slot "this week" strip to a 4-week compliance grid. Real evidence
// > blank boxes when there are no posts this week.)

function deltaCell(curr: number, prev: number, lowerIsBetter = false): { txt: string; cls: string } | null {
  if (curr === prev) return null;
  const up = curr > prev;
  const good = lowerIsBetter ? !up : up;
  const arrow = up ? "↑" : "↓";
  return { txt: `${arrow} from ${prev}`, cls: good ? "text-green-400" : "text-red-400" };
}

// ─── page ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const cisQuery = useQuery({
    queryKey: ["cis"],
    queryFn: fetchCisFromSupabase,
    staleTime: 60_000,
  });

  // Loading / error gates
  if (cisQuery.isLoading) {
    return (
      <>
        <AppNavbar variant="dashboard" />
        <div className="min-h-screen flex items-center justify-center pt-32">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Loading dashboard…
          </div>
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
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red mb-3">Couldn't load dashboard</div>
            <div className="text-sm text-white/70">{String(cisQuery.error)}</div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
              If this persists, contact the TFS Team.
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Coach view: render the 3 mockup sections ─────────────────────────────
  const today = new Date();
  const slugs = getStudents();
  const rows = slugs.map((slug) => {
    const p = getProfile(slug);
    const videos = getVideos(slug);
    const healthBar = computeHealthBar(slug, today);
    const currentWeek = computeCurrentWeek(slug, today);
    const streak = computeStreak(slug);
    // Last 4 weeks of 5-2 compliance, newest-first. Each week carries
    // converting/viral counts + status — real evidence vs an empty day-strip.
    const last4Weeks = computeFiveTwoWeeks(slug).slice(-4).reverse();
    const recap = computeMonthlyRecap(slug, today);
    return { slug, profile: p, videos, healthBar, currentWeek, streak, last4Weeks, recap };
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const currentMonthLabel = `${monthNames[today.getUTCMonth()]} ${today.getUTCFullYear()}`;

  const weekStartIso = (() => {
    const t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const day = t.getUTCDay();
    const diffToMonday = (day + 6) % 7;
    t.setUTCDate(t.getUTCDate() - diffToMonday);
    return t.toISOString().slice(0, 10);
  })();
  const weekRangeLabel = formatWeekRange(weekStartIso);

  const totalAudits = rows.reduce((s, r) => s + r.videos.length, 0);

  return (
    <>
      <Helmet>
        <title>Coach Dashboard · PB Assistant</title>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
      </Helmet>

      <AppNavbar variant="dashboard" />

      <main className="max-w-[1400px] mx-auto pt-36 pb-20 px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between pb-7 border-b border-white/10 mb-12"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight">
              Welcome back, <span className="text-red-shimmer">Dack</span>
            </h1>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">
              Coach view · {rows.length} students · {totalAudits} total audits
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse" />
            Live from CIS
          </div>
        </motion.header>

        {/* ── Section 1: Playbook Health Bar ─────────────────────────── */}
        <SectionLabel num="Feature 2" title="Playbook Health Bar" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {rows.map(({ slug, profile: p, videos, healthBar }) => {
            const badge = statusBadge(healthBar.status);
            const f = healthBar.factors;
            return (
              <article key={`hb-${slug}`} className="glass-card rounded-2xl p-7">
                <header className="flex justify-between items-start mb-5">
                  <div>
                    <div className="text-xl font-black italic uppercase tracking-tight">{p.display_name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                      {videos.length} audits · {currentMonthLabel}
                    </div>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${badge.cls}`}>
                    {badge.label}
                  </span>
                </header>

                <div className="h-3.5 bg-black/60 border border-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColor(healthBar.total)} transition-[width] duration-500`}
                    style={{ width: `${healthBar.total}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-white/60 mb-4">
                  <span>0%</span>
                  <span className="font-semibold text-white">{healthBar.total} / 100</span>
                  <span>100%</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Factor label="5-2 Compliance" earned={f.fiveTwoCompliance.earned} max={f.fiveTwoCompliance.max} />
                  <Factor label="Strong-Tier %" earned={f.strongTierShare.earned} max={f.strongTierShare.max} />
                  <Factor label="New Clients" earned={f.newClients.earned} max={f.newClients.max} />
                  <Factor label="No-Show Rate" earned={f.noShowRate.earned} max={f.noShowRate.max} />
                  <Factor label="Anti-Patterns" earned={f.zeroAntiPattern.earned} max={f.zeroAntiPattern.max} />
                  <Factor label="Engagement ↑" earned={f.engagementGrowth.earned} max={f.engagementGrowth.max} />
                </div>

                <div className="text-right">
                  <Link
                    to={`/dashboard/student/${slug}`}
                    className="inline-block font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 hover:text-white border border-white/10 hover:border-brand-red rounded-lg px-3 py-2 transition-all"
                  >
                    Open student dashboard →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <Divider />

        {/* ── Section 2: 5-2 Split Compliance ────────────────────────── */}
        <SectionLabel num="Feature 1" title="5-2 Split Compliance" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {rows.map(({ slug, profile: p, videos, currentWeek, streak, last4Weeks }) => {
            const cWeek = currentWeek?.converting ?? 0;
            const vWeek = currentWeek?.viral ?? 0;
            const compliantWeeks = last4Weeks.filter((w) => w.status === "on_track").length;
            return (
              <article key={`f5-${slug}`} className="glass-card rounded-2xl p-7">
                <header className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-black italic uppercase tracking-tight">{p.display_name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                      Last 4 weeks · {compliantWeeks}/{last4Weeks.length} hit the plan
                    </div>
                  </div>
                  {streak > 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded">
                      🔥 {streak}-week streak
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded">
                      ⚠ No streak
                    </span>
                  )}
                </header>

                {/* Last 4 weeks — newest first. Each cell shows day-of-week
                    breakdown for posts that hit ("B Mon · R Thu") + status.
                    Replaces the blank 7-day-this-week strip + the abstract
                    "1B · 0R" counts with concrete posting-cadence evidence. */}
                {last4Weeks.length === 0 ? (
                  <div className="text-[13px] text-white/40 italic mb-3">
                    No posting history yet — week-by-week compliance will appear
                    as posts are audited.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {last4Weeks.map((w) => {
                      const border =
                        w.status === "on_track"  ? "border-green-500/40"
                        : w.status === "partial" ? "border-yellow-500/40"
                        : "border-red-500/40";
                      const txt =
                        w.status === "on_track"  ? "text-green-400"
                        : w.status === "partial" ? "text-yellow-400"
                        : "text-red-400";
                      // Build day-of-week breakdown for this week
                      const wkStart = new Date(w.weekStart + "T00:00:00Z");
                      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                      const postsThisWeek = videos.filter((v) => {
                        if (!v.posted_date || !v.video_id) return false;
                        const d = new Date(v.posted_date + "T00:00:00Z").getTime();
                        const ws = wkStart.getTime();
                        const we = ws + 7 * 86_400_000;
                        return d >= ws && d < we;
                      });
                      const breakdown = postsThisWeek.map((v) => {
                        const d = new Date(v.posted_date! + "T00:00:00Z");
                        const dayIdx = (d.getUTCDay() + 6) % 7;
                        const pt = getPostTypeFromAnswers(slug, v.video_id);
                        const tag = pt === "viral" ? "R" : "B"; // default to B if untagged
                        return { day: dayNames[dayIdx], tag };
                      });
                      return (
                        <div key={w.weekStart} className={`bg-black/40 border ${border} rounded-lg px-3 py-2.5`}>
                          <div className="flex justify-between items-baseline">
                            <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                              Wk of {w.weekStart.slice(5)} · {w.converting}B · {w.viral}R
                            </div>
                            <div className={`font-mono text-[10px] uppercase tracking-[0.15em] ${txt}`}>
                              {w.status === "on_track" ? "ON TRACK" : w.status === "partial" ? "PARTIAL" : "OFF TRACK"}
                            </div>
                          </div>
                          {breakdown.length === 0 ? (
                            <div className="font-mono text-[11px] text-white/40 italic mt-1">
                              no posts this week
                            </div>
                          ) : (
                            <div className="font-mono text-[11px] text-white/80 mt-1 flex flex-wrap gap-x-2">
                              {breakdown.map((b, idx) => (
                                <span key={idx}>
                                  <span className={b.tag === "B" ? "text-red-400" : "text-green-400"}>{b.tag}</span>
                                  <span className="text-white/60"> {b.day}</span>
                                  {idx < breakdown.length - 1 && <span className="text-white/30"> ·</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 font-mono text-[11px] text-white/60 pt-3 border-t border-white/10">
                  <span>
                    This week ({weekRangeLabel.replace(/^Week of /, "")}):{" "}
                    <span className="text-white font-semibold">{cWeek}B · {vWeek}R</span>
                  </span>
                  {currentWeek === null && (
                    <span className="text-white/40">no posts yet this week</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <Divider />

        {/* ── Section 3: Monthly Performance Recap ───────────────────── */}
        <SectionLabel num="Feature 6" title="Monthly Performance Recap" />
        <div className="space-y-5">
          {rows.map(({ slug, profile: p, recap }) => {
            const cp = recap.contentPerformance;
            const bm = recap.businessMetrics;
            const ft = recap.fiveTwoCompliance;
            const hb = recap.healthBar;
            const verdictCls =
              recap.verdict === "Strong" ? "text-green-400"
              : recap.verdict === "Steady" ? "text-yellow-400"
              : "text-red-400";
            const postsDelta = deltaCell(cp.posts_this, cp.posts_last);
            const strongPctDelta = deltaCell(cp.strong_pct, cp.strong_pct_prior);
            const ncDelta = deltaCell(bm.new_clients_this, bm.new_clients_last);
            const cutsDelta = deltaCell(bm.cuts_this, bm.cuts_last);
            const nsDelta = deltaCell(bm.no_show_rate_this, bm.no_show_rate_last, true);

            return (
              <article key={`recap-${slug}`} className="glass-card rounded-2xl overflow-hidden">
                <header className="bg-gradient-to-br from-red-950/50 to-red-950/20 border-b border-white/10 px-7 py-6 flex justify-between items-center">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-red mb-1.5">
                      {recap.month.name} Recap
                    </div>
                    <div className="text-3xl font-black italic uppercase tracking-tight">
                      {p.display_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Overall</div>
                    <div className={`text-xl font-black italic uppercase tracking-tight ${verdictCls}`}>
                      {recap.verdict} month
                    </div>
                  </div>
                </header>

                <div className="p-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <RecapSection title="Content performance">
                      <StatRow label="Total posts" val={
                        <>
                          {cp.posts_this}
                          {postsDelta && <span className={`text-[10px] ml-2 ${postsDelta.cls}`}>{postsDelta.txt}</span>}
                        </>
                      } />
                      <StatRow label="Strong / Mid / Weak" val={`${cp.strong} / ${cp.mid} / ${cp.weak}`} />
                      <StatRow label="Strong-Tier %" val={
                        <>
                          {cp.strong_pct}%
                          {strongPctDelta && <span className={`text-[10px] ml-2 ${strongPctDelta.cls}`}>{strongPctDelta.txt}%</span>}
                        </>
                      } />
                      <StatRow label="Top format" val={<span className="font-mono text-[11px]">{cp.top_format}</span>} />
                      <StatRow label="Coaching flags" val={
                        <span className={cp.flagged_videos > 0 ? "text-red-400" : "text-green-400"}>
                          {cp.flagged_videos}
                        </span>
                      } />
                    </RecapSection>

                    <RecapSection title="Business metrics">
                      <StatRow label="New clients" val={
                        <>
                          {bm.new_clients_this}
                          {ncDelta && <span className={`text-[10px] ml-2 ${ncDelta.cls}`}>{ncDelta.txt}</span>}
                        </>
                      } />
                      <StatRow label="Cuts completed" val={
                        <>
                          {bm.cuts_this}
                          {cutsDelta && <span className={`text-[10px] ml-2 ${cutsDelta.cls}`}>{cutsDelta.txt}</span>}
                        </>
                      } />
                      <StatRow label="No-show rate" val={
                        <>
                          {bm.no_show_rate_this}%
                          {nsDelta && <span className={`text-[10px] ml-2 ${nsDelta.cls}`}>{nsDelta.txt}%</span>}
                        </>
                      } />
                      <StatRow label="5-2 compliance" val={`${ft.compliant_weeks_this} / ${ft.total_weeks_this} weeks`} />
                      <StatRow label="Health Bar score" val={`${hb.score_this} / 100`} />
                    </RecapSection>
                  </div>

                  {recap.actionItems.length > 0 && (
                    <div className="bg-black/40 border border-red-500/20 border-l-[3px] border-l-brand-red rounded-r-xl px-5 py-4 mb-4">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red mb-3">
                        Next month priorities
                      </div>
                      {recap.actionItems.map((item, i) => (
                        <div key={i} className="flex gap-3 py-2 border-b border-white/10 last:border-b-0 text-[13px]">
                          <span className="font-mono text-[11px] text-brand-red min-w-[24px]">{String(i + 1).padStart(2, "0")}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-5 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400 mb-2.5">
                      Coach's note
                    </div>
                    <div className="text-[13px] leading-relaxed">{recap.coachNote}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

// ─── small layout sub-components ───────────────────────────────────────────

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-2">{num}</div>
      <h2 className="text-2xl font-black italic uppercase tracking-tight mb-7 border-l-[3px] border-brand-red pl-3.5">
        {title}
      </h2>
    </>
  );
}

function Divider() {
  return <div className="h-px bg-white/10 my-14" />;
}

function Factor({ label, earned, max }: { label: string; earned: number; max: number }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/60 mb-1">{label}</div>
      <div className={`text-lg font-black italic ${factorClass(earned, max)}`}>{earned} / {max}</div>
    </div>
  );
}

function RecapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-[18px]">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3.5">{title}</div>
      {children}
    </div>
  );
}

function StatRow({ label, val }: { label: string; val: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-b-0 text-[13px]">
      <span className="text-white/60">{label}</span>
      <span className="font-mono font-semibold">{val}</span>
    </div>
  );
}
