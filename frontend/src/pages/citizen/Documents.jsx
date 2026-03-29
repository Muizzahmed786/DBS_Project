import { useEffect, useState } from "react";
import { getMyDocuments } from "../../api/citizen";
import { FolderOpen, FileText, ExternalLink, FileCheck2 } from "lucide-react";

const DOC_TYPE_COLOR = {
    "Driving License": "from-violet-500/20 to-purple-500/10 border-violet-500/25 text-violet-400",
    "RC":             "from-sky-500/20 to-blue-500/10 border-sky-500/25 text-sky-400",
    "Insurance":      "from-emerald-500/20 to-green-500/10 border-emerald-500/25 text-emerald-400",
    "PUC":            "from-amber-500/20 to-yellow-500/10 border-amber-500/25 text-amber-400",
};

const getDocStyle = (type = "") => {
    for (const key of Object.keys(DOC_TYPE_COLOR)) {
        if (type.toLowerCase().includes(key.toLowerCase())) return DOC_TYPE_COLOR[key];
    }
    return "from-slate-600/20 to-slate-700/10 border-slate-600/25 text-slate-400";
};

const Documents = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">My Documents</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {docs.length} document{docs.length !== 1 ? "s" : ""} on file
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && docs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                        <FolderOpen size={28} />
                    </div>
                    <div>
                        <p className="text-white font-medium">No documents found</p>
                        <p className="text-slate-500 text-sm mt-1">Your uploaded documents will appear here</p>
                    </div>
                </div>
            )}

            {/* Document Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map((d) => {
                        const colorClass = getDocStyle(d.type);
                        return (
                            <div
                                key={d.document_id}
                                className={`group relative bg-gradient-to-br border rounded-2xl p-5 hover:scale-[1.015] transition-all duration-200 ${colorClass}`}
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center mb-4">
                                    <FileCheck2 size={18} />
                                </div>

                                {/* Type */}
                                <p className="font-semibold text-white text-sm leading-snug mb-1">
                                    {d.type}
                                </p>
                                <p className="text-xs text-white/40 mb-5">
                                    #{d.document_id}
                                </p>

                                {/* View Button */}
                                <a
                                    href={d.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-current opacity-70 hover:opacity-100 transition-opacity underline underline-offset-2"
                                >
                                    View Document
                                    <ExternalLink size={11} />
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