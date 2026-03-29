"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { 
  MagnifyingGlass, 
  Clock,
  ListChecks,
  Link,
  ArrowUpRight,
  Wallet,
  ArrowCounterClockwise,
  Hash
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

const LOADING_PHASES = [
  "Reading transactions...",
  "Checking behavior patterns...",
  "Scoring activity...",
  "Finalizing report...",
];

function getScoreInterpretation(score: number): { label: string; detail: string } {
  if (score >= 80) return { label: "Consistent", detail: "Predictable patterns over time. Low volatility." };
  if (score >= 60) return { label: "Active", detail: "Mostly stable behavior with some variation." };
  if (score >= 40) return { label: "Mixed", detail: "Inconsistent signals. Watch for patterns." };
  if (score >= 20) return { label: "Erratic", detail: "High volatility or early-stage activity." };
  return { label: "Unknown", detail: "Insufficient history or high-risk indicators." };
}

function FindingCard({ num, text, accent }: { num: number; text: string; accent: string }) {
  return (
    <div style={{
      display: "flex",
      gap: "14px",
      padding: "16px 0",
      borderBottom: "1px solid var(--border-soft)",
    }}>
      <div style={{
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        background: accent,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "600",
        flexShrink: 0,
        fontFamily: "'Geist', system-ui",
      }}>
        {num}
      </div>
      <p style={{
        fontSize: "14px",
        color: "var(--text-secondary)",
        lineHeight: "1.6",
        margin: 0,
      }}>
        {text}
      </p>
    </div>
  );
}

