import { useState, useEffect, useMemo } from "react";
import { getAllChallans, getChallansByStatus } from "../../api/admin.js";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const fmtDate   = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtAmount = (n)   => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

/* ── Status badge ───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const cfg = {
        paid:    { bg: "#d4edda", color: "#2e7d32" },
        pending: { bg: "#fff3cd", color: "#92400e" },
    }[status] ?? { bg: SURFACE, color: MUTED };
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.75rem] font-semibold capitalize"
              style={{ background: cfg.bg, color: cfg.color }}>
            {status || "—"}
        </span>
    );
};

/* ── Stats bar ──────────────────────────────────────────────── */
const StatsBar = ({ all, pending, paid }) => {
    const configList = [
        { label: "Total Challans",  value: all.length     || "—", sub: fmtAmount(all.reduce((s,c) => s + Number(c.total_amount||0), 0)),      color: ON_SURFACE, bg: "#fff",          accent: "#e8ebef" },
        { label: "Pending",         value: pending.length || "—", sub: fmtAmount(pending.reduce((s,c) => s + Number(c.total_amount||0), 0)),   color: "#d97706",  bg: "rgba(217,119,6,0.06)",   accent: "rgba(217,119,6,0.12)" },
        { label: "Paid",            value: paid.length    || "—", sub: fmtAmount(paid.reduce((s,c) => s + Number(c.total_amount||0), 0)),      color: "#059669",  bg: "rgba(5,150,105,0.06)",  accent: "rgba(5,150,105,0.12)" },
        { label: "Collection Rate", value: all.length ? `${Math.round((paid.length/all.length)*100)}%` : "—", sub: "of challans paid", color: PRIMARY, bg: "rgba(0,63,135,0.06)", accent: "rgba(0,63,135,0.12)" },
    ];
    return (
        <div className="flex flex-wrap gap-3 self-center">
            {configList.map((s) => (
                <div key={s.label} className="px-4 py-2.5 rounded-xl text-center min-w-[110px]"
                     style={{ background: s.bg, boxShadow: `0 0 0 1.5px ${s.accent}` }}>
                    <div className="text-[1.25rem] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[0.75rem] mt-0.5" style={{ color: MUTED }}>{s.label}</div>
                    {s.sub && <div className="text-[0.75rem] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>}
                </div>
            ))}
        </div>
    );
};

/* ── Sort TH ────────────────────────────────────────────────── */
const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
    <th onClick={() => !noSort && onSort(col)}
        className={`px-4 py-3.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em] whitespace-nowrap ${!noSort ? "cursor-pointer select-none" : ""}`}
        style={{ color: MUTED }}
        onMouseEnter={(e) => { if (!noSort) e.currentTarget.style.color = ON_SURFACE; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; }}
    >
        {label}
        {!noSort && (
            <span className="ml-1 text-[0.6875rem]">
                {sortCol === col
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{ color: "#c5c8d4" }}>⇅</span>}
            </span>
        )}
    </th>
);

const STATUS_TABS = [
    { key: "all",     label: "All Challans", activeColor: MUTED    },
    { key: "pending", label: "Pending",      activeColor: "#d97706" },
    { key: "paid",    label: "Paid",         activeColor: "#059669" },
];

const COLS = [
    { key: "challan_number",  label: "Challan No."  },
    { key: "violation_date",  label: "Date"          },
    { key: "offender_name",   label: "Offender"      },
    { key: "vehicle_number",  label: "Vehicle"       },
    { key: "licence_number",  label: "DL No.",   noSort: true },
    { key: "violation",       label: "Violation"     },
    { key: "offence_section", label: "Section",  noSort: true },
    { key: "location",        label: "Location"      },
    { key: "penalty_amount",  label: "Penalty"       },
    { key: "total_amount",    label: "Total"         },
    { key: "status",          label: "Status",   noSort: true },
];

const SkeletonRow = () => (
    <tr>
        {[28,40,38,50,42,35,30,25,32,28,22].map((w, i) => (
            <td key={i} className="px-4 py-3.5">
                <div className="h-3 rounded-full animate-pulse" style={{ background: SURFACE, width: `${w}%` }} />
            </td>
        ))}
    </tr>
);

