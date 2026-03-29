"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  MagnifyingGlass, 
  ArrowRight, 
  Clock,
  ListChecks,
  Link,
  ArrowUpRight,
  Wallet,
  ArrowCounterClockwise
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

// Loading phases - analyst tone
const LOADING_PHASES = [
  "Reading transactions...",
  "Checking behavior patterns...",
  "Scoring activity...",
  "Finalizing report...",
];

// Score interpretation - plain English, not trading signals
function getScoreInterpretation(score: number): string {
  if (score >= 80) return "Consistent, predictable patterns";
  if (score >= 60) return "Active with mostly stable behavior";
  if (score >= 40) return "Mixed signals, watch for patterns";
  if (score >= 20) return "Erratic or early-stage activity";
  return "Insufficient history or high-risk indicators";
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (loading) {
      const i = setInterval(() => setPhase(p => (p + 1) % LOADING_PHASES.length), 900);
      return () => clearInterval(i);
    }
    setPhase(0);
  }, [loading]);

  const investigate = useCallback(async () => {
    if (!input.trim()) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.trim())) {
      setError("Enter a valid EVM address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + "/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) throw new Error();
      setReport(await res.json());
    } catch {
      setError("Analysis failed. Check API.");
    }
    setLoading(false);
  }, [input]);

  const reset = () => { setReport(null); setInput(""); setError(""); };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>

      <header style={{
        padding: "20px 48px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "600", fontFamily: "'Bricolage Grotesque', system-ui" }}>
            SignalScope
          </span>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 48px 80px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "80px", alignItems: "start" }}>
        <div>
          {!report ? (
            <>
              <h1 style={{ 
                fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: "600", color: "var(--text-primary)",
                marginBottom: "16px", lineHeight: "1.1", letterSpacing: "-0.03em",
                fontFamily: "'Bricolage Grotesque', system-ui",
              }}>
                Read any wallet<span style={{ color: "var(--accent)" }}>.</span>
              </h1>

              <p style={{ 
                fontSize: "16px", color: "var(--text-secondary)",
                marginBottom: "40px", lineHeight: "1.7", maxWidth: "420px",
              }}>
                Paste an address. Get a clear read on what that wallet has been doing.
              </p>

              <div style={{ position: "relative", marginBottom: "24px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "var(--surface)", borderRadius: "12px",
                  padding: "6px 6px 6px 20px",
                  border: "1px solid " + (error ? "var(--danger)" : "var(--border-soft)"),
                }}>
                  <Wallet size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); if (error) setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && investigate()}
                    placeholder="0xd8dA6BF26964aF9D7..."
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      padding: "14px 0", color: "var(--text-primary)",
                      fontSize: "14px", fontFamily: "ui-monospace, monospace", outline: "none",
                    }}
                  />
                  <button
                    onClick={investigate}
                    disabled={loading || !input.trim()}
                    style={{
                      background: input.trim() && !loading ? "var(--accent)" : "var(--surface-hover)",
                      color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                      border: "none", borderRadius: "10px",
                      padding: "12px 24px", fontSize: "14px", fontWeight: "500",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "8px",
                      transition: "all 0.2s",
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ width: "14px", height: "14px", border: "2px solid transparent", borderTopColor: "currentColor", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        {LOADING_PHASES[phase]}
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass size={16} weight="bold" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {error}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: "vitalik.eth", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                  { label: "Base deployer", addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setInput(ex.addr)}
                    style={{
                      background: "var(--surface)", border: "1px solid var(--border-soft)",
                      borderRadius: "8px", padding: "8px 14px", color: "var(--text-muted)",
                      fontSize: "13px", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <button
                onClick={reset}
                style={{
                  background: "transparent", border: "1px solid var(--border-soft)",
                  borderRadius: "8px", padding: "10px 16px", color: "var(--text-secondary)",
                  fontSize: "14px", cursor: "pointer", marginBottom: "36px",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <ArrowCounterClockwise size={14} />
                New search
              </button>

              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                Address
              </p>
              <p style={{ 
                fontFamily: "ui-monospace, monospace", fontSize: "13px",
                color: "var(--text-secondary)", wordBreak: "break-all",
                background: "var(--surface)", padding: "14px", borderRadius: "8px",
                border: "1px solid var(--border-soft)", marginBottom: "32px",
              }}>
                {report.entity.input}
              </p>

              <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "16px" }}>
                <span style={{ 
                  fontSize: "72px", fontWeight: "700", color: "var(--accent)",
                  lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "'Bricolage Grotesque', system-ui",
                }}>
                  {report.score}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  {report.confidence} confidence
                </span>
              </div>

              <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.6" }}>
                {getScoreInterpretation(report.score)}
              </p>

              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.75", marginBottom: "28px" }}>
                {report.summary}
              </p>

              {report.bullets.length > 0 && (
                <>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                    Findings
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                    {report.bullets.map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--accent)", marginTop: "2px", flexShrink: 0 }}>—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {report.risk_flags.length > 0 && (
                <div style={{ background: "var(--surface)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-soft)" }}>
                  <p style={{ fontSize: "11px", color: "var(--warning)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                    Notes
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {report.risk_flags.map((flag, i) => (
                      <span key={i} style={{ fontSize: "12px", padding: "6px 12px", background: "var(--bg-elevated)", borderRadius: "6px", color: "var(--text-secondary)" }}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ paddingTop: !report ? "20px" : "60px" }}>
          {!report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Simple visual - just data points, no gimmicks */}
              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                padding: "24px",
              }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", fontFamily: "'Bricolage Grotesque', system-ui" }}>
                  What you get
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { Icon: Clock, title: "On-chain history", desc: "Every move, in order" },
                    { Icon: ListChecks, title: "Behavior analysis", desc: "Patterns, not just numbers" },
                    { Icon: Link, title: "Source links", desc: "Verify everything yourself" },
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", gap: "14px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "6px",
                        background: "var(--accent-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={16} color="var(--accent)" />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "2px" }}>
                          {title}
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple example preview */}
              <div style={{
                background: "var(--surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                padding: "20px",
              }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Example read
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent)", fontFamily: "'Bricolage Grotesque', system-ui" }}>
                    74
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    consistent patterns
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  Active trader for 8 months. Prefers stablecoins. Profit-taking on larger swings.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: "20px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                Verify
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {report.evidence_links.map((ev, i) => (
                  <a
                    key={i}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px", background: "var(--surface)", borderRadius: "10px",
                      border: "1px solid var(--border-soft)", textDecoration: "none",
                      color: "var(--text-primary)", transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{ev.label}</span>
                    <ArrowUpRight size="16" color="var(--text-muted)" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
