import { useEffect, useMemo, useState } from "react";
import { getAllUploadedDocuments } from "../../api/officer.js";
import {
  User, Car
} from "lucide-react";
const TABS = [
  {
    key: "user",
    label: "User Documents",
    icon: User,
    active: "border-sky-500 text-sky-400",
  },
  {
    key: "vehicle",
    label: "Vehicle Documents",
    icon: Car,
    active: "border-emerald-500 text-emerald-400",
  },
];

const COLUMNS = {
  user: [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "document_type", label: "Type" },
    { key: "file_url", label: "Preview", noSort: true },
  ],
  vehicle: [
    { key: "full_name", label: "Name" },
    { key: "registration_number", label: "Vehicle No." },
    { key: "document_type", label: "Type" },
    { key: "file_url", label: "Preview", noSort: true },
  ],
};

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 w-3/4 bg-slate-700/60 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ tab }) => {
  const Icon = tab.icon;

  return (
    <tr>
      <td colSpan={5} className="py-20 text-center">
        <div className="flex justify-center mb-3 text-slate-600">
          <Icon size={32} />
        </div>
        <p className="text-slate-500 font-medium">
          No {tab.label.toLowerCase()} found
        </p>
      </td>
    </tr>
  );
};

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState("user");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortCol, setSortCol] = useState("full_name");
  const [sortDir, setSortDir] = useState("asc");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getAllUploadedDocuments();
      setDocuments(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Split data
  const filteredData = useMemo(() => {
    return activeTab === "user"
      ? documents.filter((d) => !d.registration_number)
      : documents.filter((d) => d.registration_number);
  }, [documents, activeTab]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filteredData, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col)
      return <span className="ml-1 text-slate-600 text-xs">⇅</span>;
    return (
      <span className="ml-1 text-xs text-sky-400">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const getDocColor = (type) => {
    switch (type) {
      case "RC":
        return "bg-sky-500/15 text-sky-400 border border-sky-500/25";
      case "INSURANCE":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
      case "DL":
        return "bg-purple-500/15 text-purple-400 border border-purple-500/25";
      case "AADHAAR":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/25";
      default:
        return "bg-slate-700/60 text-slate-400 border border-slate-600/50";
    }
  };

  const tab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Document Management
        </h1>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map((t) => {
            const Icon = t.icon; // ✅ extract component

            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 rounded-t-md text-sm
        ${activeTab === t.key
                    ? `${t.active} bg-slate-800/60`
                    : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
              >
                <Icon size={16} />  {/* ✅ render properly */}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        <div className="text-xs text-slate-500 mb-4 font-mono">
          {sorted.length} record{sorted.length !== 1 ? "s" : ""}
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 border-b border-slate-700/60">
              <tr>
                {COLUMNS[activeTab].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => !col.noSort && handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500
                      ${!col.noSort
                        ? "cursor-pointer hover:text-slate-200"
                        : ""
                      }`}
                  >
                    {col.label}
                    {!col.noSort && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={COLUMNS[activeTab].length} />
                ))
                : sorted.length === 0
                  ? <EmptyState tab={tab} />
                  : sorted.map((doc, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-700/40 hover:bg-slate-700/30 transition"
                    >
                      {COLUMNS[activeTab].map((col) => {
                        if (col.key === "file_url") {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 text-xs hover:underline"
                              >
                                View
                              </a>
                            </td>
                          );
                        }

                        if (col.key === "document_type") {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-semibold ${getDocColor(
                                  doc.document_type
                                )}`}
                              >
                                {doc.document_type}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={col.key}
                            className="px-4 py-3 text-xs text-slate-300"
                          >
                            {doc[col.key] || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}