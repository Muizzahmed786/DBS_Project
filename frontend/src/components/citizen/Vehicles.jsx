import { useEffect, useState } from "react";
import { getRegisteredVehicles, insertVehicle } from "../../api/citizen.js";
import { Car, Bike, Truck, Hash, Plus, X, ChevronDown } from "lucide-react";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const inputBase =
    "w-full rounded-xl px-[1rem] py-[0.8rem] text-[0.9375rem] text-[#1a1d23] outline-none transition-all duration-200";
const inputHandlers = {
    onFocus: (e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = "0 0 0 2px #003f87"; },
    onBlur:  (e) => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; },
};

const getVehicleIcon = (model = "") => {
    const m = model.toLowerCase();
    if (m.includes("bike") || m.includes("scooter") || m.includes("motorcycle")) return Bike;
    if (m.includes("truck") || m.includes("bus") || m.includes("van")) return Truck;
    return Car;
};

const EMPTY_FORM = {
    registration_number: "", chassis_number: "", engine_number: "",
    vehicle_class: "", fuel_type: "", manufacturer: "", model: "",
    registration_date: "", registration_valid_till: "", insurance_valid_till: "", rto_code: "",
};

const TEXT_FIELDS = [
    { label: "Registration Number", key: "registration_number", placeholder: "MH 12 AB 1234" },
    { label: "Chassis Number",      key: "chassis_number",      placeholder: "MA3EWDE1S00XXXXX" },
    { label: "Engine Number",       key: "engine_number",       placeholder: "G10BN1234567" },
    { label: "Vehicle Class",       key: "vehicle_class",       placeholder: "LMV / MCWG / HGV" },
    { label: "Fuel Type",           key: "fuel_type",           placeholder: "Petrol / Diesel / Electric / CNG" },
    { label: "Manufacturer",        key: "manufacturer",        placeholder: "Maruti Suzuki" },
    { label: "Model",               key: "model",               placeholder: "Swift Dzire" },
    { label: "RTO Code",            key: "rto_code",            placeholder: "RTO office code" },
];

const DATE_FIELDS = [
    { label: "Registration Date",       key: "registration_date" },
    { label: "Registration Valid Till", key: "registration_valid_till" },
    { label: "Insurance Valid Till",    key: "insurance_valid_till" },
];

const Vehicles = () => {
    const [vehicles, setVehicles]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm]             = useState(EMPTY_FORM);

    const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            if (!form.registration_number || !form.vehicle_class || !form.fuel_type) {
                alert("Please fill the required fields (Registration Number, Vehicle Class, Fuel Type)");
                setSubmitting(false);
                return;
            }
            await insertVehicle({ ...form });
            const res = await getRegisteredVehicles();
            setVehicles(res.data.data);
            setForm(EMPTY_FORM);
            setShowForm(false);
            alert("Vehicle added successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to add vehicle");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const res = await getRegisteredVehicles();
                setVehicles(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">

            {/* ── Header ───────────────────────────────────── */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                        My Fleet
                    </p>
                    <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                        Vehicles
                    </h1>
                    <p className="text-[0.9375rem] text-[#42454e] mt-1">
                        {vehicles.length} registered vehicle{vehicles.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Add Vehicle button — gradient primary */}
                <button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-2 text-white text-[0.875rem] font-semibold px-5 py-2.5 rounded-[1.5rem] transition-all duration-200 active:scale-95"
                    style={{
                        background:  "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                        boxShadow:   "0 4px 16px rgba(0,63,135,0.28)",
                        border: "none",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,63,135,0.36)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,63,135,0.28)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Cancel" : "Add Vehicle"}
                </button>
            </div>

            {/* ── Add Vehicle Form ──────────────────────────── */}
            {showForm && (
                <div
                    className="bg-white rounded-2xl p-6 mb-8"
                    style={{ boxShadow: cardShadow }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[1.125rem] font-semibold text-[#1a1d23]">Vehicle Details</h2>
                        <ChevronDown size={16} className="text-[#c5c8d4]" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Text fields grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-5">
                            {TEXT_FIELDS.map(({ label, key, placeholder }) => (
                                <div key={key} className="flex flex-col">
                                    <label className="text-[0.8125rem] font-medium text-[#42454e] uppercase tracking-[0.05em] mb-[0.7rem]">
                                        {label}
                                    </label>
                                    <input
                                        type="text"
                                        value={form[key]}
                                        placeholder={placeholder}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        className={inputBase}
                                        style={{ background: "#d8dde5", border: "none" }}
                                        {...inputHandlers}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Date fields grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5 mb-7">
                            {DATE_FIELDS.map(({ label, key }) => (
                                <div key={key} className="flex flex-col">
                                    <label className="text-[0.8125rem] font-medium text-[#42454e] uppercase tracking-[0.05em] mb-[0.7rem]">
                                        {label}
                                    </label>
                                    <input
                                        type="date"
                                        value={form[key]}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        className={inputBase}
                                        style={{ background: "#d8dde5", border: "none" }}
                                        {...inputHandlers}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Tonal separator — no 1px line */}
                        <div className="h-px bg-[#f0f2f5] mb-5" />

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            {/* Tertiary button — text only */}
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                                className="text-[#003f87] text-[0.875rem] font-medium px-4 py-2 rounded-lg transition-opacity duration-150 hover:opacity-70"
                                style={{ background: "none", border: "none" }}
                            >
                                Cancel
                            </button>

                            {/* Primary button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 text-white font-semibold text-[0.875rem] px-6 py-2.5 rounded-[1.5rem] transition-all duration-200 active:scale-95"
                                style={{
                                    background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                                    boxShadow: "0 4px 16px rgba(0,63,135,0.28)",
                                    border: "none",
                                    opacity: submitting ? 0.65 : 1,
                                    cursor: submitting ? "not-allowed" : "pointer",
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <Plus size={15} />
                                        Add Vehicle
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Loading ──────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                </div>
            )}

            {/* ── Empty State ──────────────────────────────── */}
            {!loading && vehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center"
                         style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                        <Car size={28} />
                    </div>
                    <div>
                        <p className="text-[1rem] font-semibold text-[#1a1d23]">No vehicles registered</p>
                        <p className="text-[0.875rem] text-[#42454e] mt-1">Your registered vehicles will appear here</p>
                    </div>
                </div>
            )}

            {/* ── Vehicle Grid ─────────────────────────────── */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehicles.map((v) => {
                        const Icon = getVehicleIcon(v.model);
                        return (
                            <div
                                key={v.vehicle_id}
                                className="bg-white rounded-2xl p-5 cursor-default transition-all duration-200"
                                style={{ boxShadow: cardShadow }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12), 0 2px 8px rgba(0,63,135,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {/* Vehicle icon */}
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-200"
                                     style={{ background: "#f0f2f5", color: "#003f87" }}>
                                    <Icon size={22} />
                                </div>

                                {/* Registration plate */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-[1.125rem] font-bold text-[#1a1d23] tracking-widest">
                                        {v.registration_number}
                                    </span>
                                </div>

                                <p className="text-[0.875rem] text-[#42454e]">{v.model}</p>

                                {/* Tonal separator — spacing only, no border */}
                                <div className="mt-4 pt-4 flex items-center gap-1.5 text-[0.75rem] text-[#c5c8d4]"
                                     style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }}>
                                    <Hash size={11} />
                                    ID: {v.vehicle_id}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Vehicles;