import { useState } from "react";
import { addViolationType } from "../../api/admin.js";
import { TriangleAlert, CheckCircle2, AlertCircle } from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const inputBase = "w-full rounded-xl px-[1rem] py-[0.875rem] text-[0.9375rem] outline-none transition-all duration-200";
const inputHandlers = {
    onFocus: (e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; },
    onBlur:  (e) => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; },
};

function FormInput({ label, name, value, onChange, placeholder }) {
    return (
        <div className="flex flex-col">
            <label className="text-[0.8125rem] font-medium uppercase tracking-[0.05em] mb-[0.7rem]"
                   style={{ color: MUTED }}>
                {label}
            </label>
            <input
                type="text" name={name} value={value} placeholder={placeholder}
                onChange={onChange}
                className={inputBase}
                style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                {...inputHandlers}
            />
        </div>
    );
}

const INITIAL = { description: "", penalty_amount: "", offence_section: "" };

export default function AddViolationType() {
    const [form, setForm]       = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError]     = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setMessage(null);
        try {
            await addViolationType(form);
            setMessage("Violation type added successfully.");
            setForm(INITIAL);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add violation type.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 py-8"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>
                    Admin Panel
                </p>
                <h1 className="text-[1.75rem] font-bold tracking-[-0.02em]" style={{ color: ON_SURFACE }}>
                    Add Violation Type
                </h1>
                <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>Create a new traffic violation entry.</p>
            </div>

            {/* ── Form ──────────────────────────────────────── */}
            <div className="px-8 py-8 flex justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl p-8 flex flex-col gap-6"
                      style={{ boxShadow: cardShadow }}>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                             style={{ background: "rgba(217,119,6,0.08)", color: "#d97706" }}>
                            <TriangleAlert size={18} />
                        </div>
                        <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>Violation Details</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                             style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    {message && (
                        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                             style={{ background: "#d4edda", color: "#2e7d32" }}>
                            <CheckCircle2 size={14} /> {message}
                        </div>
                    )}

                    <FormInput label="Violation Description" name="description"     placeholder="Driving without helmet"  value={form.description}     onChange={handleChange} />
                    <FormInput label="Penalty Amount"        name="penalty_amount"  placeholder="500"                    value={form.penalty_amount}  onChange={handleChange} />
                    <FormInput label="Offence Section"       name="offence_section" placeholder="Section 129/177 MV Act" value={form.offence_section} onChange={handleChange} />

                    {/* Ghost separator */}
                    <div style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }} />

                    {/* Actions */}
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 text-white font-semibold text-[0.875rem] px-6 py-2.5 rounded-[1.5rem] transition-all duration-200 active:scale-95"
                            style={{
                                background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                                boxShadow: "0 4px 16px rgba(0,63,135,0.28)",
                                border: "none", opacity: loading ? 0.65 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}>
                            {loading ? (
                                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Adding…</>
                            ) : "Add Violation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}