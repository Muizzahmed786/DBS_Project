import { useState } from "react";
import {
  deleteFilteredLogs,
  deleteOldestLogs,
  deleteLogsBetweenDates,
} from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLES = ["*", "users", "vehicles", "ownership", "rto", "documents", "payment", "violation_types", "vehicle_ownership"];
const OPERATIONS = ["*", "INSERT", "UPDATE", "DELETE", "SELECT"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split("T")[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBanner = ({ status, onDismiss }) => {
  if (!status) return null;
  const isError = status.type === "error";
  return (
    <div
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg border text-sm font-medium
        ${isError
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}
    >
      <span>
        {isError ? "⚠ " : "✅ "}
        {status.message}
      </span>
      <button
        onClick={onDismiss}
        className="text-xs opacity-50 hover:opacity-100 transition shrink-0 mt-0.5"
      >
        ✕
      </button>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, formatLabel }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {formatLabel ? formatLabel(o) : o}
        </option>
      ))}
    </select>
  </div>
);

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="text-3xl mb-3 text-center">🗑️</div>
        <h3 className="text-base font-bold text-slate-800 text-center mb-2">
          Confirm Deletion
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200
                       rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg
                       hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const DeleteCard = ({ icon, title, description, accent, children, onDelete, loading, disabled }) => {
  const accentMap = {
    orange: {
      border: "border-orange-200",
      iconBg: "bg-orange-50",
      btn: "bg-orange-600 hover:bg-orange-700",
      tag: "bg-orange-100 text-orange-700",
    },
    red: {
      border: "border-red-200",
      iconBg: "bg-red-50",
      btn: "bg-red-600 hover:bg-red-700",
      tag: "bg-red-100 text-red-700",
    },
    purple: {
      border: "border-purple-200",
      iconBg: "bg-purple-50",
      btn: "bg-purple-600 hover:bg-purple-700",
      tag: "bg-purple-100 text-purple-700",
    },
  };
  const c = accentMap[accent] || accentMap.red;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm overflow-hidden flex flex-col`}>
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center text-lg shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 flex flex-col gap-4 flex-1">
        {children}
      </div>

      {/* Card footer */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onDelete}
          disabled={loading || disabled}
          className={`w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg
                     ${c.btn} disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Deleting…
            </>
          ) : (
            <>🗑️ Delete Logs</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Card 1 — Filter-based delete ────────────────────────────────────────────

const FilteredDeleteCard = ({ onSuccess, onError }) => {
  const [table, setTable] = useState("*");
  const [operation, setOperation] = useState("*");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await deleteFilteredLogs({ table, operation });
      onSuccess(
        `Logs deleted successfully${table !== "*" ? ` for table "${table}"` : ""}${operation !== "*" ? ` with operation "${operation}"` : ""}.`
      );
    } catch (err) {
      onError(err?.response?.data?.message || "Failed to delete filtered logs.");
    } finally {
      setLoading(false);
    }
  };

  const confirmMessage =
    `This will permanently delete all logs${table !== "*" ? ` in table "${table}"` : ""}${operation !== "*" ? ` with operation "${operation}"` : ""}. This action cannot be undone.`;

  return (
    <>
      <DeleteCard
        icon="🔎"
        title="Delete by Filter"
        description="Delete logs matching a specific table and/or operation type."
        accent="orange"
        onDelete={() => setConfirm(true)}
        loading={loading}
      >
        <SelectField
          label="Table"
          value={table}
          onChange={setTable}
          options={TABLES}
          formatLabel={(t) => t === "*" ? "All Tables" : t}
        />
        <SelectField
          label="Operation"
          value={operation}
          onChange={setOperation}
          options={OPERATIONS}
          formatLabel={(op) => op === "*" ? "All Operations" : op}
        />
        {/* Preview */}
        <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 font-mono border border-slate-100">
          Will delete: table=<span className="text-orange-600 font-semibold">{table}</span>
          {" "}op=<span className="text-orange-600 font-semibold">{operation}</span>
        </div>
      </DeleteCard>

      <ConfirmModal
        isOpen={confirm}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
        message={confirmMessage}
        loading={loading}
      />
    </>
  );
};

// ─── Card 2 — Oldest N logs delete ───────────────────────────────────────────

