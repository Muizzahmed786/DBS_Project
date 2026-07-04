import { useState, useEffect, useMemo } from "react";
import { getAllAuditLogs, filterAuditLogs } from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLES = ["*", "users", "vehicles", "ownership", "rto", "documents","payment"];
const OPERATIONS = ["*", "INSERT", "UPDATE", "DELETE", "SELECT"];

const OPERATION_COLORS = {
  INSERT: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  SELECT: "bg-slate-100 text-slate-600",
};

const OPERATION_ICONS = {
  INSERT: "➕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  SELECT: "👁",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3 rounded-full bg-slate-100 animate-pulse"
          style={{ width: `${[45, 55, 40, 50, 38, 42, 36][i % 7]}%` }}
        />
      </td>
    ))}
  </tr>
);

const EmptyState = () => (
  <tr>
    <td colSpan={20} className="py-20 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-slate-500 font-medium">No audit logs found</p>
      <p className="text-slate-400 text-sm mt-1">
        Try a different filter combination.
      </p>
    </td>
  </tr>
);

const OperationBadge = ({ operation }) => {
  const cls =
    OPERATION_COLORS[(operation || "").toUpperCase()] ||
    "bg-slate-100 text-slate-600";
  const icon = OPERATION_ICONS[(operation || "").toUpperCase()] || "•";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${cls}`}
    >
      <span>{icon}</span>
      {operation || "—"}
    </span>
  );
};

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
  <th
    onClick={() => !noSort && onSort(col)}
    className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
      ${!noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
  >
    {label}
    {!noSort && (
      <span className="ml-1 text-xs">
        {sortCol === col ? (
          sortDir === "asc" ? (
            "▲"
          ) : (
            "▼"
          )
        ) : (
          <span className="text-slate-300">⇅</span>
        )}
      </span>
    )}
  </th>
);

const TableWrap = ({ children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  </div>
);

const Toolbar = ({ search, setSearch, count, total }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
        🔍
      </span>
      <input
        type="text"
        placeholder="Search logs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-72
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
    </div>
    <span className="text-xs text-slate-400 font-mono">
      {count} / {total} records
    </span>
  </div>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterBar = ({ table, setTable, operation, setOperation, onFetch, loading, isFiltered }) => (
  <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
    {/* Table selector */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Table
      </label>
      <select
        value={table}
        onChange={(e) => setTable(e.target.value)}
        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-w-32"
      >
        {TABLES.map((t) => (
          <option key={t} value={t}>
            {t === "*" ? "All Tables" : t}
          </option>
        ))}
      </select>
    </div>

    {/* Operation selector */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Operation
      </label>
      <select
        value={operation}
        onChange={(e) => setOperation(e.target.value)}
        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-w-36"
      >
        {OPERATIONS.map((op) => (
          <option key={op} value={op}>
            {op === "*" ? "All Operations" : op}
          </option>
        ))}
      </select>
    </div>

    {/* Fetch button */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider opacity-0 select-none">
        &nbsp;
      </label>
      <button
        onClick={onFetch}
        disabled={loading}
        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {loading ? "Loading…" : "Apply Filter"}
      </button>
    </div>

    {/* Active filter indicator */}
    {isFiltered && (
      <div className="flex items-center gap-2 ml-2 self-end mb-0.5">
        <span className="text-xs text-slate-500">Filtered by</span>
        {table !== "*" && (
          <span className="text-xs font-bold font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
            table: {table}
          </span>
        )}
        {operation !== "*" && (
          <span className="text-xs font-bold font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
            op: {operation}
          </span>
        )}
      </div>
    )}
  </div>
);

// ─── Audit Logs Table ─────────────────────────────────────────────────────────

const AuditLogsTable = ({ rows, loading }) => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("changed_at");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [
        r.log_id,
        r.table_name,
        r.operation_type,
        r.changed_by,
        r.record_id,
      ].some((v) => String(v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);

  const cols = [
    { key: "log_id", label: "Log ID" },
    { key: "table_name", label: "Table" },
    { key: "operation_type", label: "Operation", noSort: true },
    { key: "record_id", label: "Record ID" },
    { key: "changed_by", label: "Changed By" },
    { key: "changed_at", label: "Timestamp" },
    { key: "old_data", label: "Old Data", noSort: true },
    { key: "new_data", label: "New Data", noSort: true },
  ];

  const JsonCell = ({ value, rowKey, field }) => {
    const id = `${rowKey}-${field}`;
    const isExpanded = expandedRow === id;

    // value may already be an object (parsed by axios) or a JSON string or null
    let parsed = null;
    if (value && typeof value === "object") {
      parsed = value;
    } else if (value && typeof value === "string") {
      try { parsed = JSON.parse(value); } catch { /* raw string */ }
    }

    if (value === null || value === undefined || value === "" ||
        value === "null" || value === "{}" || value === "[]") {
      return <span className="text-slate-300 text-xs">—</span>;
    }

    if (parsed && typeof parsed === "object") {
      return (
        <div>
          <button
            onClick={() => setExpandedRow(isExpanded ? null : id)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-mono underline underline-offset-2"
          >
            {isExpanded ? "▲ collapse" : "▼ expand"}
          </button>
          {isExpanded && (
            <pre className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-600 max-w-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    return (
      <span className="text-xs font-mono text-slate-500 truncate max-w-[120px] block">
        {String(value)}
      </span>
    );
  };

  return (
    <>
      <Toolbar
        search={search}
        setSearch={setSearch}
        count={sorted.length}
        total={rows.length}
      />
      <TableWrap>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {cols.map((c) => (
              <SortTh
                key={c.key}
                {...c}
                col={c.key}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={handleSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} cols={cols.length} />
            ))
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            sorted.map((r, i) => (
              <tr
                key={r.log_id || i}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">
                  #{r.log_id || "—"}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-700 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                    {r.table_name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OperationBadge operation={r.operation_type} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {r.record_id || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {r.changed_by || "—"}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                  {fmtDate(r.changed_at)}
                </td>
                <td className="px-4 py-3 max-w-[160px]">
                  <JsonCell
                    value={r.old_data}
                    rowKey={r.log_id || i}
                    field="old"
                  />
                </td>
                <td className="px-4 py-3 max-w-[160px]">
                  <JsonCell
                    value={r.new_data}
                    rowKey={r.log_id || i}
                    field="new"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterTable, setFilterTable] = useState("*");
  const [filterOperation, setFilterOperation] = useState("*");
  const [isFiltered, setIsFiltered] = useState(false);

  // ── Stats derived from loaded logs ──
  const stats = useMemo(() => {
    const ops = ["INSERT", "UPDATE", "DELETE"];
    return [
      { label: "Total Logs", value: logs.length || "—" },
      ...ops.map((op) => ({
        label: `${op[0]}${op.slice(1).toLowerCase()}s`,
        value: logs.filter(
          (l) => (l.operation_type || "").toUpperCase() === op
        ).length,
        op,
      })),
    ];
  }, [logs]);

  const statColorMap = {
    INSERT: { bg: "bg-green-50 border-green-200", val: "text-green-600" },
    UPDATE: { bg: "bg-blue-50 border-blue-200", val: "text-blue-600" },
    DELETE: { bg: "bg-red-50 border-red-200", val: "text-red-600" },
  };

  // ── Initial fetch ──
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAuditLogs();
      setLogs(res.data?.data || res.data || []);
      setIsFiltered(false);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltered = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await filterAuditLogs(filterTable, filterOperation);
      setLogs(res.data?.data || res.data || []);
      setIsFiltered(filterTable !== "*" || filterOperation !== "*");
    } catch {
      setError(
        `Failed to load logs for table="${filterTable}", operation="${filterOperation}".`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
              Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all database changes, operations, and system activity.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 self-center">
            {stats.map((s) => {
              const colors = s.op ? statColorMap[s.op] : null;
              return (
                <div
                  key={s.label}
                  className={`px-4 py-2 rounded-lg border text-center min-w-25
                  ${colors ? `${colors.bg}` : "bg-white border-slate-200"}`}
                >
                  <div
                    className={`text-lg font-bold font-mono ${
                      colors ? colors.val : "text-slate-800"
                    }`}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab-like header strip */}
        <div className="flex gap-1">
          <div
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 
            border-indigo-600 text-indigo-600 bg-slate-50 rounded-t-md"
          >
            <span>📋</span>
            Audit Logs
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="ml-auto mb-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 
              disabled:opacity-40 transition self-center"
          >
            🔄 {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-6">
        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        {/* Filter bar */}
        <FilterBar
          table={filterTable}
          setTable={setFilterTable}
          operation={filterOperation}
          setOperation={setFilterOperation}
          onFetch={fetchFiltered}
          loading={loading}
          isFiltered={isFiltered}
        />

        {/* Table */}
        <AuditLogsTable rows={logs} loading={loading} />

        {/* Footer note */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span>
            💡 Click{" "}
            <span className="font-semibold text-indigo-500">▼ expand</span> on
            JSON values to inspect old / new record snapshots.
          </span>
        </div>
      </div>
    </div>
  );
}