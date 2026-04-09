import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllAuditLogs,
  filterAuditLogs,
  deleteFilteredLogs,
  deleteOldestLogs,
  deleteLogsBetweenDates,
  countLogsBetweenDates,
} from "../../api/admin.js"; // adjust path as needed

/* ─── constants ─── */
const TABLES = [
  "*",
  "users",
  "vehicles",
  "payment",
  "vehicle_ownership",
  "driving_licence",
  "documents",
  "violation_types",
  "rto",
];
const OPS = ["*", "INSERT", "UPDATE", "DELETE"];

/* ─── styles ─── */
const S = {
  // layout
  root: {
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    fontSize: "14px",
    color: "var(--color-text-primary)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "1.25rem 1.5rem",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
  },
  h1: {
    fontSize: "15px",
    fontWeight: 500,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  h1Dollar: {
    fontFamily: "var(--font-mono, monospace)",
    color: "var(--color-text-secondary, #64748b)",
  },
  badge: {
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.06em",
    padding: "2px 8px",
    borderRadius: "6px",
    background: "var(--color-background-secondary, #f8fafc)",
    color: "var(--color-text-secondary, #64748b)",
    border: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
  },
  rowCount: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "12px",
    color: "var(--color-text-secondary, #64748b)",
    marginLeft: "auto",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    minHeight: "500px",
  },
  // sidebar
  sidebar: {
    padding: "0 1rem 1.5rem 1.5rem",
    borderRight: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    padding: "1rem 0",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionLast: {
    padding: "1rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--color-text-secondary, #64748b)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "2px",
  },
  label: {
    fontSize: "12px",
    color: "var(--color-text-secondary, #64748b)",
    display: "block",
    marginBottom: "3px",
  },
  select: {
    width: "100%",
    fontSize: "13px",
    padding: "5px 8px",
    boxSizing: "border-box",
    border: "0.5px solid var(--color-border-secondary, #cbd5e1)",
    borderRadius: "6px",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary)",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
  },
  input: {
    width: "100%",
    fontSize: "13px",
    padding: "5px 8px",
    boxSizing: "border-box",
    border: "0.5px solid var(--color-border-secondary, #cbd5e1)",
    borderRadius: "6px",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  // buttons
  btn: {
    fontSize: "12px",
    fontWeight: 500,
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "0.5px solid var(--color-border-secondary, #cbd5e1)",
    background: "transparent",
    color: "var(--color-text-primary)",
    width: "100%",
    textAlign: "center",
  },
  btnPrimary: {
    fontSize: "12px",
    fontWeight: 500,
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "0.5px solid var(--color-border-info, #93c5fd)",
    background: "transparent",
    color: "var(--color-text-info, #1d4ed8)",
    width: "100%",
    textAlign: "center",
  },
  btnDanger: {
    fontSize: "12px",
    fontWeight: 500,
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "0.5px solid var(--color-border-danger, #fca5a5)",
    background: "transparent",
    color: "var(--color-text-danger, #dc2626)",
    width: "100%",
    textAlign: "center",
  },
  btnToolbar: {
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "6px",
    border: "0.5px solid var(--color-border-secondary, #cbd5e1)",
    background: "transparent",
    color: "var(--color-text-secondary, #64748b)",
    cursor: "pointer",
  },
  countBadge: {
    fontSize: "12px",
    padding: "5px 8px",
    borderRadius: "6px",
    background: "var(--color-background-success, #f0fdf4)",
    color: "var(--color-text-success, #16a34a)",
    textAlign: "center",
  },
  // main
  main: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0.75rem 1.25rem",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
  },
  tableWrap: {
    overflowX: "auto",
    flex: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12.5px",
  },
  th: {
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--color-text-secondary, #64748b)",
    textAlign: "left",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    background: "var(--color-background-secondary, #f8fafc)",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
  },
  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
    verticalAlign: "top",
  },
  // modal
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1rem",
  },
  modal: {
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
    borderRadius: "12px",
    padding: "1.5rem",
    maxWidth: "360px",
    width: "100%",
  },
  modalTitle: {
    fontSize: "15px",
    fontWeight: 500,
    margin: "0 0 6px",
  },
  modalMsg: {
    fontSize: "13px",
    color: "var(--color-text-secondary, #64748b)",
    margin: "0 0 1.25rem",
  },
  modalActions: {
    display: "flex",
    gap: "8px",
  },
  modalCancel: {
    flex: 1,
    padding: "7px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    border: "0.5px solid var(--color-border-secondary, #cbd5e1)",
    background: "transparent",
    color: "var(--color-text-primary)",
  },
  modalConfirm: {
    flex: 1,
    padding: "7px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    border: "0.5px solid var(--color-border-danger, #fca5a5)",
    background: "var(--color-background-danger, #fef2f2)",
    color: "var(--color-text-danger, #dc2626)",
  },
  // misc
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "4rem 2rem",
    color: "var(--color-text-secondary, #64748b)",
    fontSize: "13px",
  },
  muted: {
    color: "var(--color-text-secondary, #64748b)",
  },
  mono: {
    fontFamily: "var(--font-mono, monospace)",
  },
};

