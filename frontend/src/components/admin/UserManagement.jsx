import { useState, useEffect, useMemo } from "react";
import { getAllCitizens, getAllOfficers, getAllAdmins } from "../../api/admin.js";

const TABS = [
  { key: "citizen", label: "Citizens", icon: "👤", badge: "bg-sky-500/15 text-sky-400",     active: "border-sky-500 text-sky-400" },
  { key: "officer", label: "Officers", icon: "🛡️", badge: "bg-cyan-500/15 text-cyan-400",   active: "border-cyan-500 text-cyan-400" },
  { key: "admin",   label: "Admins",   icon: "⚙️", badge: "bg-purple-500/15 text-purple-400", active: "border-purple-500 text-purple-400" },
];

const COLUMNS = [
  { key: "full_name",      label: "Name" },
  { key: "email",          label: "Email" },
  { key: "mobile_number",  label: "Mobile" },
  { key: "aadhaar_number", label: "Aadhaar", noSort: true },
  { key: "created_at",     label: "Joined" },
  { key: "user_id",        label: "User ID", noSort: true },
];

const AVATAR_COLORS = [
  "bg-sky-500/15 text-sky-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-orange-500/15 text-orange-400",
  "bg-purple-500/15 text-purple-400",
  "bg-rose-500/15 text-rose-400",
  "bg-cyan-500/15 text-cyan-400",
];

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const maskAadhaar = (num) => {
  if (!num) return "—";
  return "•••• •••• " + String(num).slice(-4);
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const Avatar = ({ name, index }) => (
  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
    {getInitials(name)}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-700/40">
    {[40, 55, 45, 50, 40, 30].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-700/60 animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ tab }) => (
  <tr>
    <td colSpan={6} className="py-20 text-center">
      <div className="text-4xl mb-3">{tab.icon}</div>
      <p className="text-slate-400 font-medium">No {tab.label.toLowerCase()} found</p>
    </td>
  </tr>
);

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

  // Fetch all three tabs upfront so summary badges always show counts
  useEffect(() => {
    fetchTab("citizen");
    fetchTab("officer");
    fetchTab("admin");
  }, []);

  const handleTab = (key) => {
    setActiveTab(key);
    setSortCol("created_at");
    setSortDir("desc");
    fetchTab(key);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const tab  = TABS.find((t) => t.key === activeTab);
  const rows = data[activeTab];

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, sortCol, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="ml-1 text-slate-600 text-xs">⇅</span>;
    return <span className="ml-1 text-xs text-sky-400">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1 font-mono">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage citizens, officers, and admins.</p>
          </div>

          {/* Summary Badges — always populated because all tabs are pre-fetched */}
          <div className="flex flex-wrap gap-2 items-center self-center">
            {TABS.map((t) => (
              <span key={t.key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${t.badge}`}>
                {t.icon}
                <span className="font-mono">{data[t.key].length || "—"}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all rounded-t-md
                ${activeTab === t.key
                  ? `${t.active} bg-slate-800/60`
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
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

        {/* Toolbar — only Aadhaar toggle + record count, no search */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 font-mono">
            {sorted.length} record{sorted.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowAadhaar((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300
                       border border-slate-700/60 rounded-lg bg-slate-800/50 hover:bg-slate-700/40 transition"
          >
            {showAadhaar ? "🙈 Hide" : "👁 Show"} Aadhaar
          </button>
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
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => !col.noSort && handleSort(col.key)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                                  ${!col.noSort ? "cursor-pointer hover:text-slate-200 select-none" : ""}`}
                    >
                      {col.label}
                      {!col.noSort && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading[activeTab]
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : sorted.length === 0
                  ? <EmptyState tab={tab} />
                  : sorted.map((row, i) => (
                    <tr key={row.user_id || i} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.full_name} index={i} />
                          <span className="font-medium text-slate-200 whitespace-nowrap">{row.full_name || "—"}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{row.email || "—"}</td>

                      {/* Mobile */}
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                        {row.mobile_number || "—"}
                      </td>

                      {/* Aadhaar */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {showAadhaar ? (row.aadhaar_number || "—") : maskAadhaar(row.aadhaar_number)}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {fmtDate(row.created_at)}
                      </td>

                      {/* User ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400 bg-slate-700/60 px-2 py-1 rounded">
                          {row.user_id || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading[activeTab] && sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-300">{sorted.length}</span> of{" "}
                <span className="font-semibold text-slate-300">{rows.length}</span>{" "}
                {tab.label.toLowerCase()}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tab.badge}`}>
                {tab.icon} {tab.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}