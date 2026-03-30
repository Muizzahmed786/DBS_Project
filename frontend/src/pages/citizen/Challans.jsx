import { useEffect, useState } from "react";
import { getAllChallans, getChallansByStatus } from "../../api/citizen";
import { ReceiptText, AlertCircle, CheckCircle2, Clock, IndianRupee, Car } from "lucide-react";

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock,
        classes: "bg-amber-500/15 text-amber-400 border-amber-500/25",
        dot: "bg-amber-400",
    },
    paid: {
        label: "Paid",
        icon: CheckCircle2,
        classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-400",
    },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        classes: "bg-slate-500/15 text-slate-400 border-slate-500/25",
        dot: "bg-slate-400",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

const FILTERS = [
    { value: "all",     label: "All" },
    { value: "pending", label: "Pending" },
    { value: "paid",    label: "Paid" },
];

const Challans = () => {
    const [challans, setChallans] = useState([]);
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(false);

    // payment form data
    const [selectedChallan, setSelectedChallan] = useState(null);
    const [password, setPassword] = useState("");
    const [paymentMode, setPaymentMode] = useState("UPI");



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

    const handlePayClick = (challan_id) => {
        setSelectedChallan(challan_id);
        setPassword("");
        setPaymentMode("UPI");
        
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Challans</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {challans.length} challan{challans.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl self-start">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatus(f.value)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                status === f.value
                                    ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && challans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                        <ReceiptText size={28} />
                    </div>
                    <div>
                        <p className="text-white font-medium">No challans found</p>
                        <p className="text-slate-500 text-sm mt-1">You're all clear for this filter</p>
                    </div>
                </div>
            )}

            {/* Challan Cards */}
            {!loading && (
                <div className="space-y-3">
                    {challans.map((c) => (
                        <div
                            key={c.challan_id}
                            className="group bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-sky-500/30 hover:bg-slate-800/70 transition-all duration-200"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Left Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-all duration-200">
                                        <Car size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-sm">{c.vehicle_number}</p>
                                        <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{c.description}</p>
                                    </div>
                                </div>

                                {/* Right: Amount + Status */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                                    <div className="flex items-center gap-1 text-white font-bold text-lg">
                                        <IndianRupee size={16} className="text-slate-400" />
                                        {c.total_amount}
                                    </div>
                                    <StatusBadge status={c.status} />
                                    {c.status === "pending" && (
                                        <button className="bg-green-500 px-3 py-1 rounded" onClick={() => handlePayClick(c.challan_id)}>
                                            Pay
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Challans;