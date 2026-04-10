import { useEffect, useState } from "react";
import { getMyDocuments, uploadUserDocuments, uploadVehicleDocuments, getRegisteredVehicles } from "../../api/citizen.js";
import { FolderOpen, FileCheck2, ExternalLink, Upload, File, CloudUpload, Car, ChevronDown, Check } from "lucide-react";
import toast from 'react-hot-toast';
// ── doc-type styling ─────────────────────────────────────────────────────────
const DOC_STYLES = {
    "dl": {
        border:   "border-violet-500/30 hover:border-violet-400/60",
        iconBg:   "bg-violet-500/10", iconText: "text-violet-400",
        badge:    "bg-violet-500/10 text-violet-400",
        bar:      "bg-violet-400",
        link:     "text-violet-400 hover:text-violet-300",
    },
    "driving license": {
        border:   "border-violet-500/30 hover:border-violet-400/60",
        iconBg:   "bg-violet-500/10", iconText: "text-violet-400",
        badge:    "bg-violet-500/10 text-violet-400",
        bar:      "bg-violet-400",
        link:     "text-violet-400 hover:text-violet-300",
    },
    "rc": {
        border:   "border-sky-500/30 hover:border-sky-400/60",
        iconBg:   "bg-sky-500/10", iconText: "text-sky-400",
        badge:    "bg-sky-500/10 text-sky-400",
        bar:      "bg-sky-400",
        link:     "text-sky-400 hover:text-sky-300",
    },
    "insurance": {
        border:   "border-emerald-500/30 hover:border-emerald-400/60",
        iconBg:   "bg-emerald-500/10", iconText: "text-emerald-400",
        badge:    "bg-emerald-500/10 text-emerald-400",
        bar:      "bg-emerald-400",
        link:     "text-emerald-400 hover:text-emerald-300",
    },
    "puc": {
        border:   "border-amber-500/30 hover:border-amber-400/60",
        iconBg:   "bg-amber-500/10", iconText: "text-amber-400",
        badge:    "bg-amber-500/10 text-amber-400",
        bar:      "bg-amber-400",
        link:     "text-amber-400 hover:text-amber-300",
    },
    "aadhaar": {
        border:   "border-orange-500/30 hover:border-orange-400/60",
        iconBg:   "bg-orange-500/10", iconText: "text-orange-400",
        badge:    "bg-orange-500/10 text-orange-400",
        bar:      "bg-orange-400",
        link:     "text-orange-400 hover:text-orange-300",
    },
};

const DEFAULT_STYLE = {
    border:   "border-slate-700/50 hover:border-slate-600",
    iconBg:   "bg-slate-700/40", iconText: "text-slate-400",
    badge:    "bg-slate-700/40 text-slate-400",
    bar:      "bg-slate-500",
    link:     "text-slate-400 hover:text-slate-300",
};

function getDocStyle(type = "") {
    const lower = type.toLowerCase();
    for (const [key, val] of Object.entries(DOC_STYLES)) {
        if (lower.includes(key)) return val;
    }
    return DEFAULT_STYLE;
}

// ── field configs ─────────────────────────────────────────────────────────────
const USER_FIELDS = [
    { name: "aadhaar", label: "Aadhaar Card",    accept: "image/*,application/pdf" },
    { name: "licence", label: "Driving Licence", accept: "image/*,application/pdf" },
];

const VEHICLE_FIELDS = [
    { name: "vehicleRc",  label: "RC (Registration Certificate)", accept: "image/*,application/pdf" },
    { name: "insurance",  label: "Insurance",                     accept: "image/*,application/pdf" },
];

