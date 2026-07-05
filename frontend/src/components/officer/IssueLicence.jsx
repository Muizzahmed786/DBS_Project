import { useState } from "react";
import { issueDrivingLicence } from "../../api/officer.js";
import { Check, Bike, Car, Truck, Bus } from "lucide-react";
import toast from "react-hot-toast";

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  { code: "MCWG", label: "Motorcycle with Gear", icon: Bike },
  { code: "MCWOG", label: "Motorcycle without Gear", icon: Bike },
  { code: "LMV", label: "Light Motor Vehicle", icon: Car },
  { code: "LMV-TR", label: "LMV Transport", icon: Car },
  { code: "HMV", label: "Heavy Motor Vehicle", icon: Truck },
  { code: "HTV", label: "Heavy Transport Vehicle", icon: Bus },
];

const VALIDITY_OPTIONS = [5, 10, 20];

const steps = ["Applicant", "Licence Details", "Confirm"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((label, i) => (
      <div key={label} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < current
                ? "bg-indigo-600 border-indigo-500 text-white"
                : i === current
                  ? "bg-white border-indigo-500 text-indigo-500"
                  : "bg-white border-blue-100 text-slate-300"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              i === current
                ? "text-indigo-600"
                : i < current
                  ? "text-slate-400"
                  : "text-slate-300"
            }`}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-500 ${
              i < current ? "bg-indigo-600" : "bg-blue-100"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, required, hint, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white border border-blue-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
    />
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between items-center px-4 py-3 gap-4">
    <span className="text-xs text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
    <span className="text-sm text-slate-800 text-right break-all">{value || "—"}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IssueLicence() {
  const [step, setStep] = useState(0);
  const [lookupMethod, setLookupMethod] = useState("email");
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    rtoCode: "",
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
      if (!form.rtoCode.trim()) e.rtoCode = "RTO CODE is required";
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
        rtoCode: form.rtoCode.trim().toUpperCase(),
        vehicle_categories: form.vehicle_categories.join(","),
        validity_years: form.validity_years,
        ...(lookupMethod === "email"
          ? { email: form.email.trim().toLowerCase() }
          : { mobile: form.mobile.trim() }),
      };
      const { data } = await issueDrivingLicence(payload);
      setResult(data.data);
      setStep(3);
      toast.success("Licence Issued Successfully");
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to issue licence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ email: "", mobile: "", rtoCode: "", vehicle_categories: [], validity_years: 20 });
    setErrors({});
    setResult(null);
    setApiError(null);
    setStep(0);
    setLookupMethod("email");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-blue-50/40">
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          OFFICER PANEL
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Issue Driving Licence
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new driving licence for a verified applicant
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-8 py-8 max-w-xl mx-auto mt-8">
        {/* ── Success ── */}
        {step === 3 && result ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-indigo-600"><Check /></span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Licence Issued</h2>
              <p className="text-xs text-slate-400">The driving licence has been created successfully</p>
            </div>

            {/* DL Card Preview */}
            <div className="bg-indigo-50/60 border border-blue-100 rounded-xl p-5 text-left space-y-3">
              {[
                { label: "Licence Number", value: result.licence_number },
                { label: "Issue Date", value: result.issue_date },
                { label: "Expiry Date", value: result.expiry_date },
                { label: "Issuing RTO", value: result.issuing_rto_id },
                { label: "Categories", value: result.vehicle_categories },
                { label: "Status", value: result.status?.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
                  <span className="text-sm text-slate-800 font-semibold">{value ?? "—"}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm tracking-wide transition-all"
            >
              Issue Another Licence
            </button>
          </div>
        ) : (
          <>
            <StepIndicator current={step} />

            {/* ── Step 0: Applicant ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-0.5">Applicant Lookup</h2>
                  <p className="text-xs text-slate-400">Find the citizen by email or mobile number</p>
                </div>

                {/* Toggle */}
                <div className="flex bg-indigo-50/60 border border-blue-100 rounded-xl p-1 gap-1">
                  {[
                    { key: "email", label: "Email" },
                    { key: "mobile", label: "Mobile" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setLookupMethod(key);
                        setErrors({});
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        lookupMethod === key
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {lookupMethod === "email" ? (
                  <>
                    <InputField
                      label="Email Address"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="citizen@example.com"
                      type="email"
                      required
                    />
                    {errors.email && <p className="text-xs text-rose-500 -mt-3">{errors.email}</p>}
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-indigo-50/60 border border-blue-100 rounded-lg text-sm text-slate-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className="flex-1 bg-white border border-blue-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                      />
                    </div>
                    {errors.mobile && <p className="text-xs text-rose-500">{errors.mobile}</p>}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Licence Details ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-0.5">Licence Configuration</h2>
                  <p className="text-xs text-slate-400">Set RTO, vehicle categories and validity</p>
                </div>

                <InputField
                  label="Issuing RTO CODE"
                  name="rtoCode"
                  value={form.rtoCode}
                  onChange={handleChange}
                  placeholder="KA-05"
                  hint="e.g. KA-05, MH-12"
                  required
                />
                {errors.rtoCode && <p className="text-xs text-rose-500 -mt-3">{errors.rtoCode}</p>}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Vehicle Categories <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {VEHICLE_CATEGORIES.map(({ code, label, icon: Icon }) => {
                      const selected = form.vehicle_categories.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleCategory(code)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            selected
                              ? "bg-indigo-50 border-indigo-300 text-indigo-600"
                              : "bg-white border-blue-100 text-slate-500 hover:border-blue-200"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="leading-tight">
                            <span className="block font-bold text-[11px]">{code}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{label}</span>
                          </span>
                          {selected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.vehicle_categories && (
                    <p className="text-xs text-rose-500">{errors.vehicle_categories}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Validity Period
                  </label>
                  <div className="flex gap-2">
                    {VALIDITY_OPTIONS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, validity_years: yr }))}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          form.validity_years === yr
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-blue-100 text-slate-500 hover:border-blue-200"
                        }`}
                      >
                        {yr} yr{yr > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Confirm ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-0.5">Confirm & Issue</h2>
                  <p className="text-xs text-slate-400">Review the details before issuing the licence</p>
                </div>

                <div className="bg-indigo-50/60 border border-blue-100 rounded-xl overflow-hidden divide-y divide-blue-100">
                  <ReviewRow
                    label={lookupMethod === "email" ? "Email" : "Mobile"}
                    value={lookupMethod === "email" ? form.email : `+91 ${form.mobile}`}
                  />
                  <ReviewRow label="RTO CODE" value={form.rtoCode.toUpperCase()} />
                  <ReviewRow
                    label="Vehicle Categories"
                    value={form.vehicle_categories.join(", ") || "—"}
                  />
                  <ReviewRow label="Validity" value={`${form.validity_years} years`} />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    This action will issue a permanent driving licence to the applicant. Please ensure all details are correct before proceeding.
                  </p>
                </div>

                {apiError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    <span>{apiError}</span>
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
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-blue-100 hover:border-blue-200 rounded-xl transition-all disabled:opacity-40"
                >
                  ← Back
                </button>
              )}

              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Issuing…
                    </>
                  ) : (
                    "Issue Licence"
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-slate-300 mt-6">
        Authorized Officer Use Only · Motor Vehicles Department
      </p>
    </div>
  );
}