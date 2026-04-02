import { useState, useEffect, useMemo } from "react";
import {
    getAllPayments, getPaymentsByStatus,
} from "../../api/admin.js";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const fmtAmount = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const fmtDate   = (iso) => iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_TABS = [
    { key: "all",     label: "All Payments", activeColor: MUTED    },
    { key: "success", label: "Success",      activeColor: "#059669" },
    { key: "failed",  label: "Failed",       activeColor: "#ba1a1a" },
];

const PaymentStatusBadge = ({ status }) => {
    const cfg = {
        success: { bg: "#d4edda", color: "#2e7d32" },
        failed:  { bg: "#ffdad6", color: "#ba1a1a" },
    }[status] ?? { bg: SURFACE, color: MUTED };
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.75rem] font-semibold capitalize"
              style={{ background: cfg.bg, color: cfg.color }}>
            {status || "—"}
        </span>
    );
};

const ChallanStatusBadge = ({ status }) => {
    const cfg = {
        paid:    { bg: "#d4edda", color: "#2e7d32" },
        pending: { bg: "#fff3cd", color: "#92400e" },
    }[status] ?? { bg: SURFACE, color: MUTED };
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.75rem] font-medium capitalize"
              style={{ background: cfg.bg, color: cfg.color }}>
            {status || "—"}
        </span>
    );
};

const ModeChip = ({ mode }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[0.8125rem] font-medium capitalize"
          style={{ background: SURFACE, color: MUTED }}>
        {mode || "—"}
    </span>
);

const StatsBar = ({ all, success, failed }) => {
    const totalCollected = success.reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalFailed    = failed.reduce((s, p) => s + Number(p.amount || 0), 0);
    const successRate    = all.length ? Math.round((success.length / all.length) * 100) : 0;
    const configList = [
        { label: "Total Payments", value: all.length     || "—", sub: fmtAmount(all.reduce((s,p) => s + Number(p.amount||0), 0)),  color: ON_SURFACE, bg: "#fff",  ring: "#e8ebef" },
        { label: "Successful",     value: success.length || "—", sub: fmtAmount(totalCollected),  color: "#059669",  bg: "rgba(5,150,105,0.06)",   ring: "rgba(5,150,105,0.18)" },
        { label: "Failed",         value: failed.length  || "—", sub: fmtAmount(totalFailed),     color: "#ba1a1a",  bg: "rgba(186,26,26,0.06)",   ring: "rgba(186,26,26,0.18)" },
        { label: "Success Rate",   value: all.length ? `${successRate}%` : "—", sub: "of all transactions", color: PRIMARY, bg: "rgba(0,63,135,0.06)", ring: "rgba(0,63,135,0.18)" },
    ];
    return (
        <div className="flex flex-wrap gap-3 self-center">
            {configList.map((s) => (
                <div key={s.label} className="px-4 py-2.5 rounded-xl text-center min-w-[110px]"
                     style={{ background: s.bg, boxShadow: `0 0 0 1.5px ${s.ring}` }}>
                    <div className="text-[1.25rem] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[0.75rem] mt-0.5" style={{ color: MUTED }}>{s.label}</div>
                    {s.sub && <div className="text-[0.75rem] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>}
                </div>
            ))}
        </div>
    );
};

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
                {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : <span style={{ color: "#c5c8d4" }}>⇅</span>}
            </span>
        )}
    </th>
);

const SkeletonRow = () => (
    <tr>
        {[30,40,28,42,30,38,28,28].map((w, i) => (
            <td key={i} className="px-4 py-3.5">
                <div className="h-3 rounded-full animate-pulse" style={{ background: SURFACE, width: `${w}%` }} />
            </td>
        ))}
    </tr>
);

const COLS = [
    { key: "payment_date",          label: "Date & Time"   },
    { key: "full_name",             label: "Payer"         },
    { key: "challan_number",        label: "Challan No."   },
    { key: "transaction_reference", label: "Txn. Ref.",  noSort: true },
    { key: "payment_mode",          label: "Mode",       noSort: true },
    { key: "amount",                label: "Amount"        },
    { key: "challan_status",        label: "Challan",    noSort: true },
    { key: "payment_status",        label: "Payment",    noSort: true },
];

