import { useState } from "react";
import { addAdminOrOfficer } from "../../api/admin.js";
import { CheckCircle2, AlertTriangle } from "lucide-react";

// ─── Field Config ──────────────────────────────────────────

const FIELDS = [
  { name: "full_name",      label: "Full Name",      type: "text",     placeholder: "John Doe" },
  { name: "email",          label: "Email",          type: "email",    placeholder: "john@example.com" },
  { name: "mobile_number",  label: "Mobile Number",  type: "tel",      placeholder: "9876543210" },
  { name: "aadhaar_number", label: "Aadhaar Number", type: "text",     placeholder: "1234 5678 9012" },
  { name: "password",       label: "Password",       type: "password", placeholder: "••••••••" },
];

const INITIAL_FORM = {
  full_name: "",
  email: "",
  mobile_number: "",
  aadhaar_number: "",
  password: "",
  role: "admin",
};

// ─── Main Component ────────────────────────────────────────

export default function AddUsers() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);   // created user object
  const [error, setError]     = useState(null);

  // ─── Handlers ───────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await addAdminOrOfficer(form);
      setSuccess(res.data?.data || res.data);
      setForm(INITIAL_FORM);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(form).every((v) => v.trim() !== "");

  return (
    <div className="min-h-screen bg-blue-50/40">

      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          Admin Panel
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Add Admin / Officer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new admin or officer account
        </p>
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-8 max-w-2xl mx-auto">

        {/* Success Banner */}
        {success && (
          <div className="mb-6 px-4 py-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> User created successfully
            </p>
            <p className="text-emerald-700">
              <span className="font-medium">{success.full_name}</span> —{" "}
              <span className="capitalize bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
                {success.role}
              </span>{" "}
              · {success.email}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Text Fields — side by side on sm+ screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
                  >
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  />
                </div>
              ))}
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Role
              </label>
              <div className="flex gap-3">
                {["admin", "officer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition capitalize ${
                      form.role === r
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-blue-100 pt-2" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
            >
              {loading ? "Creating..." : `Create ${form.role === "admin" ? "Admin" : "Officer"}`}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}