// ── DropZone ──────────────────────────────────────────────────────────────────
const DropZone = ({ name, label, accept, files, dragging, onFileChange, onDragOver, onDragLeave, onDrop }) => {
    const picked   = files[name];
    const isActive = dragging === name;
    return (
        <label
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all duration-200 group
                ${isActive  ? "border-sky-400 bg-sky-500/[0.06]"
                : picked    ? "border-sky-500/40 bg-sky-500/[0.04]"
                            : "border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02]"}`}
            onDragOver={e => { e.preventDefault(); onDragOver(name); }}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, name)}
        >
            <input
                type="file" name={name} accept={accept} onChange={onFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                ${picked ? "bg-sky-500/15" : "bg-white/[0.04] group-hover:bg-white/[0.07]"}`}>
                {picked
                    ? <File size={15} className="text-sky-400" />
                    : <CloudUpload size={15} className="text-slate-500 group-hover:text-slate-400" />}
            </div>
            <div className="text-center">
                <p className={`text-[13px] font-semibold leading-tight mb-0.5 ${picked ? "text-sky-300" : "text-slate-300"}`}>
                    {label}
                </p>
                {picked
                    ? <p className="text-[11px] text-sky-400/80 max-w-[140px] truncate mx-auto">{files[name].name}</p>
                    : <p className="text-[11px] text-slate-600">Click or drag &amp; drop</p>}
            </div>
        </label>
    );
};

// ── small helpers ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">{children}</p>
);

