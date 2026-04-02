import { useState, useEffect, useMemo } from "react";
import { getAllCitizens, getAllOfficers, getAllAdmins } from "../../api/admin.js";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const TABS = [
    { key: "citizen", label: "Citizens", badge: { bg: "rgba(0,63,135,0.08)", color: PRIMARY } },
    { key: "officer", label: "Officers", badge: { bg: "rgba(5,150,105,0.08)",  color: "#059669" } },
    { key: "admin",   label: "Admins",   badge: { bg: "rgba(124,58,237,0.08)", color: "#7c3aed" } },
];

const COLUMNS = [
    { key: "full_name",      label: "Name"     },
    { key: "email",          label: "Email"    },
    { key: "mobile_number",  label: "Mobile"   },
    { key: "aadhaar_number", label: "Aadhaar", noSort: true },
    { key: "created_at",     label: "Joined"   },
    { key: "user_id",        label: "User ID", noSort: true },
];

/* Avatar hue cycles through primary tints */
const AVATAR_STYLES = [
    { bg: "rgba(0,63,135,0.10)",   color: PRIMARY    },
    { bg: "rgba(5,150,105,0.10)",  color: "#059669"  },
    { bg: "rgba(217,119,6,0.10)",  color: "#d97706"  },
    { bg: "rgba(124,58,237,0.10)", color: "#7c3aed"  },
    { bg: "rgba(219,39,119,0.10)", color: "#db2777"  },
    { bg: "rgba(14,165,233,0.10)", color: "#0ea5e9"  },
];

const fmtDate     = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const maskAadhaar = (num) => num ? `•••• •••• ${String(num).slice(-4)}` : "—";
const getInitials = (name = "") => name.split(" ").slice(0,2).map((w) => w[0]).join("").toUpperCase() || "?";

const Avatar = ({ name, index }) => {
    const s = AVATAR_STYLES[index % AVATAR_STYLES.length];
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
             style={{ background: s.bg, color: s.color }}>
            {getInitials(name)}
        </div>
    );
};

const SkeletonRow = () => (
    <tr>
        {[40, 55, 45, 50, 40, 30].map((w, i) => (
            <td key={i} className="px-4 py-3.5">
                <div className="h-3 rounded-full animate-pulse" style={{ background: SURFACE, width: `${w}%` }} />
            </td>
        ))}
    </tr>
);

const SortIcon = ({ col, sortCol, sortDir }) => {
    if (sortCol !== col) return <span className="ml-1 text-[0.6875rem]" style={{ color: "#c5c8d4" }}>⇅</span>;
    return <span className="ml-1 text-[0.6875rem]">{sortDir === "asc" ? "▲" : "▼"}</span>;
};