export default function ChallanManagement() {
    const [activeTab, setActiveTab] = useState("all");
    const [data, setData]   = useState({ all: [], pending: [], paid: [] });
    const [loading, setLoading] = useState({ all: false, pending: false, paid: false });
    const [error, setError]     = useState({ all: null, pending: null, paid: null });
    const [sortCol, setSortCol] = useState("violation_date");
    const [sortDir, setSortDir] = useState("desc");

    const fetchAll = async () => {
        if (data.all.length) return;
        setLoading((p) => ({ ...p, all: true }));
        try {
            const res = await getAllChallans();
            const all = res.data?.data || res.data || [];
            setData((p) => ({
                ...p, all,
                pending: p.pending.length ? p.pending : all.filter((x) => x.status === "pending"),
                paid:    p.paid.length    ? p.paid    : all.filter((x) => x.status === "paid"),
            }));
        } catch { setError((p) => ({ ...p, all: "Failed to load challans." })); }
        finally  { setLoading((p) => ({ ...p, all: false })); }
    };

    const fetchByStatus = async (status) => {
        if (data[status].length) return;
        setLoading((p) => ({ ...p, [status]: true }));
        try {
            const res = await getChallansByStatus(status);
            setData((p) => ({ ...p, [status]: res.data?.data || res.data || [] }));
        } catch { setError((p) => ({ ...p, [status]: `Failed to load ${status} challans.` })); }
        finally  { setLoading((p) => ({ ...p, [status]: false })); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleTab = (key) => {
        setActiveTab(key); setSortCol("violation_date"); setSortDir("desc");
        if (key === "all")                        fetchAll();
        if (key === "pending" || key === "paid")  fetchByStatus(key);
    };

    const handleSort = (col) => {
        if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("asc"); }
    };

    const rows = data[activeTab];
    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
            const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
            return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });
    }, [rows, sortCol, sortDir]);

    const tab = STATUS_TABS.find((t) => t.key === activeTab);

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 pt-8 pb-0"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>Admin Panel</p>
                        <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: ON_SURFACE }}>Challan Management</h1>
                        <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>View and monitor all issued challans and their payment status.</p>
                    </div>
                    <StatsBar all={data.all} pending={data.pending} paid={data.paid} />
                </div>

                {/* Tab bar */}
                <div className="flex gap-1">
                    {STATUS_TABS.map((t) => (
                        <button key={t.key} onClick={() => handleTab(t.key)}
                            className="flex items-center gap-2 px-5 py-2.5 text-[0.9375rem] font-medium rounded-t-lg transition-all duration-200"
                            style={activeTab === t.key
                                ? { borderBottom: `2px solid ${t.activeColor}`, color: t.activeColor, background: SURFACE }
                                : { borderBottom: "2px solid transparent", color: MUTED }}>
                            {t.label}
                            {data[t.key].length > 0 && (
                                <span className="text-[0.75rem] font-mono px-1.5 py-0.5 rounded-full"
                                      style={activeTab === t.key
                                          ? { background: `${t.activeColor}18`, color: t.activeColor }
                                          : { background: SURFACE, color: MUTED }}>
                                    {data[t.key].length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────── */}
            <div className="px-8 py-6">
                <div className="flex justify-end mb-4">
                    <span className="text-[0.8125rem] font-mono" style={{ color: MUTED }}>
                        {sorted.length} record{sorted.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {error[activeTab] && (
                    <div className="mb-4 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                        ⚠ {error[activeTab]}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[0.875rem]">
                            <thead style={{ background: SURFACE }}>
                                <tr>
                                    {COLS.map((c) => (
                                        <SortTh key={c.key} {...c} col={c.key} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading[activeTab]
                                    ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                                    : sorted.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={11} className="py-20 text-center">
                                                <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No challans found</p>
                                            </td>
                                        </tr>
                                    )
                                    : sorted.map((r, i) => (
                                        <tr key={r.challan_id || i}
                                            style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] font-bold whitespace-nowrap" style={{ color: PRIMARY }}>{r.challan_number || "—"}</td>
                                            <td className="px-4 py-3 text-[0.8125rem] font-mono whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(r.violation_date)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-[0.875rem] font-medium whitespace-nowrap" style={{ color: ON_SURFACE }}>{r.offender_name || "—"}</div>
                                                <div className="text-[0.75rem] font-mono mt-0.5" style={{ color: MUTED }}>{r.mobile_number || ""}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-[0.8125rem] font-bold whitespace-nowrap" style={{ color: ON_SURFACE }}>{r.vehicle_number || "—"}</div>
                                                <div className="text-[0.75rem] mt-0.5 capitalize" style={{ color: MUTED }}>{r.vehicle_class}{r.model ? ` · ${r.model}` : ""}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>{r.licence_number || "—"}</td>
                                            <td className="px-4 py-3 max-w-[200px]">
                                                <div className="text-[0.8125rem] leading-relaxed line-clamp-2" style={{ color: ON_SURFACE }}>{r.violation || "—"}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-[0.75rem] px-2 py-0.5 rounded"
                                                      style={{ background: SURFACE, color: MUTED }}>
                                                    {r.offence_section || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[0.8125rem] max-w-[140px]" style={{ color: MUTED }}>
                                                <div className="line-clamp-2">{r.location || "—"}</div>
                                            </td>
                                            <td className="px-4 py-3 text-[0.8125rem] font-mono whitespace-nowrap" style={{ color: MUTED }}>{fmtAmount(r.penalty_amount)}</td>
                                            <td className="px-4 py-3 text-[0.9375rem] font-bold font-mono whitespace-nowrap" style={{ color: ON_SURFACE }}>{fmtAmount(r.total_amount)}</td>
                                            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {!loading[activeTab] && sorted.length > 0 && (
                        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
                             style={{ borderTop: "1px solid rgba(197,200,212,0.25)", background: SURFACE }}>
                            <span className="text-[0.8125rem]" style={{ color: MUTED }}>
                                Showing <span className="font-semibold" style={{ color: ON_SURFACE }}>{sorted.length}</span> of <span className="font-semibold" style={{ color: ON_SURFACE }}>{rows.length}</span> challans
                            </span>
                            <div className="flex items-center gap-4 text-[0.8125rem] font-mono">
                                <span style={{ color: "#d97706", fontWeight: 600 }}>
                                    Pending: {fmtAmount(sorted.filter(c => c.status === "pending").reduce((s,c) => s + Number(c.total_amount||0), 0))}
                                </span>
                                <span style={{ color: "#059669", fontWeight: 600 }}>
                                    Collected: {fmtAmount(sorted.filter(c => c.status === "paid").reduce((s,c) => s + Number(c.total_amount||0), 0))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}