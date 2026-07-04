import { useState, useEffect } from "react";
import { getAllRtoOffices } from "../../api/admin.js";
import { AlertTriangle } from "lucide-react";

// ─── Skeleton Row ─────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-slate-100 rounded w-full" />
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
    <div className="min-h-screen bg-blue-50/40">

      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-1">
            Admin Panel
          </p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            RTO Offices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading..." : `${filtered.length} offices`}
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, code, state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-64"
        />
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-6">

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white h-[550px] rounded-2xl border border-blue-100 shadow-sm overflow-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            
            {/* Head */}
            <thead className="bg-blue-50/50">
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
                    className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-blue-600">
                      {o.rto_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.rto_code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {o.rto_name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.state}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.district}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {o.address}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
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