const OldestDeleteCard = ({ onSuccess, onError }) => {
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const isValid = count !== "" && parseInt(count, 10) > 0;

  const handleDelete = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await deleteOldestLogs({ count: parseInt(count, 10) });
      onSuccess(`${count} oldest log${parseInt(count, 10) > 1 ? "s" : ""} deleted successfully.`);
      setCount("");
    } catch (err) {
      onError(err?.response?.data?.message || "Failed to delete oldest logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DeleteCard
        icon="⏳"
        title="Delete Oldest N Logs"
        description="Purge a specific number of the oldest log entries."
        accent="red"
        onDelete={() => setConfirm(true)}
        loading={loading}
        disabled={!isValid}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Number of Logs
          </label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {count && !isValid && (
            <p className="text-xs text-red-500">Please enter a positive number.</p>
          )}
        </div>

        {/* Filler to keep cards same height */}
        <div className="flex-1" />

        {isValid && (
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 font-mono border border-slate-100">
            Will delete: <span className="text-red-600 font-semibold">{count}</span> oldest record{parseInt(count, 10) > 1 ? "s" : ""}
          </div>
        )}
      </DeleteCard>

      <ConfirmModal
        isOpen={confirm}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
        message={`This will permanently delete the ${count} oldest log entries. This action cannot be undone.`}
        loading={loading}
      />
    </>
  );
};

// ─── Card 3 — Date range delete ───────────────────────────────────────────────

const DateRangeDeleteCard = ({ onSuccess, onError }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const rangeError =
    startDate && endDate && new Date(startDate) > new Date(endDate)
      ? "Start date must be before end date."
      : null;

  const isValid = startDate && endDate && !rangeError;

  const handleDelete = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await deleteLogsBetweenDates({ startDate, endDate });
      onSuccess(`Logs between ${startDate} and ${endDate} deleted successfully.`);
      setStartDate("");
      setEndDate(todayISO());
    } catch (err) {
      onError(err?.response?.data?.message || "Failed to delete logs for the date range.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DeleteCard
        icon="📅"
        title="Delete by Date Range"
        description="Remove all logs created between two dates (inclusive)."
        accent="purple"
        onDelete={() => setConfirm(true)}
        loading={loading}
        disabled={!isValid}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            max={endDate || todayISO()}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={todayISO()}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {rangeError && (
          <p className="text-xs text-red-500">{rangeError}</p>
        )}

        {isValid && (
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 font-mono border border-slate-100">
            Range: <span className="text-purple-600 font-semibold">{startDate}</span>
            {" → "}
            <span className="text-purple-600 font-semibold">{endDate}</span>
          </div>
        )}
      </DeleteCard>

      <ConfirmModal
        isOpen={confirm}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
        message={`This will permanently delete all logs between ${startDate} and ${endDate}. This action cannot be undone.`}
        loading={loading}
      />
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeleteAuditLogs() {
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const handleSuccess = (message) => setStatus({ type: "success", message });
  const handleError = (message) => setStatus({ type: "error", message });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Delete Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Permanently remove log entries by filter, count, or date range.
            </p>
          </div>

          {/* Danger notice badge */}
          <div className="self-center px-4 py-2 rounded-lg border bg-red-50 border-red-200 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="text-xs font-bold text-red-700">Irreversible Action</div>
              <div className="text-xs text-red-500 mt-0.5">Deleted logs cannot be recovered.</div>
            </div>
          </div>
        </div>

        {/* Tab-like header strip */}
        <div className="flex gap-1">
          <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2
            border-indigo-600 text-indigo-600 bg-slate-50 rounded-t-md">
            <span>🗑️</span>
            Delete Logs
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-6 max-w-6xl">

        {/* Status banner */}
        {status && (
          <div className="mb-6">
            <StatusBanner status={status} onDismiss={() => setStatus(null)} />
          </div>
        )}

        {/* 3-column card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <FilteredDeleteCard onSuccess={handleSuccess} onError={handleError} />
          <OldestDeleteCard onSuccess={handleSuccess} onError={handleError} />
          <DateRangeDeleteCard onSuccess={handleSuccess} onError={handleError} />
        </div>

        {/* Footer note */}
        <p className="mt-5 text-xs text-slate-400">
          💡 Each delete action requires confirmation before execution. All operations call stored procedures on the server.
        </p>
      </div>
    </div>
  );
}