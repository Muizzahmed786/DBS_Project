import { useEffect, useState } from "react";
import { getMyPaymentHistory } from "../../api/citizen.js";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const STATUS_CONFIG = {
  success: { label: "Success", icon: CheckCircle, classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  paid: { label: "Success", icon: CheckCircle, classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  failed: { label: "Failed", icon: XCircle, classes: "bg-red-500/15 text-red-400 border-red-500/25" },
  pending: { label: "Pending", icon: Clock, classes: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getMyPaymentHistory();
        setPayments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "success" || p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
      {/* Header — matches Challans / Vehicles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payment History</h1>
          <p className="text-slate-400 text-sm mt-1">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} recorded
            {totalPaid > 0 && (
              <span className="ml-2 text-emerald-400 font-mono">
                · ₹{totalPaid.toLocaleString("en-IN")} paid
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

      {/* Empty State */}
      {!loading && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-white font-medium">No payments found</p>
            <p className="text-slate-500 text-sm mt-1">Your payment history will appear here</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && payments.length > 0 && (
        <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/60 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Txn ID</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium">Mode</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Time</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {payments.map((p) => (
                <tr key={p.payment_id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-300">{p.transaction_reference}</td>
                  <td className="px-5 py-3.5 font-semibold text-white">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-slate-300">{p.payment_mode}</td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(p.payment_date)}</td>
                  <td className="px-5 py-3.5 text-slate-400">{formatTime(p.payment_date)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