const UploadButton = ({ onClick, disabled, uploading, label }) => (
    <button
        onClick={onClick}
        disabled={disabled || uploading}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wide transition-all duration-200
            ${!disabled && !uploading
                ? "bg-sky-500 hover:bg-sky-400 text-[#080a0f] shadow-lg shadow-sky-500/20 hover:-translate-y-px active:translate-y-0"
                : "bg-white/[0.04] text-slate-600 cursor-not-allowed"}`}
    >
        {uploading
            ? <div className="w-4 h-4 rounded-full border-2 border-[#080a0f]/30 border-t-[#080a0f] animate-spin" />
            : <Upload size={14} />}
        {uploading ? "Uploading…" : label}
    </button>
);

// ── main component ────────────────────────────────────────────────────────────
const Documents = () => {
    const [docs, setDocs]                       = useState([]);
    const [vehicles, setVehicles]               = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleDropdown, setVehicleDropdown] = useState(false);

    const [loading, setLoading]                 = useState(false);
    const [uploadingUser, setUploadingUser]     = useState(false);
    const [uploadingVehicle, setUploadingVehicle] = useState(false);
    const [dragging, setDragging]               = useState(null);

    const [userFiles,    setUserFiles]    = useState({ aadhaar: null, licence: null });
    const [vehicleFiles, setVehicleFiles] = useState({ vehicleRc: null, insurance: null });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [docsRes, vehiclesRes] = await Promise.all([
                    getMyDocuments(),
                    getRegisteredVehicles(),
                ]);
                setDocs(docsRes.data.data);
                setVehicles(vehiclesRes.data.data ?? vehiclesRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (!vehicleDropdown) return;
        const close = () => setVehicleDropdown(false);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, [vehicleDropdown]);

    const handleUserFileChange    = e => setUserFiles(p    => ({ ...p, [e.target.name]: e.target.files[0] }));
    const handleVehicleFileChange = e => setVehicleFiles(p => ({ ...p, [e.target.name]: e.target.files[0] }));

    const handleDrop = (e, name, isVehicle) => {
        e.preventDefault();
        setDragging(null);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (isVehicle) setVehicleFiles(p => ({ ...p, [name]: file }));
        else           setUserFiles(p    => ({ ...p, [name]: file }));
    };

    // POST /citizens/upload-documents
    const handleUploadUserDocs = async () => {
        if (!userFiles.aadhaar && !userFiles.licence) {
            toast.error("Please select at least one personal document"); return;
        }
        const formData = new FormData();
        if (userFiles.aadhaar) formData.append("aadhaar", userFiles.aadhaar);
        if (userFiles.licence) formData.append("licence", userFiles.licence);

        setUploadingUser(true);
        try {
            await uploadUserDocuments(formData);
            toast.success("Personal documents uploaded successfully");
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingUser(false);
        }
    };

    // POST /citizens/upload-documents/:vehicleId
    const handleUploadVehicleDocs = async () => {
        if (!vehicleFiles.vehicleRc && !vehicleFiles.insurance) {
            toast.error("Please select at least one vehicle document"); return;
        }
        if (!selectedVehicle) { toast.error("Please select a vehicle"); return; }

        const formData = new FormData();
        if (vehicleFiles.vehicleRc)  formData.append("vehicleRc",  vehicleFiles.vehicleRc);
        if (vehicleFiles.insurance)  formData.append("insurance",  vehicleFiles.insurance);

        setUploadingVehicle(true);
        try {
            await uploadVehicleDocuments(formData, selectedVehicle.vehicle_id);
            toast.success("Vehicle documents uploaded successfully");
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingVehicle(false);
        }
    };

    const hasUserFiles    = !!(userFiles.aadhaar    || userFiles.licence);
    const hasVehicleFiles = !!(vehicleFiles.vehicleRc || vehicleFiles.insurance);

    return (
        <div className="min-h-screen text-slate-100">
            <div className="max-w-3xl mx-auto px-5 py-10">

                {/* ── Header ── */}
                <div className="mb-9">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                            <FileCheck2 size={15} className="text-sky-400" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">My Documents</h1>
                    </div>
                    <p className="text-slate-500 text-sm pl-11">
                        {docs.length === 0
                            ? "No documents on file yet"
                            : `${docs.length} document${docs.length !== 1 ? "s" : ""} on file`}
                    </p>
                </div>

                {/* ── Personal Documents Panel ── */}
                <div className="bg-[#0d1017] border border-white/[0.06] rounded-2xl p-5 mb-4">
                    <SectionLabel>Personal Documents</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {USER_FIELDS.map(f => (
                            <DropZone
                                key={f.name} {...f}
                                files={userFiles}
                                dragging={dragging}
                                onFileChange={handleUserFileChange}
                                onDragOver={setDragging}
                                onDragLeave={() => setDragging(null)}
                                onDrop={(e, name) => handleDrop(e, name, false)}
                            />
                        ))}
                    </div>
                    <UploadButton
                        onClick={handleUploadUserDocs}
                        disabled={!hasUserFiles}
                        uploading={uploadingUser}
                        label="Upload Personal Documents"
                    />
                </div>

                {/* ── Vehicle Documents Panel ── */}
                <div className="bg-[#0d1017] border border-white/[0.06] rounded-2xl p-5 mb-7">
                    <SectionLabel>Vehicle Documents</SectionLabel>

                    {/* Vehicle selector */}
                    <div className="relative mb-3" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setVehicleDropdown(v => !v)}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm transition-all duration-200
                                ${vehicleDropdown
                                    ? "border-sky-500/50 bg-sky-500/[0.04]"
                                    : selectedVehicle
                                        ? "border-sky-500/30 bg-sky-500/[0.04]"
                                        : "border-white/[0.08] hover:border-white/[0.14] bg-white/[0.02]"}`}
                        >
                            <span className="flex items-center gap-2.5">
                                <Car size={14} className={selectedVehicle ? "text-sky-400" : "text-slate-500"} />
                                {selectedVehicle ? (
                                    <span className="text-slate-200 font-medium">
                                        {selectedVehicle.registration_number ?? `Vehicle #${selectedVehicle.vehicle_id}`}
                                        {selectedVehicle.make && (
                                            <span className="text-slate-500 font-normal ml-1.5">
                                                — {selectedVehicle.make} {selectedVehicle.model ?? ""}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-slate-500">Select a vehicle…</span>
                                )}
                            </span>
                            <ChevronDown
                                size={13}
                                className={`text-slate-500 transition-transform duration-200 ${vehicleDropdown ? "rotate-180" : ""}`}
                            />
                        </button>

                        {vehicleDropdown && (
                            <div className="absolute z-20 top-full mt-1.5 w-full bg-[#12151d] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                                {vehicles.length === 0 ? (
                                    <p className="px-4 py-3 text-[13px] text-slate-600">No vehicles registered</p>
                                ) : (
                                    vehicles.map(v => {
                                        const isSelected = selectedVehicle?.vehicle_id === v.vehicle_id;
                                        return (
                                            <button
                                                key={v.vehicle_id}
                                                type="button"
                                                onClick={() => { setSelectedVehicle(v); setVehicleDropdown(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                                                    ${isSelected ? "bg-sky-500/10 text-sky-300" : "text-slate-300 hover:bg-white/[0.04]"}`}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <Car size={13} className={isSelected ? "text-sky-400" : "text-slate-500"} />
                                                    <span>
                                                        <span className="font-medium">
                                                            {v.registration_number ?? `Vehicle #${v.vehicle_id}`}
                                                        </span>
                                                        {v.make && (
                                                            <span className="text-slate-500 font-normal ml-1.5">
                                                                {v.make} {v.model ?? ""}
                                                            </span>
                                                        )}
                                                    </span>
                                                </span>
                                                {isSelected && <Check size={13} className="text-sky-400" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* RC + Insurance drop zones */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 transition-opacity duration-200
                        ${selectedVehicle ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                        {VEHICLE_FIELDS.map(f => (
                            <DropZone
                                key={f.name} {...f}
                                files={vehicleFiles}
                                dragging={dragging}
                                onFileChange={handleVehicleFileChange}
                                onDragOver={setDragging}
                                onDragLeave={() => setDragging(null)}
                                onDrop={(e, name) => handleDrop(e, name, true)}
                            />
                        ))}
                    </div>
                    {!selectedVehicle && (
                        <p className="text-[11px] text-slate-600 mb-3 text-center">
                            Select a vehicle above to enable RC &amp; Insurance upload
                        </p>
                    )}

                    <UploadButton
                        onClick={handleUploadVehicleDocs}
                        disabled={!hasVehicleFiles || !selectedVehicle}
                        uploading={uploadingVehicle}
                        label="Upload Vehicle Documents"
                    />
                </div>

                {/* ── Spinner ── */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-7 h-7 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
                    </div>
                )}

                {/* ── Empty State ── */}
                {!loading && docs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#0d1017] border border-white/[0.06] flex items-center justify-center text-slate-700">
                            <FolderOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">No documents yet</p>
                            <p className="text-xs text-slate-600 mt-1">Uploaded documents will appear here</p>
                        </div>
                    </div>
                )}

                {/* ── Document Grid ── */}
                {!loading && docs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {docs.map(d => {
                            const s = getDocStyle(d.document_type);
                            return (
                                <div
                                    key={d.document_id}
                                    className={`group relative bg-[#0d1017] border rounded-2xl p-5 overflow-hidden
                                        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${s.border}`}
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                                    <div className={`w-9 h-9 rounded-xl ${s.iconBg} ${s.iconText} flex items-center justify-center mb-4`}>
                                        <FileCheck2 size={16} />
                                    </div>
                                    <span className={`inline-block text-[10px] font-bold tracking-widest uppercase rounded-md px-2 py-0.5 mb-2 ${s.badge}`}>
                                        {d.document_type}
                                    </span>
                                    {d.vehicle_id && (
                                        <p className="text-[10px] text-slate-600 font-mono mb-1 flex items-center gap-1">
                                            <Car size={9} /> Vehicle #{d.vehicle_id}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-600 font-mono mb-4">#{d.document_id}</p>
                                    <a
                                        href={d.file_url}
                                        target="_blank"
                                        download
                                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors ${s.link}`}
                                    >
                                        View Document
                                        <ExternalLink size={10} />
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Documents;