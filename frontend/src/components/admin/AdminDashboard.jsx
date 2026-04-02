import { useState, useEffect } from "react";
import {
  getTotalChallansCount,
  getTotalRevenue,
  getChallanCountByStatus,
} from "../../api/admin.js";

/* ── Shared tokens ──────────────────────────────────────────── */
const cardShadow  = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";
const PRIMARY     = "#003f87";
const ON_SURFACE  = "#1a1d23";
const MUTED       = "#42454e";
const SURFACE_LOW = "#f3f4f5";

const fmtAmount = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const fmtCount  = (n) => n != null ? Number(n).toLocaleString("en-IN")       : "—";

/* ── Page header (shared layout) ───────────────────────────── */
const PageHeader = ({ overline, title, subtitle, right }) => (
    <div className="bg-white px-8 pt-8 pb-6 flex flex-wrap items-start justify-between gap-4"
         style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
        <div>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>
                {overline}
            </p>
            <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: ON_SURFACE }}>
                {title}
            </h1>
            {subtitle && <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>{subtitle}</p>}
        </div>
        {right && <div className="self-center">{right}</div>}
    </div>
);

/* ── Skeleton ───────────────────────────────────────────────── */
const StatSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3" style={{ boxShadow: cardShadow }}>
        <div className="h-3 w-24 rounded-full bg-[#e0e4ea] animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-[#e0e4ea] animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-[#e0e4ea] animate-pulse" />
    </div>
);

/* ── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, accent, valueColor }) => (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-1 transition-all duration-200 cursor-default"
         style={{ boxShadow: cardShadow }}
         onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
         onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; e.currentTarget.style.transform = "translateY(0)"; }}
    >
        <div className="flex items-start justify-between mb-2">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: accent + "18" }}>
                {icon}
            </span>
        </div>
        <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em]" style={{ color: MUTED }}>{label}</p>
        <p className="text-[2rem] font-bold font-mono tracking-tight leading-none" style={{ color: valueColor || ON_SURFACE }}>
            {value}
        </p>
        {sub && <p className="text-[0.8125rem] mt-1" style={{ color: MUTED }}>{sub}</p>}
    </div>
);

/* ── Donut Chart ────────────────────────────────────────────── */
const DonutChart = ({ paid, pending, total }) => {
    if (!total) return null;
    const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
    const paidDash    = (paid / total) * circ;
    const pendingDash = (pending / total) * circ;
    return (
        <div className="flex items-center gap-8">
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={SURFACE_LOW} strokeWidth="18"/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="18"
                        strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
                        strokeDashoffset={-paidDash} strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.7s ease" }}/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#059669" strokeWidth="18"
                        strokeDasharray={`${paidDash} ${circ - paidDash}`}
                        strokeDashoffset={circ * 0.25} strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.7s ease" }}/>
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700"
                      fill={ON_SURFACE} fontFamily="monospace">{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={MUTED}
                      fontFamily="Inter, sans-serif">total</text>
            </svg>
            <div className="flex flex-col gap-4">
                {[
                    { label: "Paid",    count: paid,    color: "#059669", dot: "#059669" },
                    { label: "Pending", count: pending, color: "#d97706", dot: "#f59e0b" },
                ].map(({ label, count, color, dot }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: dot }} />
                        <div>
                            <p className="text-[0.8125rem] font-medium" style={{ color: MUTED }}>{label}</p>
                            <p className="text-[1.125rem] font-bold font-mono" style={{ color }}>{fmtCount(count)}</p>
                            <p className="text-[0.75rem]" style={{ color: MUTED }}>
                                {total ? Math.round((count / total) * 100) : 0}% of total
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ── Progress Bar ───────────────────────────────────────────── */
const ProgressBar = ({ label, value, max, barColor }) => {
    const pct = max ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <span className="text-[0.8125rem] font-medium" style={{ color: MUTED }}>{label}</span>
                <span className="text-[0.8125rem] font-mono font-bold" style={{ color: ON_SURFACE }}>{pct}%</span>
            </div>
            {/* Progress bar track — tonal surface, no border */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: SURFACE_LOW }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
            </div>
        </div>
    );
};

/* ── Main Component ─────────────────────────────────────────── */
export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalCount: null, paidCount: null, pendingCount: null, totalRevenue: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [totalRes, revenueRes, paidRes, pendingRes] = await Promise.all([
                    getTotalChallansCount(), getTotalRevenue(),
                    getChallanCountByStatus("paid"), getChallanCountByStatus("pending"),
                ]);
                const extract = (res) => res.data?.data ?? res.data ?? {};
                const total   = extract(totalRes);
                const revenue = extract(revenueRes);
                const paid    = extract(paidRes);
                const pending = extract(pendingRes);
                setStats({
                    totalCount:   Number(total.total_challans   ?? total.count   ?? total   ?? 0),
                    paidCount:    Number(paid.count             ?? paid.total    ?? paid    ?? 0),
                    pendingCount: Number(pending.count          ?? pending.total ?? pending ?? 0),
                    totalRevenue: Number(revenue.total_revenue  ?? revenue.amount ?? revenue ?? 0),
                });
            } catch {
                setError("Failed to load dashboard stats. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const { totalCount, paidCount, pendingCount, totalRevenue } = stats;
    const collectionRate = totalCount ? Math.round((paidCount / totalCount) * 100) : 0;
    const avgFine        = paidCount  ? Math.round(totalRevenue / paidCount)        : 0;

    const cards = [
        { label: "Total Challans",   value: fmtCount(totalCount),     sub: "All issued challans",                        icon: "📋", accent: PRIMARY,    valueColor: ON_SURFACE },
        { label: "Paid Challans",    value: fmtCount(paidCount),      sub: `${collectionRate}% collection rate`,         icon: "✅", accent: "#059669",  valueColor: "#059669"  },
        { label: "Pending Challans", value: fmtCount(pendingCount),   sub: "Awaiting payment",                           icon: "⏳", accent: "#d97706",  valueColor: "#d97706"  },
        { label: "Total Revenue",    value: fmtAmount(totalRevenue),  sub: `Avg. ${fmtAmount(avgFine)} per challan`,     icon: "💰", accent: "#7c3aed",  valueColor: "#7c3aed"  },
    ];

    return (
        <div className="min-h-screen" style={{ background: SURFACE_LOW }}>
            <PageHeader
                overline="Admin Panel"
                title="Dashboard"
                subtitle="Overview of challan activity and revenue collection."
                right={
                    <span className="text-[0.75rem] font-mono px-3 py-1.5 rounded-lg"
                          style={{ background: "#e8ebef", color: MUTED }}>
                        Updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                }
            />

            <div className="px-8 py-8 flex flex-col gap-8">
                {/* Error */}
                {error && (
                    <div className="rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Stat Cards */}
                <div>
                    <p className="text-[0.75rem] font-medium uppercase tracking-[0.06em] mb-4" style={{ color: MUTED }}>Overview</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                            : cards.map((c) => <StatCard key={c.label} {...c} />)
                        }
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Donut */}
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: cardShadow }}>
                        <p className="text-[0.75rem] font-medium uppercase tracking-[0.06em] mb-1" style={{ color: MUTED }}>Breakdown</p>
                        <h2 className="text-[1rem] font-bold mb-1" style={{ color: ON_SURFACE }}>Challan Distribution</h2>
                        <p className="text-[0.8125rem] mb-5" style={{ color: MUTED }}>Paid vs pending</p>
                        {loading
                            ? <div className="flex items-center gap-8">
                                <div className="w-36 h-36 rounded-full border-[18px] border-[#e0e4ea] animate-pulse" />
                                <div className="flex flex-col gap-4">
                                    <div className="h-3 w-28 rounded-full bg-[#e0e4ea] animate-pulse" />
                                    <div className="h-3 w-20 rounded-full bg-[#e0e4ea] animate-pulse" />
                                </div>
                              </div>
                            : <DonutChart paid={paidCount} pending={pendingCount} total={totalCount} />
                        }
                    </div>

                    {/* Progress bars */}
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: cardShadow }}>
                        <p className="text-[0.75rem] font-medium uppercase tracking-[0.06em] mb-1" style={{ color: MUTED }}>Collection</p>
                        <h2 className="text-[1rem] font-bold mb-1" style={{ color: ON_SURFACE }}>Collection Progress</h2>
                        <p className="text-[0.8125rem] mb-5" style={{ color: MUTED }}>Status vs total challans</p>
                        {loading
                            ? <div className="flex flex-col gap-5">
                                {[1,2,3].map((i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="h-3 w-24 rounded-full bg-[#e0e4ea] animate-pulse" />
                                        <div className="h-2 w-full rounded-full bg-[#e0e4ea] animate-pulse" />
                                    </div>
                                ))}
                              </div>
                            : <div className="flex flex-col gap-5">
                                <ProgressBar label="Paid Challans"    value={paidCount}    max={totalCount} barColor="#059669" />
                                <ProgressBar label="Pending Challans" value={pendingCount} max={totalCount} barColor="#f59e0b" />
                                <ProgressBar label="Revenue Realised" value={paidCount}    max={totalCount} barColor={PRIMARY}  />

                                {/* Ghost border separator at 30% opacity */}
                                <div className="pt-4 grid grid-cols-2 gap-4"
                                     style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }}>
                                    {[
                                        { label: "Collection Rate",    value: `${collectionRate}%`, color: PRIMARY    },
                                        { label: "Avg. Fine Collected", value: fmtAmount(avgFine),  color: "#059669"  },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="rounded-xl p-3 text-center" style={{ background: SURFACE_LOW }}>
                                            <p className="text-[0.75rem] mb-1" style={{ color: MUTED }}>{label}</p>
                                            <p className="text-[1.5rem] font-bold font-mono" style={{ color }}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                              </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}