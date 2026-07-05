import { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle2, CreditCard, Landmark, Zap, Lock, ChevronRight, FileText, X, Car,
} from "lucide-react";
import { getChallansByStatus, makePayment } from "../../api/citizen.js";
import toast from "react-hot-toast";

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
      toast.success("Payment Successfull");
    } catch (err) {
      setError(err.message);
      toast.error("Payment Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-2xl">
        {done ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-slate-900 font-semibold text-lg">Payment Successful</p>
            <p className="text-slate-400 text-sm">
              ₹{Number(challan.total_amount).toLocaleString("en-IN")} paid for
              challan&nbsp;#{challan.challan_number}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-blue-100">
              <div>
                <p className="text-indigo-500 text-xs font-medium uppercase tracking-widest mb-0.5">
                  Pay Challan
                </p>
                <h2 className="text-slate-800 font-semibold text-base">
                  #{challan.challan_number} —{" "}
                  <span className="text-indigo-600 ">
                    ₹{Number(challan.total_amount).toLocaleString("en-IN")}
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Violation summary */}
              <div className="bg-indigo-50/60 border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-600">
                <span className="text-slate-400 text-xs">Violation · </span>
                {challan.description || "Traffic Violation"}
                {challan.registration_number && (
                  <>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className=" text-slate-600">
                      {challan.registration_number}
                    </span>
                  </>
                )}
              </div>

              {/* Payment mode */}
              <div>
                <label className="text-slate-500 text-xs font-medium block mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_MODES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMode(id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                        paymentMode === id
                          ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                          : "border-blue-100 bg-white text-slate-500 hover:border-blue-200 hover:text-slate-700"
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
                <label className="text-slate-500 text-xs font-medium block mb-1.5">
                  Authorize with Password
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePay()}
                    placeholder="Enter your account password"
                    className="w-full bg-white border border-blue-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs">
                    <AlertCircle size={12} />
                    {error}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-blue-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-800 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2 rounded-lg transition-all duration-200 active:scale-95"
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
  const date = new Date(challan.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group bg-white border border-blue-100 rounded-2xl shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-default">
      {/* Icon row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-200">
          <FileText size={20} />
        </div>
        <span className="inline-flex items-center gap-1.5 bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Pending
        </span>
      </div>

      {/* Amount */}
      <p className=" text-xl font-bold text-slate-900 tracking-tight mb-1">
        ₹{Number(challan.total_amount).toLocaleString("en-IN")}
      </p>

      {/* Description */}
      <p className="text-slate-500 text-sm mb-4 line-clamp-1">
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
          <div key={label} className="bg-indigo-50/40 rounded-lg px-3 py-2">
            <p className="text-slate-400 text-xs mb-0.5">{label}</p>
            <p className="text-slate-600 text-xs font-medium  truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Divider + action */}
      <div className="pt-4 border-t border-blue-100 flex items-center justify-between">
        <span className="text-slate-400 text-xs ">ID: {challan.challan_number}</span>
        <button
          onClick={() => onPayClick(challan)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
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
  console.log(challans);

  return (
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          My Account
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pay Challans</h1>
        <p className="text-sm text-slate-500 mt-1">
          {pending.length} pending challan{pending.length !== 1 ? "s" : ""}
          {pending.length > 0 && (
            <span className="ml-2 text-amber-600">
              · ₹{totalDue.toLocaleString("en-IN")} due
            </span>
          )}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-rose-200 rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-slate-800 font-medium text-sm">Failed to load challans</p>
              <p className="text-slate-400 text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 hover:text-indigo-700 text-xs underline underline-offset-2 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && pending.length === 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-blue-100 flex items-center justify-center text-indigo-400">
              <Car size={28} />
            </div>
            <div>
              <p className="text-slate-800 font-medium">No pending challans</p>
              <p className="text-slate-400 text-sm mt-1">
                You're all clear — no outstanding violations
              </p>
            </div>
          </div>
        )}

        {/* Challan Grid */}
        {!loading && !error && pending.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map((c) => (
              <ChallanCard key={c.challan_id} challan={c} onPayClick={setSelectedChallan} />
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
    </div>
  );
};

export default ChallanPayment;