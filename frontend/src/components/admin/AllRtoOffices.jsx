import { useState, useEffect } from "react";
import { getAllRtoOffices } from "../../api/admin.js";

// ─── Skeleton Row ─────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-slate-700/60 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ─── Main Component ────────────────────────────────────────

export default function RtoOffices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllRtoOffices()
      .then((res) => {
        setOffices(res.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load RTO offices.");
        setLoading(false);
      });
  }, []);

  // ─── Search Filter ───────────────────────────────────────

  const filtered = offices.filter((o) =>
    [
      o.rto_id,
      o.rto_code,
      o.rto_name,
      o.state,
      o.district,
      o.address,
      o.contact_number,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="max-h-screen bg-slate-950">

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-1 font-mono">
            Admin Panel
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            RTO Offices
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? "Loading..." : `${filtered.length} offices`}
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, code, state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-700/60 bg-slate-900/60 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/60 w-64"
        />
      </div>

      {/* ── Content ── */}
      <div className="px-8 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-800/50 h-[550px] rounded-2xl border border-slate-700/60 overflow-auto">
          <table className="w-full min-w-[1000px] border-collapse">

            {/* Head */}
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">District</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No offices found
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => (
                  <tr
                    key={o.rto_id || i}
                    className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-sky-400">
                      {o.rto_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {o.rto_code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {o.rto_name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {o.state}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {o.district}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {o.address}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {o.contact_number
                        ? `+91 ${o.contact_number}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}