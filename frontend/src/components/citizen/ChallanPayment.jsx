import { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle2, CreditCard, Landmark, Zap, Lock, ChevronRight, FileText, X, Car,
} from "lucide-react";
import { getChallansByStatus, makePayment } from "../../api/citizen.js";

const PAYMENT_MODES = [
  { id: "UPI", label: "UPI", Icon: Zap },
  { id: "Card", label: "Card", Icon: CreditCard },
  { id: "NetBanking", label: "Net Banking", Icon: Landmark },
];

const PaymentModal = ({ challan, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    if (!password.trim()) {
      setError("Password is required to authorize payment.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await makePayment({
        challan_id: challan.challan_id,
        password,
        payment_mode: paymentMode,
      });
      setDone(true);
      setTimeout(() => {
        onSuccess(res.data);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — matches Vehicles form card */}
      <div className="relative w-full max-w-md bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
        {done ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-white font-semibold text-lg">Payment Successful</p>
            <p className="text-slate-400 text-sm">
              ₹{Number(challan.total_amount).toLocaleString("en-IN")} paid for
              challan&nbsp;#{challan.challan_number}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700/50">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-0.5">
                  Pay Challan
                </p>
                <h2 className="text-white font-semibold text-base">
                  #{challan.challan_number} —{" "}
                  <span className="text-sky-400 font-mono">
                    ₹{Number(challan.total_amount).toLocaleString("en-IN")}
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Violation summary */}
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-400">
                <span className="text-slate-500 text-xs">Violation · </span>
                {challan.description || "Traffic Violation"}
                {challan.registration_number && (
                  <>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="font-mono text-slate-300">
                      {challan.registration_number}
                    </span>
                  </>
                )}
              </div>

              {/* Payment mode */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_MODES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMode(id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${paymentMode === id
                          ? "border-sky-500 bg-sky-500/10 text-sky-400"
                          : "border-slate-700 bg-slate-900/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                        }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">
                  Authorize with Password
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePay()}
                    placeholder="Enter your account password"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                    <AlertCircle size={12} />
                    {error}
                  </div>
                )}
              </div>

              {/* Actions — matches Vehicles form footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Pay ₹{Number(challan.total_amount).toLocaleString("en-IN")}
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Challan Card ──────────────────────────────────────────────────────────────
const ChallanCard = ({ challan, onPayClick }) => {
  const date = new Date(challan.violation_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-sky-500/30 hover:bg-slate-800/70 transition-all duration-200 cursor-default">
      {/* Icon row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center text-slate-400 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-all duration-200">
          <FileText size={20} />
        </div>
        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Pending
        </span>
      </div>

      {/* Amount */}
      <p className="font-mono text-xl font-bold text-white tracking-tight mb-1">
        ₹{Number(challan.total_amount).toLocaleString("en-IN")}
      </p>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-1">
        {challan.description || "Traffic Violation"}
      </p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Vehicle", val: challan.registration_number || "—" },
          { label: "Date", val: date },
          { label: "Licence", val: challan.licence_number || "—" },
          { label: "Vehicle Class", val: challan.vehicle_class || "—" },
        ].map(({ label, val }) => (
          <div key={label} className="bg-slate-900/60 rounded-lg px-3 py-2">
            <p className="text-slate-600 text-xs mb-0.5">{label}</p>
            <p className="text-slate-300 text-xs font-medium font-mono truncate">
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Divider + action */}
      <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-slate-600 text-xs font-mono">
          ID: {challan.challan_number}
        </span>
        <button
          onClick={() => onPayClick(challan)}
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
        >
          Pay Now
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ChallanPayment = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [paidIds, setPaidIds] = useState(new Set());

  useEffect(() => {
    const fetchChallans = async () => {
      setLoading(true);
      try {
        const res = await getChallansByStatus("pending");
        setChallans(res.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChallans();
  }, []);

  const handleSuccess = () => {
    setPaidIds((prev) => new Set([...prev, selectedChallan.challan_id]));
    setSelectedChallan(null);
  };

  const pending = challans.filter((c) => !paidIds.has(c.challan_id));
  const totalDue = pending.reduce((s, c) => s + Number(c.total_amount), 0);
  console.log(challans)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">

      {/* Header — mirrors Vehicles header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Challans
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {pending.length} pending challan{pending.length !== 1 ? "s" : ""}
            {pending.length > 0 && (
              <span className="ml-2 text-amber-400 font-mono">
                · ₹{totalDue.toLocaleString("en-IN")} due
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-slate-800/60 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Failed to load challans</p>
            <p className="text-slate-500 text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sky-400 hover:text-sky-300 text-xs underline underline-offset-2 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state — mirrors Vehicles empty state */}
      {!loading && !error && pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
            <Car size={28} />
          </div>
          <div>
            <p className="text-white font-medium">No pending challans</p>
            <p className="text-slate-500 text-sm mt-1">
              You're all clear — no outstanding violations
            </p>
          </div>
        </div>
      )}

      {/* Challan Grid — same 2-col grid as Vehicles */}
      {!loading && !error && pending.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pending.map((c) => (
            <ChallanCard
              key={c.challan_id}
              challan={c}
              onPayClick={setSelectedChallan}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedChallan && (
        <PaymentModal
          challan={selectedChallan}
          onClose={() => setSelectedChallan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ChallanPayment;