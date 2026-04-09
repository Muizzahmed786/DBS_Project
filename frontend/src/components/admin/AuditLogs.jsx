import { useState, useEffect, useMemo } from "react";
import {
  getAllAuditLogs,
  filterAuditLogs,
  deleteFilteredLogs,
  deleteOldestLogs,
  deleteLogsBetweenDates,
} from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────

const TABLE_OPTIONS = ["*", "users", "vehicles", "licenses", "rto_offices", "applications"];
const OP_OPTIONS    = ["*", "INSERT", "UPDATE", "DELETE"];

const OP_BADGE = {
  INSERT: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  UPDATE: "bg-amber-50  text-amber-700  border border-amber-200",
  DELETE: "bg-red-50    text-red-700    border border-red-200",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Sub-components ───────────────────────────────────────

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === "*" ? "All" : o}</option>
        ))}
      </select>
    </div>
  );
}

function ActionButton({ onClick, loading, disabled, variant = "danger", children }) {
  const styles = {
    danger:   "bg-red-600    hover:bg-red-700    text-white",
    warning:  "bg-amber-500  hover:bg-amber-600  text-white",
    primary:  "bg-indigo-600 hover:bg-indigo-700 text-white",
    ghost:    "bg-white      hover:bg-slate-50   text-slate-700 border border-slate-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 ${styles[variant]}`}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error:   "bg-red-50    border-red-200    text-red-800",
    info:    "bg-blue-50   border-blue-200   text-blue-800",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm text-sm font-medium ${colors[toast.type]}`}>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

function JsonCell({ data }) {
  const [open, setOpen] = useState(false);
  if (!data) return <span className="text-slate-300">—</span>;
  const preview = JSON.stringify(data).slice(0, 30);
  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        className="font-mono text-xs text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
      >
        {open ? "hide" : preview + (preview.length >= 30 ? "…" : "")}
      </button>
      {open && (
        <pre className="mt-1 p-2 bg-slate-50 rounded text-xs text-slate-700 max-w-xs overflow-x-auto border border-slate-200">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[20, 30, 25, 15, 25, 25, 15].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function AuditLogs() {
  // Data
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filterTable, setFilterTable] = useState("*");
  const [filterOp,    setFilterOp]    = useState("*");
  const [filtered,    setFiltered]    = useState(false);

  // Delete oldest
  const [deleteCount, setDeleteCount] = useState("");
  const [delOldLoading, setDelOldLoading] = useState(false);

  // Delete by date
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [delDateLoading, setDelDateLoading] = useState(false);

  // Delete filtered
  const [delFiltLoading, setDelFiltLoading] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState(null); // { title, description, onConfirm }
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Sort
  const [sortCol, setSortCol] = useState("changed_at");
  const [sortDir, setSortDir] = useState("desc");

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch all ──
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllAuditLogs();
      setLogs(res.data?.data || res.data || []);
      setFiltered(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filter ──
  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await filterAuditLogs({ table: filterTable, operation: filterOp });
      setLogs(res.data?.data || res.data || []);
      setFiltered(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setLogs([]);
        setFiltered(true);
      } else {
        showToast(err.response?.data?.message || "Failed to filter logs", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Delete filtered ──
  const handleDeleteFiltered = () => {
    const tableLabel = filterTable === "*" ? "all tables" : filterTable;
    const opLabel    = filterOp    === "*" ? "all operations" : filterOp;
    setConfirm({
      title: "Delete filtered logs",
      description: `This will permanently delete all logs for ${tableLabel} / ${opLabel}. This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteFilteredLogs({ table: filterTable, operation: filterOp });
          showToast("Filtered logs deleted successfully ✓", "success");
          fetchAll();
        } catch (err) {
          showToast(err.response?.data?.message || "Delete failed", "error");
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  // ── Delete oldest N ──
  const handleDeleteOldest = () => {
    const n = parseInt(deleteCount, 10);
    if (!n || n <= 0) { showToast("Enter a valid count", "error"); return; }
    setConfirm({
      title: `Delete ${n} oldest logs`,
      description: `This will permanently delete the ${n} oldest log entries. This cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteOldestLogs({ count: n });
          showToast(`${n} oldest logs deleted ✓`, "success");
          setDeleteCount("");
          fetchAll();
        } catch (err) {
          showToast(err.response?.data?.message || "Delete failed", "error");
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  // ── Delete by date ──
  const handleDeleteByDate = () => {
    if (!startDate || !endDate) { showToast("Select both start and end dates", "error"); return; }
    if (new Date(startDate) > new Date(endDate)) { showToast("Start date must be before end date", "error"); return; }
    setConfirm({
      title: "Delete logs by date range",
      description: `Permanently delete all logs between ${startDate} and ${endDate}. Cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteLogsBetweenDates({ startDate, endDate });
          showToast("Logs in date range deleted ✓", "success");
          setStartDate(""); setEndDate("");
          fetchAll();
        } catch (err) {
          showToast(err.response?.data?.message || "Delete failed", "error");
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  // ── Sort ──
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    return [...logs].sort((a, b) => {
      const av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [logs, sortCol, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="ml-1 text-slate-300 text-xs">⇅</span>;
    return <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  const COLS = [
    { key: "log_id",         label: "ID" },
    { key: "table_name",     label: "Table" },
    { key: "operation_type", label: "Operation" },
    { key: "record_id",      label: "Record ID" },
    { key: "old_data",       label: "Old Data",  noSort: true },
    { key: "new_data",       label: "New Data",  noSort: true },
    { key: "changed_at",     label: "Changed At" },
  ];

  // ── Operation counts for summary ──
  const opCounts = useMemo(() => {
    return logs.reduce((acc, l) => {
      acc[l.operation_type] = (acc[l.operation_type] || 0) + 1;
      return acc;
    }, {});
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1 font-mono">
          Admin Panel
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor and manage database change history
            </p>
          </div>
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 items-center self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 font-mono">
              {logs.length} total
            </span>
            {["INSERT", "UPDATE", "DELETE"].map((op) =>
              opCounts[op] ? (
                <span key={op} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${OP_BADGE[op]}`}>
                  <span className="font-mono">{opCounts[op]}</span> {op}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6">

        {/* ── Control Panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-base">🔍</div>
              <h2 className="text-sm font-bold text-slate-900">Filter Logs</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Table" value={filterTable} onChange={setFilterTable} options={TABLE_OPTIONS} />
              <Select label="Operation" value={filterOp} onChange={setFilterOp} options={OP_OPTIONS} />
            </div>
            <div className="flex gap-2">
              <ActionButton onClick={handleFilter} loading={loading} variant="primary">
                Apply Filter
              </ActionButton>
              {filtered && (
                <ActionButton onClick={fetchAll} loading={loading} variant="ghost">
                  Reset
                </ActionButton>
              )}
            </div>
            {filtered && (
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Delete all matching records:</p>
                <ActionButton onClick={handleDeleteFiltered} loading={delFiltLoading} variant="danger">
                  Delete Filtered
                </ActionButton>
              </div>
            )}
          </div>

          {/* Card 2: Delete Oldest */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-base">🗑</div>
              <h2 className="text-sm font-bold text-slate-900">Delete Oldest N</h2>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                Number of records
              </label>
              <input
                type="number"
                min="1"
                value={deleteCount}
                onChange={(e) => setDeleteCount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <p className="text-xs text-slate-400">
              Deletes the N chronologically oldest entries from the audit log.
            </p>
            <ActionButton
              onClick={handleDeleteOldest}
              loading={delOldLoading}
              disabled={!deleteCount}
              variant="warning"
            >
              Delete Oldest
            </ActionButton>
          </div>

          {/* Card 3: Delete by Date Range */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-base">📅</div>
              <h2 className="text-sm font-bold text-slate-900">Delete by Date Range</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Permanently removes all logs created between the selected dates (inclusive).
            </p>
            <ActionButton
              onClick={handleDeleteByDate}
              loading={delDateLoading}
              disabled={!startDate || !endDate}
              variant="danger"
            >
              Delete Range
            </ActionButton>
          </div>
        </div>

        {/* ── Filter badge ── */}
        {filtered && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              Showing filtered results — {filterTable !== "*" ? filterTable : "all tables"} / {filterOp !== "*" ? filterOp : "all ops"}
            </span>
            <button onClick={fetchAll} className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
              Clear filter
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {sorted.length} record{sorted.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition"
            >
              ↺ Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {COLS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => !col.noSort && handleSort(col.key)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                        ${!col.noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
                    >
                      {col.label}
                      {!col.noSort && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                  : sorted.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="text-slate-500 font-medium">No audit logs found</p>
                        {filtered && (
                          <button onClick={fetchAll} className="mt-2 text-sm text-indigo-600 underline">
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                  : sorted.map((log, i) => (
                    <tr key={log.log_id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">

                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          #{log.log_id}
                        </span>
                      </td>

                      {/* Table */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {log.table_name || "—"}
                        </span>
                      </td>

                      {/* Operation */}
                      <td className="px-4 py-3">
                        {log.operation_type ? (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${OP_BADGE[log.operation_type] || "bg-slate-100 text-slate-600"}`}>
                            {log.operation_type}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Record ID */}
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {log.record_id ?? "—"}
                      </td>

                      {/* Old Data */}
                      <td className="px-4 py-3">
                        <JsonCell data={log.old_data} />
                      </td>

                      {/* New Data */}
                      <td className="px-4 py-3">
                        <JsonCell data={log.new_data} />
                      </td>

                      {/* Changed At */}
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDate(log.changed_at)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && sorted.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {sorted.length} log{sorted.length !== 1 ? "s" : ""} shown
              </span>
              <div className="flex gap-3">
                {["INSERT", "UPDATE", "DELETE"].map((op) =>
                  opCounts[op] ? (
                    <span key={op} className={`text-xs font-semibold px-2 py-1 rounded-full ${OP_BADGE[op]}`}>
                      {opCounts[op]} {op}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
        loading={confirmLoading}
      />

      {/* ── Toast ── */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}