/* ─── op pill ─── */
const OP_STYLES = {
  INSERT: {
    background: "#eaf3de",
    color: "#3b6d11",
    border: "0.5px solid #c0dd97",
  },
  UPDATE: {
    background: "#e6f1fb",
    color: "#185fa5",
    border: "0.5px solid #b5d4f4",
  },
  DELETE: {
    background: "#fcebeb",
    color: "#a32d2d",
    border: "0.5px solid #f7c1c1",
  },
};

function OpPill({ op }) {
  const style = OP_STYLES[op] ?? {
    background: "#f1f5f9",
    color: "#64748b",
    border: "0.5px solid #e2e8f0",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 500,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {op}
    </span>
  );
}

/* ─── json cell ─── */
function JsonCell({ data }) {
  const [open, setOpen] = useState(false);
  if (!data)
    return (
      <span style={{ ...S.mono, fontSize: "11px", fontStyle: "italic", ...S.muted }}>
        null
      </span>
    );
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <pre
      onClick={() => setOpen((v) => !v)}
      title={open ? "Click to collapse" : "Click to expand"}
      style={{
        fontSize: "11px",
        fontFamily: "var(--font-mono, monospace)",
        color: "var(--color-text-secondary, #64748b)",
        background: "var(--color-background-secondary, #f8fafc)",
        border: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
        borderRadius: "6px",
        padding: "6px 8px",
        cursor: "pointer",
        maxWidth: "260px",
        overflow: open ? "auto" : "hidden",
        maxHeight: open ? "320px" : "48px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        margin: 0,
        transition: "max-height 0.2s",
      }}
    >
      {text}
    </pre>
  );
}

/* ─── confirm modal ─── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={S.modalBg} onClick={onCancel}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={S.modalTitle}>Confirm action</h3>
        <p style={S.modalMsg}>{message}</p>
        <div style={S.modalActions}>
          <button style={S.modalCancel} onClick={onCancel}>
            Cancel
          </button>
          <button style={S.modalConfirm} onClick={onConfirm}>
            Confirm delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── spinner ─── */
function Spinner() {
  return (
    <div
      style={{
        width: "20px",
        height: "20px",
        border: "2px solid var(--color-border-tertiary, #e2e8f0)",
        borderTopColor: "var(--color-text-secondary, #64748b)",
        borderRadius: "50%",
        animation: "al-spin 0.7s linear infinite",
      }}
    />
  );
}

