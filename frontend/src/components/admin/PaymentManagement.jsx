import { useState, useEffect, useMemo } from "react";
import { getAllPayments, getPaymentsByStatus } from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",     label: "All Payments", icon: "💳", color: "border-slate-400 text-slate-200",   badge: "bg-slate-700/60 text-slate-300" },
  { key: "success", label: "Success",      icon: "✅", color: "border-emerald-500 text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
  { key: "failed",  label: "Failed",       icon: "❌", color: "border-rose-500 text-rose-400",       badge: "bg-rose-500/15 text-rose-400" },
];

const MODE_ICONS = {
  upi:        "📱",
  card:       "💳",
  netbanking: "🏦",
  cash:       "💵",
  wallet:     "👛",
};

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PaymentStatusBadge = ({ status }) => {
  const styles = {
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    failed:  "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  };
  const icons = { success: "✅", failed: "❌" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-slate-700/60 text-slate-400"}`}>
      {icons[status] || "•"} {status || "—"}
    </span>
  );
};

const ChallanStatusBadge = ({ status }) => {
  const styles = {
    paid:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-slate-700/40 text-slate-500"}`}>
      {status || "—"}
    </span>
  );
};

const ModeChip = ({ mode }) => {
  const m = (mode || "").toLowerCase();
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-700/60 text-slate-300 text-xs font-medium capitalize">
      <span>{MODE_ICONS[m] || "💳"}</span>
      {mode || "—"}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-700/40">
    {[30, 40, 28, 42, 30, 38, 28, 28].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-700/60 animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ icon }) => (
  <tr>
    <td colSpan={9} className="py-20 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-400 font-medium">No payments found</p>
      <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter.</p>
    </td>
  </tr>
);

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
  <th
    onClick={() => !noSort && onSort(col)}
    className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
      ${!noSort ? "cursor-pointer hover:text-slate-200 select-none" : ""}`}
  >
    {label}
    {!noSort && (
      <span className="ml-1 text-xs">
        {sortCol === col
          ? sortDir === "asc" ? "▲" : "▼"
          : <span className="text-slate-600">⇅</span>}
      </span>
    )}
  </th>
);

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ all, success, failed }) => {
  const totalCollected  = success.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalFailed     = failed.reduce((s, p) => s + Number(p.amount || 0), 0);
  const successRate     = all.length ? Math.round((success.length / all.length) * 100) : 0;

  const stats = [
    { label: "Total Payments",  value: all.length     || "—", sub: fmtAmount(all.reduce((s,p) => s + Number(p.amount||0), 0)),   color: "text-white",       bg: "bg-slate-800/50 border-slate-700/60" },
    { label: "Successful",      value: success.length || "—", sub: fmtAmount(totalCollected),  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    { label: "Failed",          value: failed.length  || "—", sub: fmtAmount(totalFailed),     color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/25" },
    { label: "Success Rate",    value: all.length ? `${successRate}%` : "—", sub: "of all transactions", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/25" },
  ];

  return (
    <div className="flex flex-wrap gap-3 self-center">
      {stats.map((s) => (
        <div key={s.label} className={`px-4 py-2.5 rounded-lg border text-center min-w-[110px] ${s.bg}`}>
          <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          {s.sub && <div className={`text-xs font-semibold mt-0.5 ${s.color}`}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData]   = useState({ all: [], success: [], failed: [] });
  const [loading, setLoading] = useState({ all: false, success: false, failed: false });
  const [error, setError]     = useState({ all: null,  success: null,  failed: null });

  const [search,  setSearch]  = useState("");
  const [sortCol, setSortCol] = useState("payment_date");
  const [sortDir, setSortDir] = useState("desc");

  // ── Fetchers ──
  const fetchAll = async () => {
    if (data.all.length) return;
    setLoading((p) => ({ ...p, all: true }));
    try {
      const res = await getAllPayments();
      const allPayments = res.data?.data || res.data || [];
      // Derive success/failed counts from the full list for accurate tab badges
      setData((p) => ({
        ...p,
        all: allPayments,
        success: p.success.length ? p.success : allPayments.filter((x) => x.payment_status === "success"),
        failed:  p.failed.length  ? p.failed  : allPayments.filter((x) => x.payment_status === "failed"),
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
    setActiveTab(key);
    setSearch("");
    setSortCol("payment_date");
    setSortDir("desc");
    if (key === "all")                          fetchAll();
    if (key === "success" || key === "failed")  fetchByStatus(key);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const rows = data[activeTab];

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [r.full_name, r.email, r.mobile_number, r.challan_number,
       r.transaction_reference, r.payment_mode]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);

  const tab = STATUS_TABS.find((t) => t.key === activeTab);

  // ── Removed "Challan Total" column ──
  const COLS = [
    { key: "payment_date",          label: "Date & Time" },
    { key: "full_name",             label: "Payer" },
    { key: "challan_number",        label: "Challan No." },
    { key: "transaction_reference", label: "Txn. Ref.", noSort: true },
    { key: "payment_mode",          label: "Mode", noSort: true },
    { key: "amount",                label: "Amount" },
    { key: "challan_status",        label: "Challan", noSort: true },
    { key: "payment_status",        label: "Payment", noSort: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1 font-mono">Admin Panel</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Payment Management</h1>
            <p className="text-sm text-slate-400 mt-1">Track all payment transactions linked to challans.</p>
          </div>
          <StatsBar all={data.all} success={data.success} failed={data.failed} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all rounded-t-md
                ${activeTab === t.key
                  ? `${t.color} bg-slate-800/60`
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {/* Show badge as soon as we have a count, regardless of active tab */}
              {data[t.key].length > 0 && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${activeTab === t.key ? t.badge : "bg-slate-700/60 text-slate-400"}`}>
                  {data[t.key].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative">
            {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span> */}
            {/* <input
              type="text"
              placeholder="Search by name, challan no., txn ref., mode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-80
                         focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
            /> */}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              {sorted.length} / {rows.length} records
            </span>
            {sorted.length > 0 && (
              <span className="text-xs font-semibold text-emerald-400 font-mono">
                {fmtAmount(sorted.reduce((s, p) => s + Number(p.amount || 0), 0))} shown
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error[activeTab] && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-sm font-medium">
            ⚠ {error[activeTab]}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/60">
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
                  ? <EmptyState icon={tab.icon} />
                  : sorted.map((r, i) => (
                    <tr key={r.payment_id || i} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">

                      {/* Date & Time */}
                      <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                        {fmtDate(r.payment_date)}
                      </td>

                      {/* Payer */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-200 whitespace-nowrap">{r.full_name || "—"}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{r.mobile_number || r.email || ""}</div>
                      </td>

                      {/* Challan No. */}
                      <td className="px-4 py-3 font-mono text-xs font-bold text-sky-400 whitespace-nowrap">
                        {r.challan_number || "—"}
                      </td>

                      {/* Txn Reference */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {r.transaction_reference || "—"}
                      </td>

                      {/* Mode */}
                      <td className="px-4 py-3">
                        <ModeChip mode={r.payment_mode} />
                      </td>

                      {/* Amount Paid */}
                      <td className="px-4 py-3 text-sm font-bold font-mono text-white whitespace-nowrap">
                        {fmtAmount(r.amount)}
                      </td>

                      {/* Challan Status */}
                      <td className="px-4 py-3">
                        <ChallanStatusBadge status={r.challan_status} />
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={r.payment_status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading[activeTab] && sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-700/60 bg-slate-900/40 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-300">{sorted.length}</span> of{" "}
                <span className="font-semibold text-slate-300">{rows.length}</span> payments
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-semibold">
                  Collected: {fmtAmount(sorted.filter(p => p.payment_status === "success").reduce((s, p) => s + Number(p.amount || 0), 0))}
                </span>
                <span className="text-rose-400 font-semibold">
                  Failed: {fmtAmount(sorted.filter(p => p.payment_status === "failed").reduce((s, p) => s + Number(p.amount || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}