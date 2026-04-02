import { useEffect, useState } from "react";
import { getMyDocuments, uploadDocuments } from "../../api/citizen.js";
import { FolderOpen, FileCheck2, ExternalLink, Upload, File, CloudUpload } from "lucide-react";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

/* ── Doc-type color config (semantic accents preserved) ─────── */
const DOC_STYLES = {
    "driving license": {
        iconBg: "rgba(124,58,237,0.08)", iconColor: "#7c3aed",
        badge:  { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
        bar: "#7c3aed",
        link: "#7c3aed",
        topBar: "#7c3aed",
    },
    "rc": {
        iconBg: "rgba(0,63,135,0.08)", iconColor: "#003f87",
        badge:  { bg: "rgba(0,63,135,0.08)", color: "#003f87" },
        bar: "#003f87",
        link: "#003f87",
        topBar: "#003f87",
    },
    "insurance": {
        iconBg: "rgba(5,150,105,0.08)", iconColor: "#059669",
        badge:  { bg: "rgba(5,150,105,0.08)", color: "#059669" },
        bar: "#059669",
        link: "#059669",
        topBar: "#059669",
    },
    "puc": {
        iconBg: "rgba(217,119,6,0.08)", iconColor: "#d97706",
        badge:  { bg: "rgba(217,119,6,0.10)", color: "#92400e" },
        bar: "#d97706",
        link: "#d97706",
        topBar: "#d97706",
    },
};

const DEFAULT_STYLE = {
    iconBg: "#f0f2f5", iconColor: "#42454e",
    badge:  { bg: "#f0f2f5", color: "#42454e" },
    bar: "#42454e",
    link: "#003f87",
    topBar: "#003f87",
};

function getDocStyle(type = "") {
    const lower = type.toLowerCase();
    for (const [key, val] of Object.entries(DOC_STYLES)) {
        if (lower.includes(key)) return val;
    }
    return DEFAULT_STYLE;
}

const UPLOAD_FIELDS = [
    { name: "aadhaar", label: "Aadhaar Card",    accept: "image/*,application/pdf" },
    { name: "licence", label: "Driving Licence", accept: "image/*,application/pdf" },
];

/* ── Component ──────────────────────────────────────────────── */
const Documents = () => {
    const [docs, setDocs]           = useState([]);
    const [loading, setLoading]     = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging]   = useState(null);
    const [files, setFiles]         = useState({ aadhaar: null, licence: null });

    const getIframeUrl = (url) => {
        if (!url) return "";
        if (url.match(/\.(doc|docx)$/))
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        return url;
    };

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
        if (!files.aadhaar && !files.licence) { alert("Please select at least one file"); return; }
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
        <div className="max-w-3xl mx-auto">

            {/* ── Header ─────────────────────────────────── */}
            <div className="mb-9">
                <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                    Secure Vault
                </p>
                <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                    My Documents
                </h1>
                <p className="text-[0.9375rem] text-[#42454e] mt-1">
                    {docs.length === 0
                        ? "No documents on file yet"
                        : `${docs.length} document${docs.length !== 1 ? "s" : ""} on file`}
                </p>
            </div>

            {/* ── Upload Panel — white card ──────────────── */}
            <div className="bg-white rounded-2xl p-5 mb-7" style={{ boxShadow: cardShadow }}>
                <p className="text-[0.75rem] font-semibold tracking-[0.07em] uppercase text-[#42454e] mb-4">
                    Upload Documents
                </p>

                {/* Drop zones — ghost border dashed (outline_variant at 15% → used for accessibility) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {UPLOAD_FIELDS.map(({ name, label, accept }) => {
                        const picked   = files[name];
                        const isActive = dragging === name;
                        return (
                            <label
                                key={name}
                                className="relative flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 cursor-pointer transition-all duration-200"
                                style={{
                                    border: isActive
                                        ? "2px dashed #003f87"
                                        : picked
                                            ? "2px dashed rgba(0,63,135,0.35)"
                                            : "2px dashed rgba(197,200,212,0.60)",
                                    background: isActive
                                        ? "rgba(0,63,135,0.04)"
                                        : picked
                                            ? "rgba(0,63,135,0.03)"
                                            : "#f8f9fa",
                                }}
                                onDragOver={(e) => { e.preventDefault(); setDragging(name); }}
                                onDragLeave={() => setDragging(null)}
                                onDrop={(e) => handleDrop(e, name)}
                            >
                                <input
                                    type="file"
                                    name={name}
                                    accept={accept}
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                                     style={{ background: picked ? "rgba(0,63,135,0.08)" : "#f0f2f5" }}>
                                    {picked
                                        ? <File size={15} style={{ color: "#003f87" }} />
                                        : <CloudUpload size={15} style={{ color: "#c5c8d4" }} />}
                                </div>
                                <div className="text-center">
                                    <p className="text-[0.8125rem] font-semibold leading-tight mb-0.5"
                                       style={{ color: picked ? "#003f87" : "#1a1d23" }}>
                                        {label}
                                    </p>
                                    {picked
                                        ? <p className="text-[0.75rem] max-w-[140px] truncate mx-auto" style={{ color: "#003f87" }}>
                                            {files[name].name}
                                          </p>
                                        : <p className="text-[0.75rem]" style={{ color: "#c5c8d4" }}>Click or drag &amp; drop</p>}
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Upload CTA — gradient primary */}
                <button
                    onClick={handleUpload}
                    disabled={!hasFiles || uploading}
                    className="w-full flex items-center justify-center gap-2 rounded-[1.5rem] py-2.5 text-[0.875rem] font-semibold tracking-wide transition-all duration-200"
                    style={
                        hasFiles && !uploading
                            ? {
                                background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                                boxShadow:  "0 4px 20px rgba(0,63,135,0.28)",
                                color: "#ffffff",
                                border: "none",
                              }
                            : {
                                background: "#f0f2f5",
                                color: "#c5c8d4",
                                cursor: "not-allowed",
                                border: "none",
                              }
                    }
                    onMouseEnter={(e) => { if (hasFiles && !uploading) e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,63,135,0.36)"; }}
                    onMouseLeave={(e) => { if (hasFiles && !uploading) e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,63,135,0.28)"; }}
                >
                    {uploading
                        ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <Upload size={14} />}
                    {uploading ? "Uploading…" : "Upload Documents"}
                </button>
            </div>

            {/* ── Spinner ────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-7 h-7 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                </div>
            )}

            {/* ── Empty State ────────────────────────────── */}
            {!loading && docs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center"
                         style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                        <FolderOpen size={24} />
                    </div>
                    <div>
                        <p className="text-[0.9375rem] font-medium text-[#1a1d23]">No documents yet</p>
                        <p className="text-[0.875rem] text-[#42454e] mt-1">Uploaded documents will appear here</p>
                    </div>
                </div>
            )}

            {/* ── Document Grid ──────────────────────────── */}
            {!loading && docs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {docs.map((d) => {
                        const s = getDocStyle(d.document_type);
                        return (
                            <div
                                key={d.document_id}
                                className="group relative bg-white rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                                style={{ boxShadow: cardShadow }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; }}
                            >
                                {/* Colored top accent bar on hover */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{ background: s.topBar }}
                                />

                                {/* Icon */}
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: s.iconBg, color: s.iconColor }}
                                >
                                    <FileCheck2 size={16} />
                                </div>

                                {/* Type badge */}
                                <span
                                    className="inline-block text-[0.6875rem] font-bold tracking-[0.07em] uppercase rounded-md px-2 py-0.5 mb-2"
                                    style={{ background: s.badge.bg, color: s.badge.color }}
                                >
                                    {d.document_type}
                                </span>

                                {/* ID */}
                                <p className="text-[0.75rem] text-[#c5c8d4] font-mono mb-4">
                                    #{d.document_id}
                                </p>

                                {/* View link */}
                                <a
                                    href={d.file_url}
                                    target="_blank"
                                    download
                                    className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
                                    style={{ color: s.link, textDecoration: "none" }}
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
    );
};

export default Documents;