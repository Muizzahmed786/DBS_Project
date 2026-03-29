import { useEffect, useState } from "react";
import { getMyDocuments, uploadDocuments } from "../../api/citizen.js";
import { FolderOpen, FileCheck2, ExternalLink, Upload, File, CloudUpload } from "lucide-react";

// ── doc-type styling ─────────────────────────────────────────────────────────
const DOC_STYLES = {
    "driving license": {
        border:   "border-violet-500/30 hover:border-violet-400/60",
        iconBg:   "bg-violet-500/10",
        iconText: "text-violet-400",
        badge:    "bg-violet-500/10 text-violet-400",
        bar:      "bg-violet-400",
        link:     "text-violet-400 hover:text-violet-300",
    },
    "rc": {
        border:   "border-sky-500/30 hover:border-sky-400/60",
        iconBg:   "bg-sky-500/10",
        iconText: "text-sky-400",
        badge:    "bg-sky-500/10 text-sky-400",
        bar:      "bg-sky-400",
        link:     "text-sky-400 hover:text-sky-300",
    },
    "insurance": {
        border:   "border-emerald-500/30 hover:border-emerald-400/60",
        iconBg:   "bg-emerald-500/10",
        iconText: "text-emerald-400",
        badge:    "bg-emerald-500/10 text-emerald-400",
        bar:      "bg-emerald-400",
        link:     "text-emerald-400 hover:text-emerald-300",
    },
    "puc": {
        border:   "border-amber-500/30 hover:border-amber-400/60",
        iconBg:   "bg-amber-500/10",
        iconText: "text-amber-400",
        badge:    "bg-amber-500/10 text-amber-400",
        bar:      "bg-amber-400",
        link:     "text-amber-400 hover:text-amber-300",
    },
};

const DEFAULT_STYLE = {
    border:   "border-slate-700/50 hover:border-slate-600",
    iconBg:   "bg-slate-700/40",
    iconText: "text-slate-400",
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

// ── upload fields config ─────────────────────────────────────────────────────
const UPLOAD_FIELDS = [
    { name: "aadhaar", label: "Aadhaar Card",    accept: "image/*,application/pdf" },
    { name: "licence", label: "Driving Licence", accept: "image/*,application/pdf" },
];

// ── component ────────────────────────────────────────────────────────────────
const Documents = () => {
    const [docs, setDocs]         = useState([]);
    const [loading, setLoading]   = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(null);
    const [files, setFiles]       = useState({ aadhaar: null, licence: null });

    // fetch
    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const res = await getMyDocuments();
                setDocs(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const handleFileChange = (e) =>
        setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));

    const handleDrop = (e, name) => {
        e.preventDefault();
        setDragging(null);
        const file = e.dataTransfer.files[0];
        if (file) setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleUpload = async () => {
        if (!files.aadhaar && !files.licence) {
            alert("Please select at least one file");
            return;
        }
        const formData = new FormData();
        if (files.aadhaar) formData.append("aadhaar", files.aadhaar);
        if (files.licence) formData.append("licence", files.licence);

        setUploading(true);
        try {
            await uploadDocuments(formData);
            alert("Uploaded successfully");
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const hasFiles = Object.values(files).some(Boolean);

    return (
        <div className="min-h-screen bg-[#080a0f] text-slate-100">
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

                {/* ── Upload Panel ── */}
                <div className="bg-[#0d1017] border border-white/[0.06] rounded-2xl p-5 mb-7">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-4">
                        Upload Documents
                    </p>

                    {/* Drop zones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {UPLOAD_FIELDS.map(({ name, label, accept }) => {
                            const picked   = files[name];
                            const isActive = dragging === name;
                            return (
                                <label
                                    key={name}
                                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all duration-200 group
                                        ${isActive
                                            ? "border-sky-400 bg-sky-500/6"
                                            : picked
                                                ? "border-sky-500/40 bg-sky-500/[0.04]"
                                                : "border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02]"}`}
                                    onDragOver={e => { e.preventDefault(); setDragging(name); }}
                                    onDragLeave={() => setDragging(null)}
                                    onDrop={e => handleDrop(e, name)}
                                >
                                    <input
                                        type="file"
                                        name={name}
                                        accept={accept}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                        ${picked ? "bg-sky-500/15" : "bg-white/[0.04] group-hover:bg-white/[0.07]"}`}>
                                        {picked
                                            ? <File size={15} className="text-sky-400" />
                                            : <CloudUpload size={15} className="text-slate-500 group-hover:text-slate-400" />}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[13px] font-semibold leading-tight mb-0.5
                                            ${picked ? "text-sky-300" : "text-slate-300"}`}>
                                            {label}
                                        </p>
                                        {picked
                                            ? <p className="text-[11px] text-sky-400/80 max-w-[140px] truncate mx-auto">
                                                {files[name].name}
                                              </p>
                                            : <p className="text-[11px] text-slate-600">Click or drag &amp; drop</p>}
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={!hasFiles || uploading}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wide transition-all duration-200
                            ${hasFiles && !uploading
                                ? "bg-sky-500 hover:bg-sky-400 text-[#080a0f] shadow-lg shadow-sky-500/20 hover:-translate-y-px active:translate-y-0"
                                : "bg-white/[0.04] text-slate-600 cursor-not-allowed"}`}
                    >
                        {uploading
                            ? <div className="w-4 h-4 rounded-full border-2 border-[#080a0f]/30 border-t-[#080a0f] animate-spin" />
                            : <Upload size={14} />}
                        {uploading ? "Uploading…" : "Upload Documents"}
                    </button>
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
                                    {/* coloured top bar on hover */}
                                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

                                    {/* icon */}
                                    <div className={`w-9 h-9 rounded-xl ${s.iconBg} ${s.iconText} flex items-center justify-center mb-4`}>
                                        <FileCheck2 size={16} />
                                    </div>

                                    {/* badge */}
                                    <span className={`inline-block text-[10px] font-bold tracking-widest uppercase rounded-md px-2 py-0.5 mb-2 ${s.badge}`}>
                                        {d.document_type}
                                    </span>

                                    {/* id */}
                                    <p className="text-[11px] text-slate-600 font-mono mb-4">#{d.document_id}</p>

                                    {/* link */}
                                    <a
                                        href={d.file_url}
                                        target="_blank"
                                        // rel="noopener noreferrer"
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