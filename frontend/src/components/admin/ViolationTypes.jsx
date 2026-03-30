import { useState, useEffect } from "react";
import { getAllViolationTypes } from "../../api/admin.js";
 
const tagColors = [
  { bg: "#fff3cd", text: "#7d5a00", border: "#f5c518" },
  { bg: "#fde8e8", text: "#8b1a1a", border: "#e57373" },
  { bg: "#e8f5e9", text: "#1b5e20", border: "#66bb6a" },
  { bg: "#e3f2fd", text: "#0d3c6e", border: "#42a5f5" },
  { bg: "#f3e5f5", text: "#4a148c", border: "#ab47bc" },
  { bg: "#fff8e1", text: "#5d4037", border: "#ffca28" },
];
 
const SkeletonCard = () => (
  <div style={{
    background: "#fff",
    border: "1.5px solid #f0f0f0",
    borderRadius: "14px",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    animation: "pulse 1.5s ease-in-out infinite",
  }}>
    <div style={{ height: "13px", width: "55%", background: "#f0f0f0", borderRadius: "6px" }} />
    <div style={{ height: "22px", width: "80%", background: "#f0f0f0", borderRadius: "6px" }} />
    <div style={{ height: "13px", width: "40%", background: "#f0f0f0", borderRadius: "6px" }} />
    <div style={{ height: "13px", width: "65%", background: "#f0f0f0", borderRadius: "6px" }} />
  </div>
);
 
export default function ViolationTypes() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  // const [hovered, setHovered] = useState(null);
 
  useEffect(() => {
    getAllViolationTypes()
      .then((res) => {
        setViolations(res.data?.data || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load violation types.");
        setLoading(false);
      });
  }, []);
 
  const filtered = violations.filter((v) =>
    (v.name || v.violationType || "").toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f8fa",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .violation-card {
          animation: fadeUp 0.35s ease both;
          transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
        }
        .violation-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(30,40,80,0.10);
          border-color: #c8d0e7 !important;
        }
        .search-input:focus {
          outline: none;
          border-color: #4f6ef7 !important;
          box-shadow: 0 0 0 3px rgba(79,110,247,0.10);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: "3px 10px";
          border-radius: "20px";
          font-size: "11.5px";
          font-weight: 600;
          letter-spacing: "0.3px";
        }
      `}</style>
 
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1.5px solid #ebebeb",
        padding: "32px 48px 24px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
      }}>
        <div>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2px",
            color: "#4f6ef7",
            textTransform: "uppercase",
            marginBottom: "6px",
            fontFamily: "'DM Mono', monospace",
          }}>
            Admin Panel
          </div>
          <h1 style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#151a2d",
            letterSpacing: "-0.5px",
          }}>
            Violation Types
          </h1>
          <p style={{ margin: "6px 0 0", color: "#8a94a8", fontSize: "14px" }}>
            {loading ? "Loading..." : `${filtered.length} violation${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
 
        {/* Search */}
        <input
          className="search-input"
          type="text"
          placeholder="Search violations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1.5px solid #e2e6f0",
            fontSize: "14px",
            width: "240px",
            background: "#f7f8fa",
            color: "#151a2d",
            fontFamily: "inherit",
            transition: "border-color 0.18s, box-shadow 0.18s",
          }}
        />
      </div>
 
      {/* Content */}
      <div style={{ padding: "36px 48px" }}>
        {error && (
          <div style={{
            background: "#fde8e8",
            border: "1.5px solid #e57373",
            borderRadius: "12px",
            padding: "18px 24px",
            color: "#8b1a1a",
            fontSize: "14px",
            fontWeight: 500,
          }}>
            ⚠ {error}
          </div>
        )}
 
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#8a94a8",
          }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#151a2d" }}>No results found</div>
            <div style={{ fontSize: "14px", marginTop: "6px" }}>Try adjusting your search.</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {filtered.map((v, i) => {
              const tag = tagColors[i % tagColors.length];
              const name = v.description || "Unknown";
              const fine = v.penalty_amount || 1000;
              const desc = v.description || null;
              const code = v.offence_section|| null;
              console.log(code);
              return (
                <div
                  key={v.violation_type_id || i}
                  className="violation-card"
                  style={{
                    animationDelay: `${i * 0.045}s`,
                    background: "#fff",
                    border: "1.5px solid #eaecf4",
                    borderRadius: "14px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    cursor: "default",
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{
                      background: tag.bg,
                      color: tag.text,
                      border: `1.5px solid ${tag.border}`,
                      padding: "3px 11px",
                      borderRadius: "20px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      whiteSpace: "nowrap",
                    }}>
                      {"Violation"}
                    </span>
                    {code && (
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "11px",
                        color: "#8a94a8",
                        background: "#f7f8fa",
                        padding: "3px 9px",
                        borderRadius: "6px",
                        border: "1px solid #e2e6f0",
                      }}>
                        {code}
                      </span>
                    )}
                  </div>
 
                  {/* Name */}
                  <div style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#151a2d",
                    letterSpacing: "-0.2px",
                    lineHeight: 1.3,
                  }}>
                    {name}
                  </div>
 
                  {/* Description */}
                  {desc && (
                    <div style={{
                      fontSize: "13.5px",
                      color: "#6b7280",
                      lineHeight: 1.6,
                    }}>
                      {desc}
                    </div>
                  )}
 
                  {/* Divider */}
                  <div style={{ borderTop: "1px solid #f0f0f0", marginTop: "4px" }} />
 
                  {/* Fine */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#8a94a8", fontWeight: 500 }}>Fine Amount</span>
                    <span style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: fine != null ? "#1b7a3e" : "#bbb",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {fine != null ? `₹${Number(fine).toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}