import { useState, useEffect } from "react";
import { getAllViolationTypes } from "../../api/admin.js";
import { Search, TriangleAlert } from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

/* Semantic accent cycle — one per card, keeps badges visually distinct */
const CARD_ACCENTS = [
    { bg: "rgba(217,119,6,0.08)",  color: "#d97706",  badge: { bg: "#fff3cd", text: "#92400e" } },
    { bg: "rgba(186,26,26,0.08)",  color: "#ba1a1a",  badge: { bg: "#ffdad6", text: "#ba1a1a" } },
    { bg: "rgba(5,150,105,0.08)",  color: "#059669",  badge: { bg: "#d4edda", text: "#2e7d32" } },
    { bg: "rgba(0,63,135,0.08)",   color: PRIMARY,    badge: { bg: "rgba(0,63,135,0.10)", text: PRIMARY } },
    { bg: "rgba(124,58,237,0.08)", color: "#7c3aed",  badge: { bg: "rgba(124,58,237,0.10)", text: "#7c3aed" } },
    { bg: "rgba(14,165,233,0.08)", color: "#0ea5e9",  badge: { bg: "rgba(14,165,233,0.10)", text: "#0369a1" } },
];

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 animate-pulse" style={{ boxShadow: cardShadow }}>
        <div className="h-3 rounded-full" style={{ width: "55%", background: SURFACE }} />
        <div className="h-5 rounded-full" style={{ width: "80%", background: SURFACE }} />
        <div className="h-3 rounded-full" style={{ width: "40%", background: SURFACE }} />
    </div>
);

export default function ViolationTypes() {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [search, setSearch]         = useState("");

    useEffect(() => {
        getAllViolationTypes()
            .then((res) => { setViolations(res.data?.data || res.data || []); setLoading(false); })
            .catch((err) => { console.error(err); setError("Failed to load violation types."); setLoading(false); });
    }, []);

    const filtered = violations.filter((v) =>
        (v.description || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 py-8 flex flex-wrap items-center justify-between gap-4"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <div>
                    <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>Admin Panel</p>
                    <h1 className="text-[1.75rem] font-bold tracking-[-0.02em]" style={{ color: ON_SURFACE }}>Violation Types</h1>
                    <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>
                        {loading ? "Loading…" : `${filtered.length} violation${filtered.length !== 1 ? "s" : ""} found`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                        type="text" placeholder="Search violations…"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 rounded-xl text-[0.875rem] outline-none w-60 transition-all duration-200"
                        style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                        onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; }}
                        onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
                    />
                </div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-8 py-8">
                {error && (
                    <div className="mb-6 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Skeleton grid */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white"
                             style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                            <TriangleAlert size={24} />
                        </div>
                        <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No violations found</p>
                        <p className="text-[0.875rem]" style={{ color: MUTED }}>Try adjusting your search.</p>
                    </div>
                )}

                {/* Card grid */}
                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((v, i) => {
                            const acc  = CARD_ACCENTS[i % CARD_ACCENTS.length];
                            const name = v.description || "Unknown";
                            const fine = v.penalty_amount ?? null;
                            const code = v.offence_section || null;
                            return (
                                <div
                                    key={v.violation_type_id || i}
                                    className="bg-white rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-all duration-200"
                                    style={{ boxShadow: cardShadow }}
                                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    {/* Top row — semantic badge + section code */}
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[0.75rem] font-bold"
                                              style={{ background: acc.badge.bg, color: acc.badge.text }}>
                                            Violation
                                        </span>
                                        {code && (
                                            <span className="font-mono text-[0.75rem] px-2 py-0.5 rounded"
                                                  style={{ background: SURFACE, color: MUTED }}>
                                                {code}
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon + Name */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                             style={{ background: acc.bg, color: acc.color }}>
                                            <TriangleAlert size={16} />
                                        </div>
                                        <p className="text-[1rem] font-bold leading-snug" style={{ color: ON_SURFACE }}>
                                            {name}
                                        </p>
                                    </div>

                                    {/* Ghost separator at 30% opacity */}
                                    <div style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }} />

                                    {/* Fine amount */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[0.8125rem]" style={{ color: MUTED }}>Fine Amount</span>
                                        <span className="text-[1rem] font-bold font-mono"
                                              style={{ color: fine != null ? "#059669" : "#c5c8d4" }}>
                                            {fine != null ? `₹${Number(fine).toLocaleString("en-IN")}` : "—"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}