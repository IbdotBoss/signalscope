"use client";

import { useState, useCallback } from "react";

interface Report {
  entity: { input: string; normalized: string; type: string };
  score: number;
  verdict: string;
  confidence: string;
  summary: string;
  bullets: string[];
  risk_flags: string[];
  evidence_links: { label: string; url: string }[];
}

const EXAMPLES = [
  { label: "vitalik.eth", value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "Sample Wallet", value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
  { label: "Base Token", value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
];

// FIXED: Use environment variable for API URL with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const VERDICT_COLORS: Record<string, string> = {
  avoid: "#FF6B81",
  weak: "#F5B942",
  watchlist: "#6EA8FE",
  strong: "#33D17A",
  high_conviction: "#4FD1C5",
};

// FIXED: Input validation regex
const isValidAddress = (input: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(input.trim());
};

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  const investigate = useCallback(async () => {
    if (!input.trim()) return;
    
    // FIXED: Frontend validation before API call
    if (!isValidAddress(input)) {
      setError("Invalid address. Use a valid EVM wallet address (0x... with 40 hex chars).");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // FIXED: Use env variable for API URL
      const res = await fetch(`${API_URL}/api/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), depth: "standard", chain_preference: "ethereum" }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      
      const data = await res.json();
      setReport(data);
    } catch (e: any) {
      setError(e.message || "Failed to analyze. Make sure the API server is running.");
    }
    setLoading(false);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Clear error when user starts typing
    if (error) setError("");
  };

  const verdictLabel = report?.verdict.replace("_", " ").toUpperCase() || "";
  const verdictColor = report ? VERDICT_COLORS[report.verdict] || "#4FD1C5" : "#4FD1C5";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
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
        <a href="/api-and-skill" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>API & Skill →</a>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
        {!report ? (
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

            {error && (
              <div style={{ 
                background: "rgba(255,107,129,0.1)", 
                border: "1px solid var(--danger)",
                borderRadius: "8px",
                padding: "16px",
                color: "var(--danger)",
                marginBottom: "24px"
              }}>{error}</div>
            )}

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
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && investigate()}
                placeholder="Paste wallet address (0x...)"
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
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setReport(null); setInput(""); setError(""); }}
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
                }}>{report.entity.type}</span>
              </div>
              <div style={{ 
                fontFamily: "monospace", 
                fontSize: "14px",
                color: "var(--text-secondary)",
                wordBreak: "break-all"
              }}>{report.entity.input}</div>
            </div>

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
              }}>{verdictLabel}</div>
              <div style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
                Confidence: <span style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{report.confidence}</span>
              </div>
            </div>

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

            <div style={{
              background: "var(--surface)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid var(--border-soft)",
              marginBottom: "24px"
            }}>
              <div style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Key Insights</div>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "2" }}>
                {report.bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

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
                  }}>{flag}</span>
                ))}
              </div>
            </div>

            {report.evidence_links.length > 0 && (
              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid var(--border-soft)",
                marginBottom: "24px"
              }}>
                <div style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Explorer Evidence</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {report.evidence_links.map((ev, i) => (
                    <a key={i} href={ev.url} target="_blank" rel="noopener" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "var(--bg-elevated)",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "var(--text-secondary)"
                    }}>
                      <span style={{ color: "var(--accent)" }}>{ev.label} →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
