"use client";

import { useState, useCallback } from "react";
import { 
  MagnifyingGlass, 
  ArrowRight, 
  Shield, 
  Lightning,
  ChartLine,
  X,
  Circle
} from "@phosphor-icons/react";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const VERDICT_CONFIG: Record<string, { color: string; label: string }> = {
  avoid: { color: "#F87171", label: "Avoid" },
  weak: { color: "#FBBF24", label: "Weak" },
  watchlist: { color: "#60A5FA", label: "Watchlist" },
  strong: { color: "#4ADE80", label: "Strong" },
  high_conviction: { color: "#A78BFA", label: "High Conviction" },
};

const isValidAddress = (input: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(input.trim());

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  const investigate = useCallback(async () => {
    if (!input.trim()) return;
    if (!isValidAddress(input)) {
      setError("Enter a valid EVM address (0x... with 40 hex chars)");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/api/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), chain_preference: "ethereum" }),
      });
      
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setReport(data);
    } catch {
      setError("Something went wrong. Check the API is running.");
    }
    setLoading(false);
  }, [input]);

  const reset = () => { setReport(null); setInput(""); setError(""); };

  const verdict = report ? VERDICT_CONFIG[report.verdict] : null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      {/* Subtle background gradient */}
      <div style={{
        position: "fixed",
        top: "-50%",
        right: "-20%",
        width: "80%",
        height: "100%",
        background: "radial-gradient(ellipse, var(--accent-subtle) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header - asymmetric, minimal */}
      <header style={{
        padding: "28px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Shield size={20} weight="bold" color="var(--bg)" />
          </div>
          <span style={{ fontSize: "17px", fontWeight: "600", letterSpacing: "-0.02em" }}>
            SignalScope
          </span>
        </div>
        <a 
          href="/api-and-skill" 
          style={{ 
            color: "var(--text-muted)", 
            textDecoration: "none", 
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          API docs <ArrowRight size={14} />
        </a>
      </header>

      {/* Main content - asymmetric layout */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "80px 48px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px",
        alignItems: "start",
      }}>
        {/* Left column - text content */}
        <div>
          {!report ? (
            <>
              {/* Label */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "var(--surface)",
                borderRadius: "100px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "28px",
                border: "1px solid var(--border-soft)",
              }}>
                <Lightning size={14} weight="fill" color="var(--accent)" />
                Wallet Intelligence
              </div>

              {/* Headline - not screaming, controlled hierarchy */}
              <h1 style={{ 
                fontSize: "clamp(32px, 4vw, 44px)", 
                fontWeight: "600", 
                color: "var(--text-primary)",
                marginBottom: "20px",
                lineHeight: "1.15",
                letterSpacing: "-0.03em",
              }}>
                Know the wallet before you ape in
              </h1>

              {/* Subtext - no filler */}
              <p style={{ 
                fontSize: "16px", 
                color: "var(--text-secondary)",
                marginBottom: "48px",
                lineHeight: "1.65",
                maxWidth: "400px",
              }}>
                Nansen-powered conviction scores. Smart Money tracking. One search.
              </p>

              {/* Input - not centered, left aligned */}
              <div style={{ position: "relative" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "var(--surface)",
                  borderRadius: "14px",
                  padding: "6px 6px 6px 20px",
                  border: "1px solid var(--border-soft)",
                  transition: "border-color 0.2s",
                }}>
                  <MagnifyingGlass size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); if (error) setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && investigate()}
                    placeholder="0x742d35Cc6634C0532..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      padding: "14px 0",
                      color: "var(--text-primary)",
                      fontSize: "15px",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={investigate}
                    disabled={loading || !input.trim()}
                    className="spring-btn"
                    style={{
                      background: input.trim() && !loading ? "var(--accent)" : "var(--surface-hover)",
                      color: input.trim() && !loading ? "var(--bg)" : "var(--text-muted)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 24px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid transparent",
                          borderTopColor: "currentColor",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Analyzing
                      </>
                    ) : "Investigate"}
                  </button>
                </div>

                {error && (
                  <p style={{ 
                    color: "var(--danger)", 
                    fontSize: "13px", 
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <X size={14} /> {error}
                  </p>
                )}
              </div>

              {/* Quick examples - subtle */}
              <div style={{ marginTop: "32px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { label: "vitalik.eth", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                  { label: "Base deployer", addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => { setInput(ex.addr); }}
                    className="spring-btn"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      color: "var(--text-muted)",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Report view */
            <div>
              <button
                onClick={reset}
                className="spring-btn"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginBottom: "40px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
                New search
              </button>

              {/* Entity info */}
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Wallet
                </p>
                <p style={{ 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  wordBreak: "break-all",
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-soft)",
                }}>
                  {report.entity.input}
                </p>
              </div>

              {/* Score - big but not screaming */}
              <div style={{ 
                display: "flex", 
                alignItems: "baseline", 
                gap: "16px",
                marginBottom: "16px",
              }}>
                <span style={{ 
                  fontSize: "72px", 
                  fontWeight: "700", 
                  color: verdict?.color,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}>
                  {report.score}
                </span>
                <div>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    background: `${verdict?.color}20`,
                    color: verdict?.color,
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}>
                    {verdict?.label}
                  </span>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {report.confidence} confidence
                  </p>
                </div>
              </div>

              {/* Summary */}
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "32px" }}>
                {report.summary}
              </p>

              {/* Bullets */}
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                  Key Insights
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {report.bullets.map((item, i) => (
                    <li key={i} style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "12px",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                    }}>
                      <Circle size={8} weight="fill" color="var(--accent)" style={{ marginTop: "6px", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk flags */}
              {report.risk_flags.length > 0 && (
                <div style={{ 
                  background: "var(--surface)", 
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-soft)",
                }}>
                  <p style={{ fontSize: "12px", color: "var(--warning)", fontWeight: "600", marginBottom: "12px" }}>
                    Risk Flags
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {report.risk_flags.map((flag, i) => (
                      <span key={i} style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        background: "var(--bg-elevated)",
                        borderRadius: "6px",
                        color: "var(--text-secondary)",
                      }}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - visual element, asymmetric */}
        {!report && (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "24px",
            paddingTop: "60px",
          }}>
            {/* Abstract visual - not generic illustration */}
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1",
              background: "var(--surface)",
              borderRadius: "20px",
              border: "1px solid var(--border-soft)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* Abstract pattern */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `
                  radial-gradient(circle at 30% 40%, var(--accent-subtle) 0%, transparent 50%),
                  radial-gradient(circle at 70% 60%, rgba(167,139,250,0.08) 0%, transparent 40%)
                `,
              }} />
              <div style={{
                width: "60%",
                height: "60%",
                border: "1px solid var(--border-soft)",
                borderRadius: "50%",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "40%",
                  height: "40%",
                  border: "1px solid var(--accent)",
                  borderRadius: "50%",
                  opacity: 0.6,
                }} />
                {/* Animated dot */}
                <div style={{
                  position: "absolute",
                  top: "20%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "8px",
                  height: "8px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                  boxShadow: "0 0 20px var(--accent)",
                  animation: "subtle-pulse 2s ease-in-out infinite",
                }} />
              </div>
            </div>

            {/* Stats - organic numbers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}>
              {[
                { label: "Chains", value: "7+" },
                { label: "Data points", value: "847K" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "var(--surface)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                }}>
                  <p style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report view - right column for evidence */}
        {report && (
          <div style={{ paddingTop: "80px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Evidence
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {report.evidence_links.map((ev, i) => (
                <a
                  key={i}
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spring-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "var(--surface)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-soft)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{ev.label}</span>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - minimal */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px 48px",
        borderTop: "1px solid var(--border-soft)",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--text-muted)",
      }}>
        <span>Nansen CLI powered</span>
        <a 
          href="https://twitter.com/intent/follow?screen_name=signalscope" 
          target="_blank"
          rel="noopener"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          @signalscope
        </a>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
