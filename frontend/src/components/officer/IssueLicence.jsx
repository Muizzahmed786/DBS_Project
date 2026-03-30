import { useState } from "react";
import { issueDrivingLicence } from "../../api/officer.js"; // adjust path as needed

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  { code: "MCWG", label: "Motorcycle with Gear", icon: "🏍️" },
  { code: "MCWOG", label: "Motorcycle without Gear", icon: "🛵" },
  { code: "LMV", label: "Light Motor Vehicle", icon: "🚗" },
  { code: "LMV-TR", label: "LMV Transport", icon: "🚐" },
  { code: "HMV", label: "Heavy Motor Vehicle", icon: "🚛" },
  { code: "HTV", label: "Heavy Transport Vehicle", icon: "🚌" },
];

const VALIDITY_OPTIONS = [5, 10, 20];

const STEPS = ["Applicant", "Licence Details", "Review"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepBar = ({ current }) => (
  <div className="flex items-center mb-10">
    {STEPS.map((label, i) => (
      <div key={label} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
              i < current
                ? "bg-teal-500 border-teal-500 text-white"
                : i === current
                ? "bg-white border-teal-500 text-teal-600"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-[10px] font-bold tracking-widest uppercase ${
              i === current ? "text-teal-600" : i < current ? "text-teal-400" : "text-slate-400"
            }`}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className={`h-px w-14 sm:w-20 mx-2 mb-5 transition-all duration-500 ${
              i < current ? "bg-teal-400" : "bg-slate-200"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const Field = ({ label, required, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

const TextInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono"
  />
);

const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-3 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
    <span className="text-sm text-slate-800 font-semibold text-right break-all">{value || "—"}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IssueLicence() {
  const [step, setStep] = useState(0);
  const [lookupMethod, setLookupMethod] = useState("email"); // "email" | "mobile"
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    rtoId: "",
    vehicle_categories: [],
    validity_years: 20,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const toggleCategory = (code) => {
    setForm((p) => ({
      ...p,
      vehicle_categories: p.vehicle_categories.includes(code)
        ? p.vehicle_categories.filter((c) => c !== code)
        : [...p.vehicle_categories, code],
    }));
    if (errors.vehicle_categories) setErrors((p) => ({ ...p, vehicle_categories: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (lookupMethod === "email" && !form.email.trim()) e.email = "Email is required";
      else if (lookupMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email address";
      if (lookupMethod === "mobile" && !form.mobile.trim()) e.mobile = "Mobile number is required";
      else if (lookupMethod === "mobile" && !/^\d{10}$/.test(form.mobile))
        e.mobile = "Enter a valid 10-digit mobile number";
    }
    if (step === 1) {
      if (!form.rtoId.trim()) e.rtoId = "RTO ID is required";
      if (form.vehicle_categories.length === 0)
        e.vehicle_categories = "Select at least one vehicle category";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setApiError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        rtoId: form.rtoId.trim().toUpperCase(),
        vehicle_categories: form.vehicle_categories.join(","),
        validity_years: form.validity_years,
        ...(lookupMethod === "email"
          ? { email: form.email.trim().toLowerCase() }
          : { mobile: form.mobile.trim() }),
      };
      const { data } = await issueDrivingLicence(payload);
      setResult(data.data);
      setStep(3);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to issue licence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ email: "", mobile: "", rtoId: "", vehicle_categories: [], validity_years: 20 });
    setErrors({});
    setResult(null);
    setApiError(null);
    setStep(0);
    setLookupMethod("email");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 flex items-start justify-center py-12 px-4"
      style={{ fontFamily: "'Sora', 'Nunito', sans-serif" }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
            <span className="text-white text-lg">🪪</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Issue Driving Licence</h1>
            <p className="text-xs text-slate-500">Motor Vehicles Department · Officer Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
          {/* ── Success ── */}
          {step === 3 && result ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-teal-50 border-2 border-teal-200 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-teal-700">Licence Issued!</h2>
                <p className="text-xs text-slate-500 mt-1">The driving licence has been created successfully</p>
              </div>

              {/* DL Card Preview */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-left text-white shadow-lg shadow-teal-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-teal-300 text-[10px] uppercase tracking-widest">Driving Licence</p>
                    <p className="text-xl font-black tracking-widest mt-0.5">{result.licence_number}</p>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">{result.status?.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { l: "Issue Date", v: result.issue_date },
                    { l: "Expiry Date", v: result.expiry_date },
                    { l: "Issuing RTO", v: result.issuing_rto_id },
                    { l: "Categories", v: result.vehicle_categories },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <p className="text-teal-300 text-[10px] uppercase tracking-wider">{l}</p>
                      <p className="font-bold mt-0.5 font-mono">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm tracking-wide transition-all"
              >
                Issue Another Licence
              </button>
            </div>
          ) : (
            <>
              <StepBar current={step} />

              {/* ── Step 0: Applicant ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="mb-2">
                    <h2 className="text-base font-black text-slate-800">Applicant Lookup</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Find the citizen by email or mobile number</p>
                  </div>

                  {/* Toggle */}
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {[
                      { key: "email", label: "📧 Email" },
                      { key: "mobile", label: "📱 Mobile" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setLookupMethod(key);
                          setErrors({});
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          lookupMethod === key
                            ? "bg-white text-teal-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {lookupMethod === "email" ? (
                    <Field label="Email Address" required error={errors.email}>
                      <TextInput
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="citizen@example.com"
                        type="email"
                      />
                    </Field>
                  ) : (
                    <Field label="Mobile Number" required error={errors.mobile}>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleChange}
                          placeholder="9876543210"
                          maxLength={10}
                          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono"
                        />
                      </div>
                    </Field>
                  )}
                </div>
              )}

              {/* ── Step 1: Licence Details ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="text-base font-black text-slate-800">Licence Configuration</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Set RTO, vehicle categories and validity</p>
                  </div>

                  <Field label="Issuing RTO ID" required error={errors.rtoId} hint="e.g. KA05, MH12">
                    <TextInput
                      name="rtoId"
                      value={form.rtoId}
                      onChange={handleChange}
                      placeholder="KA05"
                    />
                  </Field>

                  <Field label="Vehicle Categories" required error={errors.vehicle_categories}>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {VEHICLE_CATEGORIES.map(({ code, label, icon }) => {
                        const selected = form.vehicle_categories.includes(code);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => toggleCategory(code)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                              selected
                                ? "bg-teal-50 border-teal-400 text-teal-800"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-base">{icon}</span>
                            <span className="leading-tight">
                              <span className="block font-bold text-[11px]">{code}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{label}</span>
                            </span>
                            {selected && <span className="ml-auto text-teal-500 text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Validity Period">
                    <div className="flex gap-2">
                      {VALIDITY_OPTIONS.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, validity_years: yr }))}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                            form.validity_years === yr
                              ? "bg-teal-600 border-teal-600 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {yr} yr{yr > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Step 2: Review ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="mb-2">
                    <h2 className="text-base font-black text-slate-800">Review & Confirm</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Verify all details before issuing the licence</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2">
                    <ReviewRow
                      label={lookupMethod === "email" ? "Email" : "Mobile"}
                      value={lookupMethod === "email" ? form.email : `+91 ${form.mobile}`}
                    />
                    <ReviewRow label="RTO ID" value={form.rtoId.toUpperCase()} />
                    <ReviewRow
                      label="Vehicle Categories"
                      value={form.vehicle_categories.join(", ") || "—"}
                    />
                    <ReviewRow label="Validity" value={`${form.validity_years} years`} />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-2">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      This action will issue a permanent driving licence to the applicant. Please ensure all details are correct before proceeding.
                    </p>
                  </div>

                  {apiError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex gap-2">
                      <span className="text-rose-500 flex-shrink-0">⚠</span>
                      <p className="text-xs text-rose-700">{apiError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation ── */}
              <div className={`flex gap-3 mt-8 ${step > 0 ? "justify-between" : "justify-end"}`}>
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 rounded-2xl transition-all disabled:opacity-40"
                  >
                    ← Back
                  </button>
                )}

                {step < 2 ? (
                  <button
                    onClick={handleNext}
                    className="px-7 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm tracking-wide transition-all active:scale-95 shadow-lg shadow-teal-200"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-7 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-bold rounded-2xl text-sm tracking-wide transition-all active:scale-95 shadow-lg shadow-teal-200 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Issuing…
                      </>
                    ) : (
                      "🪪 Issue Licence"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Authorized Officer Use Only · Motor Vehicles Department
        </p>
      </div>
    </div>
  );
}