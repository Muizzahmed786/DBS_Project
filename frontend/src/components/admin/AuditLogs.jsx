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

/* ─── styles ─── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0a0c10;
      --surface:   #111318;
      --border:    #1e2230;
      --border-hi: #2e3450;
      --accent:    #00e5ff;
      --accent2:   #ff4d6d;
      --accent3:   #7b61ff;
      --text:      #c8d0e8;
      --muted:     #4a5068;
      --mono:      'IBM Plex Mono', monospace;
      --sans:      'IBM Plex Sans', sans-serif;
      --radius:    6px;
      --shadow:    0 4px 24px rgba(0,0,0,.5);
    }

    body { background: var(--bg); color: var(--text); font-family: var(--sans); }

    .al-root {
      min-height: 100vh;
      padding: 32px 24px;
      max-width: 1280px;
      margin: 0 auto;
    }

    .al-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 36px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }
    .al-header h1 {
      font-family: var(--mono);
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .al-header h1 span { color: var(--accent); }
    .al-badge {
      font-family: var(--mono);
      font-size: 0.7rem;
      padding: 3px 8px;
      border: 1px solid var(--accent);
      border-radius: 40px;
      color: var(--accent);
      letter-spacing: .08em;
    }

    .al-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
    @media (max-width: 860px) { .al-layout { grid-template-columns: 1fr; } }

    .al-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .al-panel-title {
      font-family: var(--mono);
      font-size: 0.68rem;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .al-divider { border: none; border-top: 1px solid var(--border); }

    .al-label {
      font-size: 0.72rem;
      color: var(--muted);
      margin-bottom: 5px;
      display: block;
      font-family: var(--mono);
      letter-spacing: .06em;
    }
    .al-input, .al-select {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border-hi);
      border-radius: var(--radius);
      color: var(--text);
      font-family: var(--mono);
      font-size: 0.8rem;
      padding: 8px 10px;
      outline: none;
      transition: border-color .18s;
    }
    .al-input:focus, .al-select:focus { border-color: var(--accent); }
    .al-select option { background: var(--surface); }

    .al-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      border-radius: var(--radius);
      padding: 9px 14px;
      font-family: var(--mono);
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: .04em;
      cursor: pointer;
      transition: opacity .15s, transform .1s;
      width: 100%;
    }
    .al-btn:active { transform: scale(.97); }
    .al-btn:disabled { opacity: .4; cursor: not-allowed; }
    .al-btn-primary { background: var(--accent); color: #000; }
    .al-btn-danger  { background: var(--accent2); color: #fff; }
    .al-btn-ghost   {
      background: transparent;
      border: 1px solid var(--border-hi);
      color: var(--text);
    }
    .al-btn-ghost:hover { border-color: var(--accent3); color: var(--accent3); }
    .al-btn-toolbar { width: auto; padding: 8px 16px; }

    .al-count-result {
      font-family: var(--mono);
      font-size: 0.78rem;
      padding: 10px 12px;
      background: rgba(123,97,255,.12);
      border: 1px solid rgba(123,97,255,.3);
      border-radius: var(--radius);
      color: var(--accent3);
      text-align: center;
    }

    .al-main { display: flex; flex-direction: column; gap: 16px; }
    .al-toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

    .al-table-wrap {
      overflow-x: auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .al-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
    .al-table thead { position: sticky; top: 0; z-index: 1; }
    .al-table th {
      background: #0d0f16;
      color: var(--muted);
      font-family: var(--mono);
      font-size: 0.65rem;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 11px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    .al-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      font-family: var(--mono);
      color: var(--text);
      max-width: 260px;
    }
    .al-table tr:last-child td { border-bottom: none; }
    .al-table tr:hover td { background: rgba(255,255,255,.02); }

    .al-op {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.65rem;
      font-family: var(--mono);
      letter-spacing: .08em;
      font-weight: 600;
    }
    .al-op-INSERT { background: rgba(0,229,255,.12);  color: var(--accent);  border: 1px solid rgba(0,229,255,.25); }
    .al-op-UPDATE { background: rgba(123,97,255,.12); color: var(--accent3); border: 1px solid rgba(123,97,255,.25); }
    .al-op-DELETE { background: rgba(255,77,109,.12); color: var(--accent2); border: 1px solid rgba(255,77,109,.25); }

    .al-json {
      font-family: var(--mono);
      font-size: 0.68rem;
      color: var(--muted);
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 72px;
      overflow: hidden;
      cursor: pointer;
      transition: max-height .2s ease, color .15s;
    }
    .al-json.expanded { max-height: 400px; color: var(--text); }
    .al-json-null { color: #2e3450; font-style: italic; font-family: var(--mono); font-size: 0.72rem; }

    .al-empty {
      text-align: center;
      padding: 56px 0;
      color: var(--muted);
      font-family: var(--mono);
      font-size: 0.82rem;
    }
    .al-spinner {
      width: 22px; height: 22px;
      border: 2px solid var(--border-hi);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin .7s linear infinite;
      margin: 0 auto 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .al-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 200;
      backdrop-filter: blur(4px);
    }
    .al-modal {
      background: var(--surface);
      border: 1px solid var(--border-hi);
      border-radius: 10px;
      padding: 28px 32px;
      max-width: 380px;
      width: 90%;
      box-shadow: var(--shadow);
    }
    .al-modal h3 {
      font-family: var(--mono);
      font-size: 1rem;
      color: #fff;
      margin-bottom: 10px;
    }
    .al-modal p {
      font-size: 0.82rem;
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 22px;
    }
    .al-modal-actions { display: flex; gap: 10px; }
    .al-modal-actions .al-btn { width: auto; flex: 1; }
  `}</style>
);

/* ─── constants ─── */
const TABLES =  [
  "*",
  "users",
  "vehicles",
  "payment",
  "vehicle_ownership",
  "driving_licence",
  "documents",
  "violation_types",
  "rto"
];
const OPS    = ["*", "INSERT", "UPDATE", "DELETE"];

