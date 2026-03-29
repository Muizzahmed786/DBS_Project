import { useState, useEffect, useMemo } from "react";
import { getAllCitizens, getAllOfficers, getAllAdmins } from "./adminAPI.js";
 
const TABS = [
  { key: "citizen", label: "Citizens", icon: "👤", badge: "bg-blue-100 text-blue-700", active: "border-blue-600 text-blue-600", indicator: "bg-blue-600" },
  { key: "officer", label: "Officers", icon: "🛡️", badge: "bg-cyan-100 text-cyan-700", active: "border-cyan-600 text-cyan-600", indicator: "bg-cyan-600" },
  { key: "admin",   label: "Admins",   icon: "⚙️", badge: "bg-violet-100 text-violet-700", active: "border-violet-600 text-violet-600", indicator: "bg-violet-600" },
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
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
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
  <tr className="border-b border-slate-100">
    {[40, 55, 45, 50, 40, 30].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);
 
const EmptyState = ({ tab }) => (
  <tr>
    <td colSpan={6} className="py-20 text-center">
      <div className="text-4xl mb-3">{tab.icon}</div>
      <p className="text-slate-500 font-medium">No {tab.label.toLowerCase()} found</p>
      <p className="text-slate-400 text-sm mt-1">Try adjusting your search.</p>
    </td>
  </tr>
);
 
export default function UserManagement() {
  const [activeTab, setActiveTab]     = useState("citizen");
  const [data, setData]               = useState({ citizen: [], officer: [], admin: [] });
  const [loading, setLoading]         = useState({ citizen: false, officer: false, admin: false });
  const [error, setError]             = useState({ citizen: null, officer: null, admin: null });
  const [search, setSearch]           = useState("");
  const [sortCol, setSortCol]         = useState("created_at");
  const [sortDir, setSortDir]         = useState("desc");
  const [showAadhaar, setShowAadhaar] = useState(false);
 
  const fetchTab = async (tab) => {
    if (data[tab].length > 0) return;
    setLoading((p) => ({ ...p, [tab]: true }));
    try {
      const fetchers = { citizen: getAllCitizens, officer: getAllOfficers, admin: getAllAdmins };
      const res = await fetchers[tab]();
      setData((p) => ({ ...p, [tab]: res.data?.data || res.data || [] }));
    } catch {
      setError((p) => ({ ...p, [tab]: "Failed to load data." }));
    } finally {
      setLoading((p) => ({ ...p, [tab]: false }));
    }
  };
 
  useEffect(() => { fetchTab("citizen"); }, []);
 
  const handleTab = (key) => {
    setActiveTab(key);
    setSearch("");
    fetchTab(key);
  };
 
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };
 
  const tab = TABS.find((t) => t.key === activeTab);
  const rows = data[activeTab];
 
  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [r.full_name, r.email, r.mobile_number].some((v) => (v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);
 
  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="ml-1 text-slate-300 text-xs">⇅</span>;
    return <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };
 
  return (
    <div className="min-h-screen bg-slate-50">
 
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage citizens, officers, and admins.</p>
          </div>
 
          {/* Summary Badges */}
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
                  ? `${t.active} bg-slate-50`
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {data[t.key].length > 0 && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${activeTab === t.key ? t.badge : "bg-slate-100 text-slate-500"}`}>
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder={`Search ${tab.label.toLowerCase()} by name, email or mobile…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-72
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
 
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {sorted.length} record{sorted.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setShowAadhaar((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600
                         border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition"
            >
              {showAadhaar ? "🙈 Hide" : "👁 Show"} Aadhaar
            </button>
          </div>
        </div>
 
        {/* Error */}
        {error[activeTab] && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error[activeTab]}
          </div>
        )}
 
        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => !col.noSort && handleSort(col.key)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                                  ${!col.noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
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
                    <tr key={row.user_id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
 
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.full_name} index={i} />
                          <span className="font-medium text-slate-800 whitespace-nowrap">{row.full_name || "—"}</span>
                        </div>
                      </td>
 
                      {/* Email */}
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{row.email || "—"}</td>
 
                      {/* Mobile */}
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {row.mobile_number || "—"}
                      </td>
 
                      {/* Aadhaar */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {showAadhaar ? (row.aadhaar_number || "—") : maskAadhaar(row.aadhaar_number)}
                      </td>
 
                      {/* Joined */}
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {fmtDate(row.created_at)}
                      </td>
 
                      {/* User ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
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
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">{sorted.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{rows.length}</span>{" "}
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