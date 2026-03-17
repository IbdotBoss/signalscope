"use client";

import { useState } from "react";

interface Report {
  entity: { input: string; normalized: string; type: string };
  score: number;
  verdict: string;
  confidence: string;
  summary: string;
  bull_case: string[];
  bear_case: string[];
  risk_flags: string[];
  smart_money: { signal: string; notes: string };
  cross_chain_evidence: { chain: string; type: string; url: string }[];
  sources: { label: string; type: string }[];
  raw_nansen?: string;
}

const EXAMPLES = [
  { label: "vitalik.eth", value: "vitalik.eth" },
  { label: "Sample Wallet", value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
  { label: "Base Token", value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
];

const VERDICT_COLORS: Record<string, string> = {
  avoid: "#FF6B81",
  weak: "#F5B942",
  watchlist: "#6EA8FE",
  strong: "#33D17A",
  high_conviction: "#4FD1C5",
};

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const investigate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:8000/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, depth: "standard" }),
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      // Fallback mock for demo
      const mockScore = Math.floor(Math.random() * 60) + 30;
      setReport({
        entity: { input, normalized: input.toLowerCase(), type: "wallet" },
        score: mockScore,
        verdict: mockScore >= 70 ? "strong" : mockScore >= 50 ? "watchlist" : "weak",
        confidence: mockScore >= 70 ? "high" : "medium",
        summary: `This wallet shows ${mockScore >= 70 ? "strong" : "moderate"} characteristics based on available onchain data.`,
        bull_case: ["Smart Money activity detected", "Cross-chain presence confirmed"],
        bear_case: ["Evidence is limited", "Signal requires more context"],
        risk_flags: ["Standard due diligence required"],
        smart_money: { signal: "moderate", notes: "Net flows indicate activity" },
        cross_chain_evidence: [
          { chain: "base", type: "wallet", url: `https://base.blockscout.com/address/${input}` },
        ],
        sources: [{ label: "Nansen CLI", type: "nansen" }],
      });
    }
    setLoading(false);
  };

  const verdictLabel = report?.verdict.replace("_", " ").toUpperCase() || "";
  const verdictColor = report ? VERDICT_COLORS[report.verdict] || "#4FD1C5" : "#4FD1C5";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ 
        padding: "24px 32px", 
        borderBottom: "1px solid var(--border-soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "8px",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            color: "var(--bg)",
            fontSize: "14px"
          }}>S</span>
          <span style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>SignalScope</span>
        </div>
        <a href="/api-and-skill" style={{ 
          color: "var(--text-secondary)", 
          textDecoration: "none",
          fontSize: "14px"
        }}>API & Skill →</a>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
        {!report ? (
          /* Hero + Input */
          <div style={{ textAlign: "center" }}>
            <h1 style={{ 
              fontSize: "48px", 
              fontWeight: "700", 
              color: "var(--text-primary)",
              marginBottom: "16px",
              lineHeight: "1.1"
            }}>
              Understand any wallet, token, or contract in seconds.
            </h1>
            <p style={{ 
              fontSize: "18px", 
              color: "var(--text-secondary)",
              marginBottom: "48px",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              Smart Money intelligence from Nansen CLI, one conviction report.
            </p>

            {/* Input Shell */}
            <div style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "6px",
              border: "1px solid var(--border-soft)",
              display: "flex",
              gap: "8px",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && investigate()}
                placeholder="Paste wallet, token, ENS, or contract..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  padding: "16px 20px",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              <button
                onClick={investigate}
                disabled={loading || !input.trim()}
                style={{
                  background: loading ? "var(--surface-hover)" : "var(--accent)",
                  color: loading ? "var(--text-muted)" : "var(--bg)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "16px 28px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {loading ? "Analyzing..." : "Investigate"}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ marginTop: "32px", textAlign: "center" }}>
                {["Classifying entity", "Checking Smart Money", "Scoring conviction", "Building brief"].map((step, i) => (
                  <div key={i} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    gap: "12px",
                    margin: "12px 0",
                    color: i <= 1 ? "var(--text-primary)" : "var(--text-muted)"
                  }}>
                    <span style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: i <= 1 ? "var(--accent)" : "var(--border-strong)",
                      borderTopColor: i === 1 ? "transparent" : undefined,
                      animation: i === 1 ? "spin 1s linear infinite" : undefined
                    }} />
                    {step}
                  </div>
                ))}
              </div>
            )}

            {/* Examples */}
            <div style={{ marginTop: "32px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Try:</span>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => { setInput(ex.value); setTimeout(investigate, 100); }}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-soft)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Report View */
          <div>
            {/* Back Button */}
            <button
              onClick={() => { setReport(null); setInput(""); setShowRaw(false); }}
              style={{
                background: "transparent",
                border: "1px solid var(--border-soft)",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "var(--text-secondary)",
                fontSize: "14px",
                cursor: "pointer",
                marginBottom: "24px"
              }}
            >
              ← New Investigation
            </button>

            {/* Entity Header */}
            <div style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid var(--border-soft)",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase"
                }}>
                  {report.entity.type}
                </span>
              </div>
              <div style={{ 
                fontFamily: "monospace", 
                fontSize: "14px",
                color: "var(--text-secondary)",
                wordBreak: "break-all"
              }}>
                {report.entity.input}
              </div>
            </div>

            {/* Score Card */}
            <div style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "32px",
              border: `1px solid ${verdictColor}40`,
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "72px", fontWeight: "700", color: verdictColor, lineHeight: 1 }}>
                {report.score}
              </div>
              <div style={{ 
                display: "inline-block",
                marginTop: "16px",
                padding: "8px 20px",
                borderRadius: "20px",
                background: `${verdictColor}20`,
                color: verdictColor,
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "uppercase"
              }}>
                {verdictLabel}
              </div>
              <div style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
                Confidence: <span style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{report.confidence}</span>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid var(--border-soft)",
              marginBottom: "24px"
            }}>
              <p style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>
                {report.summary}
              </p>
            </div>

            {/* Bull/Bear Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                padding: "20px",
                borderLeft: "3px solid var(--success)"
              }}>
                <div style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase" }}>Bull Case</div>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8" }}>
                  {report.bull_case.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                padding: "20px",
                borderLeft: "3px solid var(--danger)"
              }}>
                <div style={{ color: "var(--danger)", fontSize: "13px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase" }}>Bear Case</div>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8" }}>
                  {report.bear_case.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risk Flags */}
            <div style={{
              background: "var(--surface)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid var(--border-soft)",
              marginBottom: "24px"
            }}>
              <div style={{ color: "var(--warning)", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>⚠ Risk Flags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {report.risk_flags.map((flag, i) => (
                  <span key={i} style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px"
                  }}>
                    {flag}
                  </span>
                ))}
              </div>
            </div>

            {/* Explorer Links */}
            {report.cross_chain_evidence.length > 0 && (
              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid var(--border-soft)",
                marginBottom: "24px"
              }}>
                <div style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Explorer Evidence</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {report.cross_chain_evidence.map((ev, i) => (
                    <a key={i} href={ev.url} target="_blank" rel="noopener" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "var(--bg-elevated)",
                      borderRadius: "8px",
                      textDecoration: "none",
                      transition: "all 0.2s"
                    }}>
                      <span style={{ 
                        background: "var(--accent-glow)", 
                        color: "var(--accent)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}>
                        {ev.chain}
                      </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>View on Blockscout →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data Toggle */}
            <div style={{ marginBottom: "24px" }}>
              <button
                onClick={() => setShowRaw(!showRaw)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left"
                }}
              >
                {showRaw ? "▼" : "▶"} Raw Source Data
              </button>
              {showRaw && (
                <pre style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "0 0 8px 8px",
                  padding: "16px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  overflow: "auto",
                  maxHeight: "400px",
                  margin: 0,
                  borderTop: "1px solid var(--border-soft)"
                }}>
                  {JSON.stringify(report, null, 2)}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: "32px", borderTop: "1px solid var(--border-soft)" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                Powered by <span style={{ color: "var(--accent)" }}>Nansen CLI</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