export default function UserManagement() {
    const [activeTab, setActiveTab]     = useState("citizen");
    const [data, setData]               = useState({ citizen: [], officer: [], admin: [] });
    const [loading, setLoading]         = useState({ citizen: false, officer: false, admin: false });
    const [error, setError]             = useState({ citizen: null,  officer: null,  admin: null });
    const [sortCol, setSortCol]         = useState("created_at");
    const [sortDir, setSortDir]         = useState("desc");
    const [showAadhaar, setShowAadhaar] = useState(false);

    const fetchers = { citizen: getAllCitizens, officer: getAllOfficers, admin: getAllAdmins };

    const fetchTab = async (tab) => {
        if (data[tab].length > 0) return;
        setLoading((p) => ({ ...p, [tab]: true }));
        try {
            const res = await fetchers[tab]();
            setData((p) => ({ ...p, [tab]: res.data?.data || res.data || [] }));
        } catch {
            setError((p) => ({ ...p, [tab]: "Failed to load data." }));
        } finally {
            setLoading((p) => ({ ...p, [tab]: false }));
        }
    };

    useEffect(() => { fetchTab("citizen"); fetchTab("officer"); fetchTab("admin"); }, []);

    const handleTab = (key) => {
        setActiveTab(key);
        setSortCol("created_at");
        setSortDir("desc");
        fetchTab(key);
    };

    const handleSort = (col) => {
        if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("asc"); }
    };

    const tab  = TABS.find((t) => t.key === activeTab);
    const rows = data[activeTab];
    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
            const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
            return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });
    }, [rows, sortCol, sortDir]);

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 pt-8 pb-0"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>
                            Admin Panel
                        </p>
                        <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: ON_SURFACE }}>
                            User Management
                        </h1>
                        <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>Manage citizens, officers, and admins.</p>
                    </div>

                    {/* Summary chips */}
                    <div className="flex flex-wrap gap-2 items-center self-center">
                        {TABS.map((t) => (
                            <span key={t.key}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold"
                                  style={{ background: t.badge.bg, color: t.badge.color }}>
                                <span className="font-mono">{data[t.key].length || "—"}</span>
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tab bar — bottom-border indicator, no background border */}
                <div className="flex gap-1">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => handleTab(t.key)}
                            className="flex items-center gap-2 px-5 py-2.5 text-[0.9375rem] font-medium rounded-t-lg transition-all duration-200"
                            style={activeTab === t.key
                                ? { borderBottom: `2px solid ${PRIMARY}`, color: PRIMARY, background: SURFACE }
                                : { borderBottom: "2px solid transparent", color: MUTED, background: "transparent" }
                            }>
                            {t.label}
                            {data[t.key].length > 0 && (
                                <span className="text-[0.75rem] font-mono px-1.5 py-0.5 rounded-full"
                                      style={activeTab === t.key
                                          ? { background: t.badge.bg, color: t.badge.color }
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

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[0.8125rem] font-mono" style={{ color: MUTED }}>
                        {sorted.length} record{sorted.length !== 1 ? "s" : ""}
                    </span>
                    <button onClick={() => setShowAadhaar((s) => !s)}
                        className="flex items-center gap-1.5 px-4 py-2 text-[0.8125rem] font-medium rounded-lg transition-all duration-150"
                        style={{ background: "#fff", color: MUTED, boxShadow: cardShadow, border: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                    >
                        {showAadhaar ? "🙈 Hide" : "👁 Show"} Aadhaar
                    </button>
                </div>

                {/* Error */}
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
                                    {COLUMNS.map((col) => (
                                        <th key={col.key}
                                            onClick={() => !col.noSort && handleSort(col.key)}
                                            className={`px-4 py-3.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em] whitespace-nowrap ${!col.noSort ? "cursor-pointer select-none" : ""}`}
                                            style={{ color: MUTED }}
                                            onMouseEnter={(e) => { if (!col.noSort) e.currentTarget.style.color = ON_SURFACE; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; }}
                                        >
                                            {col.label}
                                            {!col.noSort && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading[activeTab]
                                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                    : sorted.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No {tab?.label?.toLowerCase()} found</p>
                                            </td>
                                        </tr>
                                    )
                                    : sorted.map((row, i) => (
                                        <tr key={row.user_id || i}
                                            style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={row.full_name} index={i} />
                                                    <span className="font-medium whitespace-nowrap" style={{ color: ON_SURFACE }}>
                                                        {row.full_name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem]" style={{ color: MUTED }}>{row.email || "—"}</td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>{row.mobile_number || "—"}</td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>
                                                {showAadhaar ? (row.aadhaar_number || "—") : maskAadhaar(row.aadhaar_number)}
                                            </td>
                                            <td className="px-4 py-3 text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(row.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-[0.75rem] px-2 py-1 rounded"
                                                      style={{ background: SURFACE, color: MUTED }}>
                                                    {row.user_id || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    {!loading[activeTab] && sorted.length > 0 && (
                        <div className="px-4 py-3 flex items-center justify-between"
                             style={{ borderTop: "1px solid rgba(197,200,212,0.25)", background: SURFACE }}>
                            <span className="text-[0.8125rem]" style={{ color: MUTED }}>
                                Showing <span className="font-semibold" style={{ color: ON_SURFACE }}>{sorted.length}</span> of <span className="font-semibold" style={{ color: ON_SURFACE }}>{rows.length}</span> {tab?.label?.toLowerCase()}
                            </span>
                            <span className="text-[0.75rem] font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: tab?.badge?.bg, color: tab?.badge?.color }}>
                                {tab?.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}