import { useState, useEffect } from "react";
import { getAllViolationTypes } from "../../api/officer.js";
import { Search, AlertCircle, ShieldAlert } from "lucide-react";

const TAG_STYLES = [
  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "bg-rose-500/15 text-rose-400 border-rose-500/25",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "bg-sky-500/15 text-sky-400 border-sky-500/25",
  "bg-purple-500/15 text-purple-400 border-purple-500/25",
  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
];

const SkeletonCard = () => (
  <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-3.5 animate-pulse">
    <div className="h-3.5 w-1/2 bg-slate-700/60 rounded-md" />
    <div className="h-5.5 w-4/5 bg-slate-700/60 rounded-md" />
    <div className="h-3.5 w-2/5 bg-slate-700/60 rounded-md" />
    <div className="h-3.5 w-3/5 bg-slate-700/60 rounded-md" />
  </div>
);

export default function ViolationTypes() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  // const [hovered, setHovered] = useState(null);

  useEffect(() => {
    getAllViolationTypes()
      .then((res) => {
        setViolations(res.data?.data || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load violation types.");
        setLoading(false);
      });
  }, []);

  const filtered = violations.filter((v) =>
    (v.name || v.violationType || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 md:px-12 py-6 flex items-end justify-between gap-5 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-1.5">
            Officer Panel
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Violation Types</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Loading..." : `${filtered.length} violation${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search violations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-8">
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/25 rounded-2xl px-6 py-4 text-rose-400 text-sm font-medium flex items-center gap-2 mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
              <Search size={28} />
            </div>
            <div>
              <p className="text-white font-medium">No results found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {filtered.map((v, i) => {
              const tag = TAG_STYLES[i % TAG_STYLES.length];
              const name = v.description || "Unknown";
              const fine = v.penalty_amount || 1000;
              const desc = v.description || null;
              const code = v.offence_section || null;
              console.log(code);
              return (
                <div
                  key={v.violation_type_id || i}
                  className="group bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-3 hover:border-sky-500/30 hover:bg-slate-800/70 transition-all duration-200"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border whitespace-nowrap ${tag}`}>
                      <ShieldAlert size={12} />
                      Violation
                    </span>
                    {code && (
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-900/60 border border-slate-700/60 px-2 py-1 rounded-md">
                        {code}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="text-[17px] font-bold text-white leading-snug tracking-tight">
                    {name}
                  </div>

                  {/* Description */}
                  {desc && (
                    <div className="text-[13.5px] text-slate-400 leading-relaxed">
                      {desc}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-700/50 mt-1" />

                  {/* Fine */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Fine Amount</span>
                    <span className={`text-[16px] font-bold font-mono ${fine != null ? "text-emerald-400" : "text-slate-500"}`}>
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