function ScoreCard({ score, confidence }: { score: number; confidence: string }) {
  const interp = getScoreInterpretation(score);
  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "16px",
      border: "1px solid var(--border-soft)",
      padding: "28px",
      marginBottom: "28px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "16px" }}>
        <span style={{
          fontSize: "72px",
          fontWeight: "700",
          color: "var(--accent)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          fontFamily: "'Geist', system-ui",
          animation: "fadeUp 0.6s var(--ease-out) both",
        }}>
          {score}
        </span>
        <div style={{ paddingTop: "8px" }}>
          <p style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "4px",
            fontFamily: "'Geist', system-ui",
          }}>
            {interp.label}
          </p>
          <p style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: 0,
          }}>
            {confidence} confidence
          </p>
        </div>
      </div>
      <p style={{
        fontSize: "14px",
        color: "var(--text-secondary)",
        lineHeight: "1.6",
        margin: 0,
        paddingTop: "12px",
        borderTop: "1px solid var(--border-soft)",
      }}>
        {interp.detail}
      </p>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const FINDING_COLORS = ["var(--find-1)", "var(--find-2)", "var(--find-3)", "var(--find-4)", "var(--find-5)"];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <header style={{
        padding: "20px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="#080808" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "600", fontFamily: "'Geist', system-ui", letterSpacing: "-0.02em" }}>
            SignalScope
          </span>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 48px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "80px", alignItems: "start" }}>
          <div>
            {!report ? (
              <>
                <h1 style={{ 
                  fontSize: "clamp(36px, 5vw, 52px)",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  lineHeight: "1.1",
                  letterSpacing: "-0.03em",
                  fontFamily: "'Geist', system-ui",
                  animation: "fadeUp 0.6s var(--ease-out) both",
                }}>
                  Read any wallet<span style={{ color: "var(--accent)" }}>.</span>
                </h1>

                <p style={{ 
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  marginBottom: "40px",
                  lineHeight: "1.7",
                  maxWidth: "440px",
                  animation: "fadeUp 0.6s var(--ease-out) 0.1s both",
                }}>
                  Paste an address. Get a clear read on what that wallet has been doing.
                </p>

                <div style={{ position: "relative", marginBottom: "24px", animation: "fadeUp 0.6s var(--ease-out) 0.2s both" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "var(--surface)",
                    borderRadius: "12px",
                    padding: "6px 6px 6px 20px",
                    border: "1px solid " + (error ? "var(--danger)" : "var(--border-soft)"),
                  }}>
                    <Wallet size={18} color="var(--text-muted)" />
                    <input
                      ref={inputRef}
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
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={investigate}
                      disabled={loading || !input.trim()}
                      className="spring"
                      style={{
                        background: input.trim() && !loading ? "var(--accent)" : "var(--surface-hover)",
                        color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Geist', system-ui",
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
                            animation: "spin 0.8s linear infinite",
                          }} />
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
                    <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px" }}>
                      {error}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", animation: "fadeUp 0.6s var(--ease-out) 0.3s both" }}>
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
                        fontFamily: "'Geist', system-ui",
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
                    fontFamily: "'Geist', system-ui",
                  }}
                >
                  <ArrowCounterClockwise size={14} />
                  New search
                </button>

                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "'Geist', system-ui" }}>
                  Address
                </p>
                <p style={{ 
                  fontFamily: "'Geist Mono', ui-monospace, monospace",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  wordBreak: "break-all",
                  background: "var(--surface)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "28px",
                }}>
                  {report.entity.input}
                </p>

                <ScoreCard score={report.score} confidence={report.confidence} />

                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.75", marginBottom: "28px" }}>
                  {report.summary}
                </p>

                {report.bullets.length > 0 && (
                  <>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontFamily: "'Geist', system-ui" }}>
                      Findings
                    </p>
                    <div>
                      {report.bullets.map((item, i) => (
                        <FindingCard
                          key={i}
                          num={i + 1}
                          text={item}
                          accent={FINDING_COLORS[i % FINDING_COLORS.length]}
                        />
                      ))}
                    </div>
                  </>
                )}

                {report.risk_flags.length > 0 && (
                  <div style={{
                    marginTop: "28px",
                    background: "var(--surface)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-soft)",
                  }}>
                    <p style={{ fontSize: "11px", color: "var(--warning)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", fontFamily: "'Geist', system-ui" }}>
                      Notes
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {report.risk_flags.map((flag, i) => (
                        <span key={i} style={{
                          fontSize: "13px",
                          padding: "6px 12px",
                          background: "var(--bg-elevated)",
                          borderRadius: "6px",
                          color: "var(--text-secondary)",
                          fontFamily: "'Geist', system-ui",
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

          <div style={{ paddingTop: !report ? "20px" : "60px" }}>
            {!report ? (
              <div style={{ animation: "fadeUp 0.6s var(--ease-out) 0.4s both" }}>
                <div style={{
                  background: "var(--surface)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-soft)",
                  padding: "24px",
                }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px", fontFamily: "'Geist', system-ui" }}>
                    What you get
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {[
                      { Icon: Clock, title: "On-chain history", desc: "Every move, in order" },
                      { Icon: ListChecks, title: "Behavior analysis", desc: "Patterns, not numbers" },
                      { Icon: Link, title: "Source links", desc: "Verify everything" },
                    ].map(({ Icon, title, desc }, i) => (
                      <div key={title} style={{ display: "flex", gap: "14px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "var(--accent-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Icon size={16} color="var(--accent)" />
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "2px", fontFamily: "'Geist', system-ui" }}>
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

                <div style={{
                  marginTop: "20px",
                  background: "var(--surface)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-soft)",
                  padding: "24px",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "14px", fontFamily: "'Geist', system-ui" }}>
                    Example read
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: "var(--accent)",
                      fontFamily: "'Geist', system-ui",
                    }}>
                      74
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Consistent
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Active trader for 8 months. Prefers stablecoins. Profit-taking on larger swings.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeUp 0.6s var(--ease-out) both" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", fontFamily: "'Geist', system-ui" }}>
                  Verify
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
                      <span style={{ fontSize: "14px", fontFamily: "'Geist', system-ui" }}>{ev.label}</span>
                      <ArrowUpRight size="16" color="var(--text-muted)" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
