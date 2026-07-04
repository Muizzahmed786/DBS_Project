import { useState, useEffect, useMemo } from "react";
import { getAllChallans, getChallansByStatus } from "../../api/admin.js";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",     label: "All Challans", icon: ClipboardList, color: "border-slate-600 text-slate-700",     badge: "bg-slate-100 text-slate-700" },
  { key: "pending", label: "Pending",      icon: Clock,         color: "border-amber-500 text-amber-600",     badge: "bg-amber-100 text-amber-700" },
  { key: "paid",    label: "Paid",         icon: CheckCircle2,  color: "border-emerald-500 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
];

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    paid:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  const icons = { pending: Clock, paid: CheckCircle2 };
  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {Icon ? <Icon size={11} /> : "•"} {status || "—"}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[28, 40, 38, 50, 42, 35, 30, 25, 32].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ activeKey }) => {
  const Icon = activeKey === "paid" ? CheckCircle2 : activeKey === "pending" ? Clock : ClipboardList;
  return (
    <tr>
      <td colSpan={11} className="py-20 text-center">
        <Icon size={32} className="mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500 font-medium">No challans found</p>
      </td>
    </tr>
  );
};

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort, className = "" }) => (
  <th
    onClick={() => !noSort && onSort(col)}
    className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
      ${!noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""} ${className}`}
  >
    {label}
    {!noSort && (
      <span className="ml-1 inline-flex align-middle">
        {sortCol === col
          ? sortDir === "asc" ? <ArrowUp size={12} className="text-slate-500" /> : <ArrowDown size={12} className="text-slate-500" />
          : <ArrowUpDown size={12} className="text-slate-300" />}
      </span>
    )}
  </th>
);

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ all, pending, paid }) => {
  const totalAmount   = all.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const pendingAmount = pending.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const paidAmount    = paid.reduce((s, c) => s + Number(c.total_amount || 0), 0);

  const stats = [
    { label: "Total Challans",  value: all.length     || "—", sub: fmtAmount(totalAmount),   color: "text-slate-800",   bg: "bg-white border-blue-100" },
    { label: "Pending",         value: pending.length || "—", sub: fmtAmount(pendingAmount), color: "text-amber-600",   bg: "bg-amber-50 border-amber-200" },
    { label: "Paid",            value: paid.length    || "—", sub: fmtAmount(paidAmount),    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    {
      label: "Collection Rate",
      value: all.length ? `${Math.round((paid.length / all.length) * 100)}%` : "—",
      sub: "of challans paid",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 self-center">
      {stats.map((s) => (
        <div key={s.label} className={`px-4 py-2.5 rounded-lg border text-center min-w-[110px] ${s.bg}`}>
          <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          {s.sub && <div className={`text-xs font-semibold mt-0.5 ${s.color}`}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChallanManagement() {
  const [activeTab, setActiveTab] = useState("all");

  const [data, setData] = useState({ all: [], pending: [], paid: [] });
  const [loading, setLoading] = useState({ all: false, pending: false, paid: false });
  const [error, setError]     = useState({ all: null,  pending: null,  paid: null });

  const [sortCol, setSortCol] = useState("violation_date");
  const [sortDir, setSortDir] = useState("desc");

  // ── Fetchers ──
  const fetchAll = async () => {
    if (data.all.length) return;
    setLoading((p) => ({ ...p, all: true }));
    try {
      const res = await getAllChallans();
      const allChallans = res.data?.data || res.data || [];
      // Pre-populate pending/paid from the full list so tab badges show immediately
      setData((p) => ({
        ...p,
        all: allChallans,
        pending: p.pending.length ? p.pending : allChallans.filter((x) => x.status === "pending"),
        paid:    p.paid.length    ? p.paid    : allChallans.filter((x) => x.status === "paid"),
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
    setActiveTab(key);
    setSortCol("violation_date");
    setSortDir("desc");
    if (key === "all")                       fetchAll();
    if (key === "pending" || key === "paid") fetchByStatus(key);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  // ── Sorted rows (no search filter) ──
  const rows = data[activeTab];

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, sortCol, sortDir]);

  const COLS = [
    { key: "challan_number",  label: "Challan No." },
    { key: "violation_date",  label: "Date" },
    { key: "offender_name",   label: "Offender" },
    { key: "vehicle_number",  label: "Vehicle" },
    { key: "licence_number",  label: "DL No.", noSort: true },
    { key: "violation",       label: "Violation" },
    { key: "offence_section", label: "Section", noSort: true },
    { key: "location",        label: "Location" },
    { key: "penalty_amount",  label: "Penalty" },
    { key: "total_amount",    label: "Total" },
    { key: "status",          label: "Status", noSort: true },
  ];

  return (
    <div className="min-h-screen bg-blue-50/40">

      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 pt-6 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          Admin Panel
        </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Challan Management</h1>
            <p className="text-sm text-slate-500 mt-1">View and monitor all issued challans and their payment status.</p>
          </div>
          <StatsBar all={data.all} pending={data.pending} paid={data.paid} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {STATUS_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => handleTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all rounded-t-md
                  ${activeTab === t.key
                    ? `${t.color} bg-blue-50/60`
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-blue-50/40"
                  }`}
              >
                <Icon size={15} />
                {t.label}
                {data[t.key].length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? t.badge : "bg-slate-100 text-slate-500"}`}>
                    {data[t.key].length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-6">

        {/* Record count */}
        <div className="flex justify-end mb-4">
          <span className="text-xs text-slate-400">
            {sorted.length} record{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error[activeTab] && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <AlertTriangle size={16} className="shrink-0" />
            {error[activeTab]}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
          <div className="max-h-[430px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50">
                  {COLS.map((c) => (
                    <SortTh
                      key={c.key}
                      {...c}
                      col={c.key}
                      sortCol={sortCol}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading[activeTab]
                  ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                  : sorted.length === 0
                  ? <EmptyState activeKey={activeTab} />
                  : sorted.map((r, i) => (
                    <tr key={r.challan_id || i} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">

                      {/* Challan No. */}
                      <td className="px-4 py-3 text-xs font-bold text-blue-700 whitespace-nowrap">
                        {r.challan_number || "—"}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {fmtDate(r.violation_date)}
                      </td>

                      {/* Offender */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800 whitespace-nowrap">{r.offender_name || "—"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.mobile_number || ""}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-700 whitespace-nowrap">{r.vehicle_number || "—"}</div>
                        <div className="text-xs text-slate-400 mt-0.5 capitalize">{r.vehicle_class} {r.model ? `· ${r.model}` : ""}</div>
                      </td>

                      {/* DL No. */}
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {r.licence_number || "—"}
                      </td>

                      {/* Violation */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="text-xs text-slate-700 leading-relaxed line-clamp-2">{r.violation || "—"}</div>
                      </td>

                      {/* Section */}
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-slate-600 px-2 py-0.5 rounded whitespace-nowrap">
                          {r.offence_section || "—"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px]">
                        <div className="line-clamp-2">{r.location || "—"}</div>
                      </td>

                      {/* Penalty */}
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {fmtAmount(r.penalty_amount)}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-sm font-bold text-slate-800 whitespace-nowrap">
                        {fmtAmount(r.total_amount)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading[activeTab] && sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-blue-100 bg-blue-50/50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{sorted.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{rows.length}</span> challans
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-amber-600 font-semibold">
                  Pending: {fmtAmount(sorted.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.total_amount || 0), 0))}
                </span>
                <span className="text-emerald-600 font-semibold">
                  Collected: {fmtAmount(sorted.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.total_amount || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}