export default function PaymentManagement() {
    const [activeTab, setActiveTab] = useState("all");
    const [data, setData]           = useState({ all: [], success: [], failed: [] });
    const [loading, setLoading]     = useState({ all: false, success: false, failed: false });
    const [error, setError]         = useState({ all: null,  success: null,  failed: null  });
    const [sortCol, setSortCol]     = useState("payment_date");
    const [sortDir, setSortDir]     = useState("desc");

    const fetchAll = async () => {
        if (data.all.length) return;
        setLoading((p) => ({ ...p, all: true }));
        try {
            const res = await getAllPayments();
            const all = res.data?.data || res.data || [];
            setData((p) => ({
                ...p, all,
                success: p.success.length ? p.success : all.filter((x) => x.payment_status === "success"),
                failed:  p.failed.length  ? p.failed  : all.filter((x) => x.payment_status === "failed"),
            }));
        } catch { setError((p) => ({ ...p, all: "Failed to load payments." })); }
        finally  { setLoading((p) => ({ ...p, all: false })); }
    };

    const fetchByStatus = async (status) => {
        if (data[status].length) return;
        setLoading((p) => ({ ...p, [status]: true }));
        try {
            const res = await getPaymentsByStatus(status);
            setData((p) => ({ ...p, [status]: res.data?.data || res.data || [] }));
        } catch { setError((p) => ({ ...p, [status]: `Failed to load ${status} payments.` })); }
        finally  { setLoading((p) => ({ ...p, [status]: false })); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleTab = (key) => {
        setActiveTab(key); setSortCol("payment_date"); setSortDir("desc");
        if (key === "all") fetchAll();
        if (key === "success" || key === "failed") fetchByStatus(key);
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
                        <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: ON_SURFACE }}>Payment Management</h1>
                        <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>Track all payment transactions linked to challans.</p>
                    </div>
                    <StatsBar all={data.all} success={data.success} failed={data.failed} />
                </div>

                {/* Tabs */}
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
                    <div className="flex items-center gap-4 text-[0.8125rem] font-mono" style={{ color: MUTED }}>
                        <span>{sorted.length} / {rows.length} records</span>
                        {sorted.length > 0 && (
                            <span style={{ color: "#059669", fontWeight: 600 }}>
                                {fmtAmount(sorted.reduce((s, p) => s + Number(p.amount || 0), 0))} shown
                            </span>
                        )}
                    </div>
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
                                            <td colSpan={9} className="py-20 text-center">
                                                <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No payments found</p>
                                            </td>
                                        </tr>
                                    )
                                    : sorted.map((r, i) => (
                                        <tr key={r.payment_id || i}
                                            style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <td className="px-4 py-3 text-[0.8125rem] font-mono whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(r.payment_date)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-[0.875rem] font-medium whitespace-nowrap" style={{ color: ON_SURFACE }}>{r.full_name || "—"}</div>
                                                <div className="text-[0.75rem] font-mono mt-0.5" style={{ color: MUTED }}>{r.mobile_number || r.email || ""}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] font-bold whitespace-nowrap" style={{ color: PRIMARY }}>{r.challan_number || "—"}</td>
                                            <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>{r.transaction_reference || "—"}</td>
                                            <td className="px-4 py-3"><ModeChip mode={r.payment_mode} /></td>
                                            <td className="px-4 py-3 text-[0.9375rem] font-bold font-mono whitespace-nowrap" style={{ color: ON_SURFACE }}>{fmtAmount(r.amount)}</td>
                                            <td className="px-4 py-3"><ChallanStatusBadge status={r.challan_status} /></td>
                                            <td className="px-4 py-3"><PaymentStatusBadge status={r.payment_status} /></td>
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
                                Showing <span className="font-semibold" style={{ color: ON_SURFACE }}>{sorted.length}</span> of <span className="font-semibold" style={{ color: ON_SURFACE }}>{rows.length}</span> payments
                            </span>
                            <div className="flex items-center gap-4 text-[0.8125rem] font-mono">
                                <span style={{ color: "#059669", fontWeight: 600 }}>
                                    Collected: {fmtAmount(sorted.filter(p => p.payment_status === "success").reduce((s,p) => s + Number(p.amount||0), 0))}
                                </span>
                                <span style={{ color: "#ba1a1a", fontWeight: 600 }}>
                                    Failed: {fmtAmount(sorted.filter(p => p.payment_status === "failed").reduce((s,p) => s + Number(p.amount||0), 0))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}