/* ─── main component ─── */
export default function AuditLogs() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const [countResult, setCountResult] = useState(null);

  // filter
  const [filterTable, setFilterTable] = useState("*");
  const [filterOp, setFilterOp]       = useState("*");

  // delete filtered
  const [delTable, setDelTable] = useState("*");
  const [delOp, setDelOp]       = useState("*");

  // delete oldest
  const [oldestCount, setOldestCount] = useState("");

  // date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  /* fetch all */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAuditLogs();
      setLogs(res.data?.data ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* filter */
  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await filterAuditLogs(filterTable, filterOp);
      const data = res.data?.data ?? [];
      setLogs(data);
      toast.success(`${data.length} log(s) loaded`);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Filter failed");
    } finally {
      setLoading(false);
    }
  };

  /* confirm helper */
  const withConfirm = (message, fn) =>
    setConfirm({ message, onConfirm: () => { setConfirm(null); fn(); } });

  /* delete filtered */
  const handleDeleteFiltered = () =>
    withConfirm(
      `Delete all logs where table = "${delTable}" and operation = "${delOp}"?`,
      async () => {
        try {
          await deleteFilteredLogs({ table: delTable, operation: delOp });
          toast.success("Filtered logs deleted");
          fetchAll();
        } catch (e) {
          toast.error(e?.response?.data?.message ?? "Delete failed");
        }
      }
    );

  /* delete oldest */
  const handleDeleteOldest = () => {
    const n = parseInt(oldestCount, 10);
    if (!n || n <= 0) { toast.error("Enter a valid count"); return; }
    withConfirm(
      `Permanently delete the ${n} oldest log(s)?`,
      async () => {
        try {
          await deleteOldestLogs({ count: n });
          toast.success(`${n} oldest log(s) deleted`);
          setOldestCount("");
          fetchAll();
        } catch (e) {
          toast.error(e?.response?.data?.message ?? "Delete failed");
        }
      }
    );
  };

  /* delete date range */
  const handleDeleteDateRange = () => {
    if (!startDate || !endDate) { toast.error("Both dates are required"); return; }
    if (new Date(startDate) > new Date(endDate)) { toast.error("Start must be before end"); return; }
    withConfirm(
      `Delete all logs between ${startDate} and ${endDate}?`,
      async () => {
        try {
          await deleteLogsBetweenDates({ startDate, endDate });
          toast.success("Logs in date range deleted");
          fetchAll();
        } catch (e) {
          toast.error(e?.response?.data?.message ?? "Delete failed");
        }
      }
    );
  };

  /* count date range */
  const handleCountDateRange = async () => {
    if (!startDate || !endDate) { toast.error("Both dates are required"); return; }
    if (new Date(startDate) > new Date(endDate)) { toast.error("Start must be before end"); return; }
    try {
      const res = await countLogsBetweenDates(startDate, endDate);
      setCountResult(res.data?.data?.count ?? 0);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Count failed");
    }
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <>
      {/* spinner keyframe injected once */}
      <style>{`@keyframes al-spin { to { transform: rotate(360deg); } }`}</style>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-background-primary, #fff)",
            color: "var(--color-text-primary, #0f172a)",
            border: "0.5px solid var(--color-border-tertiary, #e2e8f0)",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "none",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={S.root}>
        {/* header */}
        <div style={S.header}>
          <h1 style={S.h1}>
            <span style={S.h1Dollar}>$</span> audit_logs
          </h1>
          <span style={S.badge}>ADMIN</span>
          <span style={S.rowCount}>{logs.length} row{logs.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={S.layout}>
          {/* ── SIDEBAR ── */}
          <aside style={S.sidebar}>

            {/* filter */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Filter &amp; view</div>
              <div>
                <label style={S.label}>Table</label>
                <select style={S.select} value={filterTable} onChange={e => setFilterTable(e.target.value)}>
                  {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Operation</label>
                <select style={S.select} value={filterOp} onChange={e => setFilterOp(e.target.value)}>
                  {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button style={S.btnPrimary} onClick={handleFilter}>
                Apply filter
              </button>
            </div>

            {/* delete filtered */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Delete by filter</div>
              <div>
                <label style={S.label}>Table</label>
                <select style={S.select} value={delTable} onChange={e => setDelTable(e.target.value)}>
                  {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Operation</label>
                <select style={S.select} value={delOp} onChange={e => setDelOp(e.target.value)}>
                  {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button style={S.btnDanger} onClick={handleDeleteFiltered}>
                Delete matching
              </button>
            </div>

            {/* delete oldest */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Delete oldest N</div>
              <div>
                <label style={S.label}>Count</label>
                <input
                  style={S.input}
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={oldestCount}
                  onChange={e => setOldestCount(e.target.value)}
                />
              </div>
              <button style={S.btnDanger} onClick={handleDeleteOldest}>
                Delete oldest
              </button>
            </div>

            {/* date range */}
            <div style={S.sectionLast}>
              <div style={S.sectionTitle}>Date range</div>
              <div>
                <label style={S.label}>Start date</label>
                <input
                  style={S.input}
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setCountResult(null); }}
                />
              </div>
              <div>
                <label style={S.label}>End date</label>
                <input
                  style={S.input}
                  type="date"
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setCountResult(null); }}
                />
              </div>
              {countResult !== null && (
                <div style={S.countBadge}>{countResult} log(s) in range</div>
              )}
              <button style={S.btn} onClick={handleCountDateRange}>
                Count in range
              </button>
              <button style={S.btnDanger} onClick={handleDeleteDateRange}>
                Delete in range
              </button>
            </div>

          </aside>

          {/* ── MAIN TABLE ── */}
          <main style={S.main}>
            <div style={S.toolbar}>
              <button
                style={S.btnToolbar}
                onClick={fetchAll}
                disabled={loading}
              >
                ↺ Refresh
              </button>
            </div>

            <div style={S.tableWrap}>
              {loading ? (
                <div style={S.empty}>
                  <Spinner />
                  Loading logs…
                </div>
              ) : logs.length === 0 ? (
                <div style={S.empty}>No logs found.</div>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["Log ID", "Table", "Operation", "Record ID", "Old data", "New data", "Changed at"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.log_id}>
                        <td style={{ ...S.td, ...S.muted, ...S.mono, fontSize: "11px" }}>
                          #{log.log_id}
                        </td>
                        <td style={S.td}>{log.table_name}</td>
                        <td style={S.td}>
                          <OpPill op={log.operation_type} />
                        </td>
                        <td style={{ ...S.td, ...S.mono, fontSize: "12px" }}>
                          {log.record_id ?? "—"}
                        </td>
                        <td style={S.td}>
                          <JsonCell data={log.old_data} />
                        </td>
                        <td style={S.td}>
                          <JsonCell data={log.new_data} />
                        </td>
                        <td style={{ ...S.td, ...S.muted, whiteSpace: "nowrap", fontSize: "12px" }}>
                          {fmtDate(log.changed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}