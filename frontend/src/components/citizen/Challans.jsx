import { useEffect, useState } from "react";
import { getAllChallans, getChallansByStatus } from "../../api/citizen";
import { ReceiptText, CheckCircle2, Clock, IndianRupee, Car } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-400",
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      let res;
      if (status === "all") {
        res = await getAllChallans();
      } else {
        res = await getChallansByStatus(status);
      }
      setChallans(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [status]);

  return (
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
              Citizen Portal
            </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Challans</h1>
            <p className="text-sm text-slate-500 mt-1">
              {challans.length} challan{challans.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-1 bg-indigo-50/60 border border-blue-100 rounded-xl self-start">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  status === f.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[560px] mt-8 overflow-auto max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && challans.length === 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-blue-100 flex items-center justify-center text-indigo-400">
              <ReceiptText size={28} />
            </div>
            <div>
              <p className="text-slate-800 font-medium">No challans found</p>
              <p className="text-slate-400 text-sm mt-1">You're all clear for this filter</p>
            </div>
          </div>
        )}

        {/* Challan Cards */}
        {!loading && (
          <div className="space-y-3">
            {challans.map((c) => (
              <div
                key={c.challan_id}
                className="group bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-200">
                      <Car size={18} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-slate-900 font-semibold text-[16px] truncate">
                        {c.full_name}
                      </p>

                      <p className="text-slate-600 font-medium text-[13px]">{c.vehicle_number}</p>

                      {/* Tertiary */}
                      <p className="text-slate-500 text-[13px]">{c.description}</p>

                      {/* Meta Info */}
                      <div className="text-slate-400 text-[12px] flex flex-wrap gap-x-3">
                        <span>{c.location} | </span>
                        <span>{formatDateTime(c.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Status */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-lg">
                      <IndianRupee size={16} className="text-slate-400" />
                      {c.total_amount}
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default Challans;