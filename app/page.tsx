"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  MagnifyingGlass, 
  ArrowRight, 
  Shield,
  Lightning,
  Eye,
  Target,
  Warning,
  Check,
  X,
  ArrowUpRight,
  Wallet
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

const VERDICT_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  avoid: { color: "#EF4444", bg: "rgba(239,68,68,0.15)", label: "AVOID" },
  weak: { color: "#FBBF24", bg: "rgba(251,191,36,0.15)", label: "WEAK" },
  watchlist: { color: "#60A5FA", bg: "rgba(96,165,250,0.15)", label: "WATCHLIST" },
  strong: { color: "#22C55E", bg: "rgba(34,197,94,0.15)", label: "STRONG" },
  high_conviction: { color: "#FF6B35", bg: "rgba(255,107,53,0.15)", label: "HIGH CONFIDENCE" },
};

const isValidAddress = (input: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(input.trim());

// Orb component for visual interest
function IntelOrb() {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
      {/* Outer ring */}
      <div style={{
        position: "absolute",
        inset: 0,
        border: "1px solid var(--border-soft)",
        borderRadius: "50%",
      }} />
      {/* Middle ring */}
      <div style={{
        position: "absolute",
        inset: "15%",
        border: "1px solid rgba(255,107,53,0.2)",
        borderRadius: "50%",
        animation: "spin 20s linear infinite",
      }} />
      {/* Inner ring */}
      <div style={{
        position: "absolute",
        inset: "30%",
        border: "1px solid rgba(255,107,53,0.3)",
        borderRadius: "50%",
        animation: "spin 12s linear infinite reverse",
      }} />
      {/* Core */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "25%",
        height: "25%",
        background: "var(--accent)",
        borderRadius: "50%",
        boxShadow: "0 0 40px var(--accent-subtle), 0 0 80px var(--accent-subtle)",
        animation: "pulse-glow 3s ease-in-out infinite",
      }} />
      {/* Crosshairs */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60%",
        height: "60%",
        borderLeft: "1px solid rgba(255,107,53,0.15)",
        borderRight: "1px solid rgba(255,107,53,0.15)",
        borderTop: "1px solid rgba(255,107,53,0.15)",
        borderBottom: "1px solid rgba(255,107,53,0.15)",
      }} />
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(0);

  // Typing effect for loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setPhase(p => (p + 1) % 4);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setPhase(0);
    }
  }, [loading]);

  const investigate = useCallback(async () => {
    if (!input.trim()) return;
    if (!isValidAddress(input)) {
      setError("Enter a valid EVM address");
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
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReport(data);
    } catch {
      setError("Analysis failed. API may be down.");
    }
    setLoading(false);
  }, [input]);

  const reset = () => { setReport(null); setInput(""); setError(""); };

  const verdict = report ? VERDICT_CONFIG[report.verdict] : null;
  const loadingSteps = ["Mapping wallets", "Tracking Smart Money", "Scoring conviction", "Building intel"];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed",
        top: "-30%",
        left: "-10%",
        width: "60%",
        height: "60%",
        background: "radial-gradient(ellipse, var(--accent-subtle) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <header style={{
        padding: "24px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Shield size={18} weight="fill" color="var(--bg)" />
          </div>
          <span className="headline" style={{ fontSize: "16px", fontWeight: "600" }}>
            SignalScope
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
          <span style={{ 
            width: "6px", 
            height: "6px", 
            borderRadius: "50%", 
            background: "var(--success)",
            boxShadow: "0 0 8px var(--success)"
          }} />
          Nansen connected
        </div>
      </header>

      {/* Main */}
      <div style={{ 
        maxWidth: "1100px", 
        margin: "0 auto", 
        padding: "60px 48px",
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "80px",
        alignItems: "start",
      }}>
        {/* Left - narrative */}
        <div>
          {!report ? (
            <>
              {/* Tagline - narrative voice */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "var(--surface)",
                borderRadius: "100px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "24px",
                border: "1px solid var(--border-soft)",
              }}>
                <Lightning size={14} weight="fill" color="var(--accent)" />
                <span className="headline">Smart Money Intelligence</span>
              </div>

              {/* Headline - tells the story */}
              <h1 className="headline" style={{ 
                fontSize: "clamp(36px, 5vw, 52px)", 
                fontWeight: "600", 
                color: "var(--text-primary)",
                marginBottom: "20px",
                lineHeight: "1.1",
                letterSpacing: "-0.03em",
              }}>
                See what the whales see<span style={{ color: "var(--accent)" }>.</span>
              </h1>

              {/* Story */}
              <p style={{ 
                fontSize: "16px", 
                color: "var(--text-secondary)",
                marginBottom: "40px",
                lineHeight: "1.7",
                maxWidth: "420px",
              }}>
                Before you ape in, check if Smart Money already moved. 
                SignalScope reads wallet conviction from Nansen's chain data — 
                so you know if you're early or just copying a dump.
              </p>

              {/* Input */}
              <div style={{ position: "relative", marginBottom: "28px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "var(--surface)",
                  borderRadius: "12px",
                  padding: "6px 6px 6px 20px",
                  border: `1px solid ${error ? "var(--danger)" : "var(--border-soft)"}`,
                }}>
                  <Wallet size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); if (error) setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && investigate()}
                    placeholder="0xd8dA6BF26964aF9D7..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      padding: "14px 0",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      fontFamily: "ui-monospace, monospace",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={investigate}
                    disabled={loading || !input.trim()}
                    className="spring"
                    style={{
                      background: input.trim() && !loading ? "var(--accent)" : "var(--surface-hover)",
                      color: input.trim() && !loading ? "var(--bg)" : "var(--text-muted)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 24px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "inherit",
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ 
                          width: "14px", 
                          height: "14px", 
                          border: "2px solid transparent", 
                          borderTopColor: "currentColor",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite"
                        }} />
                        <span className="headline">{loadingSteps[phase]}...</span>
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass size={16} weight="bold" />
                        <span className="headline">Investigate</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p style={{ 
                    color: "var(--danger)", 
                    fontSize: "13px", 
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <X size={14} /> {error}
                  </p>
                )}
              </div>

              {/* Quick picks */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { label: "vitalik.eth", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                  { label: "Base deployer", addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setInput(ex.addr)}
                    className="spring"
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
            /* Report */
            <div>
              <button
                onClick={reset}
                className="spring"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginBottom: "36px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
                New search
              </button>

              {/* Entity */}
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                Wallet Intel
              </p>
              <p style={{ 
                fontFamily: "ui-monospace, monospace", 
                fontSize: "13px",
                color: "var(--text-secondary)",
                wordBreak: "break-all",
                background: "var(--surface)",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid var(--border-soft)",
                marginBottom: "32px",
              }}>
                {report.entity.input}
              </p>

              {/* Score */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "24px" }}>
                <span className="headline" style={{ 
                  fontSize: "80px", 
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
                    padding: "6px 14px",
                    borderRadius: "6px",
                    background: verdict?.bg,
                    color: verdict?.color,
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "6px",
                    fontFamily: "inherit",
                  }}
                  className="headline"
                  >
                    {verdict?.label}
                  </span>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {report.confidence} confidence
                  </p>
                </div>
              </div>

              {/* Summary */}
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.75", marginBottom: "28px" }}>
                {report.summary}
              </p>

              {/* Insights */}
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                Intel
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {report.bullets.map((item, i) => (
                  <li key={i} style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    gap: "12px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}>
                    <Check size={16} weight="bold" color="var(--success)" style={{ marginTop: "2px", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Risks */}
              {report.risk_flags.length > 0 && (
                <div style={{ 
                  background: "var(--surface)", 
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-soft)",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--warning)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                    ⚠ Warnings
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

        {/* Right - visual */}
        <div style={{ paddingTop: !report ? "40px" : "80px" }}>
          {!report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <IntelOrb />
              
              {/* Value props with personality */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { icon: Eye, title: "Track Smart Money", desc: "See where whales move before the crowd" },
                  { icon: Target, title: "Conviction Scoring", desc: "Data-driven wallet reliability scores" },
                  { icon: Lightning, title: "Seconds, Not Hours", desc: "Instant intel on any EVM address" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{
                    display: "flex",
                    gap: "14px",
                    padding: "16px",
                    background: "var(--surface)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-soft)",
                  }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "var(--accent-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={18} color="var(--accent)" weight="bold" />
                    </div>
                    <div>
                      <p className="headline" style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
                        {title}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Evidence */
            <div style={{ paddingTop: "20px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                Evidence
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {report.evidence_links.map((ev, i) => (
                  <a
                    key={i}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spring"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px",
                      background: "var(--surface)",
                      borderRadius: "10px",
                      border: "1px solid var(--border-soft)",
                      textDecoration: "none",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{ev.label}</span>
                    <ArrowUpRight size={16} color="var(--text-muted)" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 48px",
        borderTop: "1px solid var(--border-soft)",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--text-muted)",
      }}>
        <span>Powered by Nansen CLI</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
          v1.0.0
        </span>
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