/* ─── sub-components ─── */
function OpPill({ op }) {
  return <span className={`al-op al-op-${op}`}>{op}</span>;
}

function JsonCell({ data }) {
  const [open, setOpen] = useState(false);
  if (!data) return <span className="al-json-null">null</span>;
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <pre
      className={`al-json${open ? " expanded" : ""}`}
      onClick={() => setOpen(v => !v)}
      title={open ? "collapse" : "expand"}
    >
      {text}
    </pre>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="al-overlay" onClick={onCancel}>
      <div className="al-modal" onClick={e => e.stopPropagation()}>
        <h3>Confirm Action</h3>
        <p>{message}</p>
        <div className="al-modal-actions">
          <button className="al-btn al-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="al-btn al-btn-danger" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
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
      console.log(res);
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
      <GlobalStyle />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#111318",
            color: "#c8d0e8",
            border: "1px solid #2e3450",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.76rem",
          },
          success: { iconTheme: { primary: "#00e5ff", secondary: "#111318" } },
          error:   { iconTheme: { primary: "#ff4d6d", secondary: "#111318" } },
        }}
      />

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="al-root">
        {/* header */}
        <div className="al-header">
          <h1><span>$</span> audit_logs</h1>
          <span className="al-badge">ADMIN</span>
        </div>

        <div className="al-layout">
          {/* ── SIDEBAR ── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* filter */}
            <div className="al-panel">
              <div className="al-panel-title">Filter &amp; View</div>
              <div>
                <label className="al-label">Table</label>
                <select className="al-select" value={filterTable} onChange={e => setFilterTable(e.target.value)}>
                  {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="al-label">Operation</label>
                <select className="al-select" value={filterOp} onChange={e => setFilterOp(e.target.value)}>
                  {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button className="al-btn al-btn-primary" onClick={handleFilter}>
                Apply Filter
              </button>
            </div>

            <hr className="al-divider" />

            {/* delete filtered */}
            <div className="al-panel">
              <div className="al-panel-title">Delete by Filter</div>
              <div>
                <label className="al-label">Table</label>
                <select className="al-select" value={delTable} onChange={e => setDelTable(e.target.value)}>
                  {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="al-label">Operation</label>
                <select className="al-select" value={delOp} onChange={e => setDelOp(e.target.value)}>
                  {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button className="al-btn al-btn-danger" onClick={handleDeleteFiltered}>
                Delete Matching
              </button>
            </div>

            <hr className="al-divider" />

            {/* delete oldest */}
            <div className="al-panel">
              <div className="al-panel-title">Delete Oldest N</div>
              <div>
                <label className="al-label">Count</label>
                <input
                  className="al-input"
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={oldestCount}
                  onChange={e => setOldestCount(e.target.value)}
                />
              </div>
              <button className="al-btn al-btn-danger" onClick={handleDeleteOldest}>
                Delete Oldest
              </button>
            </div>

            <hr className="al-divider" />

            {/* date range */}
            <div className="al-panel">
              <div className="al-panel-title">Date Range</div>
              <div>
                <label className="al-label">Start Date</label>
                <input
                  className="al-input"
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setCountResult(null); }}
                />
              </div>
              <div>
                <label className="al-label">End Date</label>
                <input
                  className="al-input"
                  type="date"
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setCountResult(null); }}
                />
              </div>

              {countResult !== null && (
                <div className="al-count-result">
                  {countResult} log(s) in range
                </div>
              )}

              <button className="al-btn al-btn-ghost" onClick={handleCountDateRange}>
                Count in Range
              </button>
              <button className="al-btn al-btn-danger" onClick={handleDeleteDateRange}>
                Delete in Range
              </button>
            </div>

          </aside>

          {/* ── MAIN TABLE ── */}
          <main className="al-main">
            <div className="al-toolbar">
              <button
                className="al-btn al-btn-ghost al-btn-toolbar"
                onClick={fetchAll}
                disabled={loading}
              >
                ↺ Refresh
              </button>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--muted)", marginLeft: "auto" }}>
                {logs.length} row(s)
              </span>
            </div>

            <div className="al-table-wrap">
              {loading ? (
                <div className="al-empty">
                  <div className="al-spinner" />
                  Loading logs…
                </div>
              ) : logs.length === 0 ? (
                <div className="al-empty">No logs found.</div>
              ) : (
                <table className="al-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Table</th>
                      <th>Operation</th>
                      <th>Record ID</th>
                      <th>Old Data</th>
                      <th>New Data</th>
                      <th>Changed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.log_id}>
                        <td style={{ color: "var(--muted)" }}>#{log.log_id}</td>
                        <td>{log.table_name}</td>
                        <td><OpPill op={log.operation_type} /></td>
                        <td>{log.record_id ?? "—"}</td>
                        <td><JsonCell data={log.old_data} /></td>
                        <td><JsonCell data={log.new_data} /></td>
                        <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>
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