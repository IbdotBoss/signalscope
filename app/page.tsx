"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  MagnifyingGlass, 
  Wallet,
  ArrowCounterClockwise,
  ArrowUpRight,
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

const EVIDENCE_LOADING = [
  "Gathering evidence...",
  "Analyzing patterns...",
  "Building case...",
  "Finalizing report...",
];

// Typing hook for character-by-character reveal
function useTyping(text: string, speed: number = 20, startWhen: boolean = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!startWhen) {
      setDisplayed("");
      setDone(false);
      return;
    }
    
    let i = 0;
    setDisplayed("");
    setDone(false);
    
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, startWhen]);
  
  return { displayed, done };
}

// Typing evidence card
function TypingEvidence({ 
  text, 
  accent, 
  delay,
  started 
}: { 
  text: string; 
  accent: string;
  delay: number;
  started: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const { displayed, done } = useTyping(text, 18, visible);
  
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [started, delay]);
  
  if (!visible) return <div className="evidence-placeholder" />;
  
  return (
    <div className="evidence-card">
      <div className="evidence-num" style={{ background: accent }}>
        {done ? "_" : ">"}
      </div>
      <p className="evidence-text">
        {displayed}
        {!done && <span className="cursor">|</span>}
      </p>
    </div>
  );
}

// Typing summary
function TypingSummary({ text, started }: { text: string; started: boolean }) {
  const [visible, setVisible] = useState(false);
  const { displayed, done } = useTyping(text, 12, visible);
  
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [started]);
  
  if (!visible) return null;
  
  return (
    <p className="summary">
      {displayed}
      {!done && <span className="cursor">|</span>}
    </p>
  );
}

function useCountUp(target: number, duration: number = 1500, startWhen: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startWhen) return;
    
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }, [target, duration, startWhen]);
  
  return count;
}

function ScoreDisplay({ score, started }: { score: number; started: boolean }) {
  const count = useCountUp(score, 1200, started);
  
  return (
    <div className="score-display">
      <span className="score-num">{count}</span>
    </div>
  );
}

function getScoreLabel(score: number): { label: string; detail: string } {
  if (score >= 80) return { label: "Strong signal", detail: "Consistent patterns over time. Low volatility." };
  if (score >= 60) return { label: "Active", detail: "Mostly stable behavior with some variation." };
  if (score >= 40) return { label: "Mixed signals", detail: "Inconsistent signals. Watch for patterns." };
  if (score >= 20) return { label: "Weak signal", detail: "High volatility or early-stage activity." };
  return { label: "Unknown", detail: "Insufficient history or high-risk indicators." };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(0);
  const [reportStarted, setReportStarted] = useState(false);

  useEffect(() => {
    if (loading) {
      const i = setInterval(() => setPhase(p => (p + 1) % EVIDENCE_LOADING.length), 1000);
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
    setReportStarted(false);
    try {
      const res = await fetch(API_URL + "/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) throw new Error();
      setReport(await res.json());
      setTimeout(() => setReportStarted(true), 100);
    } catch {
      setError("Analysis failed. Check API.");
    }
    setLoading(false);
  }, [input]);

  const reset = () => { setReport(null); setInput(""); setError(""); setReportStarted(false); };

  const EVIDENCE_ACCENTS = [
    "#FF724C",
    "#4F46E5",
    "#22C55E",
    "#FBBF24",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <main className="main">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="#080808" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text">SignalScope</span>
        </div>
      </header>

      <div className="container">
        <div className="grid">
          <div className="left-col">
            {!report ? (
              <>
                <h1 className="headline">
                  Read any wallet<span style={{ color: "var(--accent)" }}>.</span>
                </h1>
                <p className="subline">
                  Paste an address. Get a clear read on what that wallet has been doing.
                </p>

                <div className="input-wrapper">
                  <div className={`input-row ${error ? "has-error" : ""}`}>
                    <Wallet size={18} color="var(--text-muted)" />
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => { setInput(e.target.value); if (error) setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && investigate()}
                      placeholder="0xd8dA6BF26964aF9D7..."
                      className="address-input"
                    />
                    <button
                      onClick={investigate}
                      disabled={loading || !input.trim()}
                      className="analyze-btn"
                    >
                      {loading ? (
                        <>
                          <span className="spinner" />
                          {EVIDENCE_LOADING[phase]}
                        </>
                      ) : (
                        <>
                          <MagnifyingGlass size={16} weight="bold" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                  {error && <p className="error">{error}</p>}
                </div>

                <div className="examples">
                  {[
                    { label: "vitalik.eth", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                    { label: "Base deployer", addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                  ].map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setInput(ex.addr)}
                      className="example-btn"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="report">
                <button onClick={reset} className="reset-btn">
                  <ArrowCounterClockwise size={14} />
                  New search
                </button>

                <p className="label-sm">Address</p>
                <p className="address-display">{report.entity.input}</p>

                <div className="score-section">
                  <ScoreDisplay score={report.score} started={reportStarted} />
                  <div className="score-meta">
                    <p className="score-label">{getScoreLabel(report.score).label}</p>
                    <p className="score-confidence">{report.confidence} confidence</p>
                  </div>
                </div>
                <p className="score-detail">{getScoreLabel(report.score).detail}</p>

                <TypingSummary text={report.summary} started={reportStarted} />

                {report.bullets.length > 0 && (
                  <>
                    <p className="label-sm">Evidence</p>
                    <div className="evidence-list">
                      {report.bullets.map((item, i) => (
                        <TypingEvidence
                          key={i}
                          text={item}
                          accent={EVIDENCE_ACCENTS[i % EVIDENCE_ACCENTS.length]}
                          delay={300 + i * 250}
                          started={reportStarted}
                        />
                      ))}
                    </div>
                  </>
                )}

                {report.risk_flags.length > 0 && (
                  <div className="patterns-section">
                    <p className="label-sm patterns-label">Detected patterns</p>
                    <div className="patterns">
                      {report.risk_flags.map((flag, i) => (
                        <span key={i} className="pattern">{flag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="right-col">
            {!report ? (
              <div className="sidebar">
                <div className="info-card">
                  <p className="info-title">What you get</p>
                  <div className="info-items">
                    {[
                      { title: "On-chain history", desc: "Every move, in order" },
                      { title: "Behavior analysis", desc: "Patterns, not numbers" },
                      { title: "Source links", desc: "Verify everything" },
                    ].map(({ title, desc }) => (
                      <div key={title} className="info-item">
                        <div className="info-icon">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" fill="var(--accent)"/>
                          </svg>
                        </div>
                        <div>
                          <p className="info-item-title">{title}</p>
                          <p className="info-item-desc">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="example-card">
                  <p className="info-title">Example read</p>
                  <div className="example-score">
                    <span className="example-num">74</span>
                    <span className="example-label">Strong signal</span>
                  </div>
                  <p className="example-desc">
                    Active trader for 8 months. Prefers stablecoins. Profit-taking on larger swings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="verify-section">
                <p className="label-sm">Verify</p>
                <div className="links">
                  {report.evidence_links.map((ev, i) => (
                    <a
                      key={i}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      <span>{ev.label}</span>
                      <ArrowUpRight size="16" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --bg: #080808;
          --bg-elevated: #0D0D0D;
          --surface: #141414;
          --border: rgba(255,255,255,0.06);
          --text-primary: #F0F0F0;
          --text-secondary: #808080;
          --text-muted: #4A4A4A;
          --accent: #FF724C;
          --accent-subtle: rgba(255,114,76,0.1);
          --warning: #FBBF24;
          --spring: cubic-bezier(.32, 1, .32, 1);
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        .main { min-height: 100vh; background: var(--bg); }
        .header { padding: 20px 48px; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--accent); display: flex; align-items: center; justify-content: center; }
        .logo-text { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
        .container { max-width: 1000px; margin: 0 auto; padding: 48px 48px 96px; }
        .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 80px; align-items: start; }

        .headline { font-size: clamp(36px, 5vw, 52px); font-weight: 600; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.03em; animation: fadeUp 0.6s var(--ease-out) both; }
        .subline { font-size: 16px; color: var(--text-secondary); margin-bottom: 40px; line-height: 1.7; max-width: 440px; animation: fadeUp 0.6s var(--ease-out) 0.1s both; }
        .label-sm { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }

        .input-wrapper { margin-bottom: 24px; animation: fadeUp 0.6s var(--ease-out) 0.2s both; }
        .input-row { display: flex; align-items: center; gap: 12px; background: var(--surface); border-radius: 12px; padding: 6px 6px 6px 20px; border: 1px solid var(--border); transition: border-color 0.2s; }
        .input-row:focus-within { border-color: rgba(255,255,255,0.12); }
        .input-row.has-error { border-color: #EF4444; }
        .address-input { flex: 1; background: transparent; border: none; padding: 14px 0; color: var(--text-primary); font-size: 14px; font-family: 'Geist Mono', ui-monospace, monospace; outline: none; }
        .analyze-btn { background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: transform 0.2s var(--spring); }
        .analyze-btn:hover { transform: translateY(-1px); }
        .analyze-btn:active { transform: scale(0.97); }
        .analyze-btn:disabled { background: var(--surface); color: var(--text-muted); cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .error { color: #EF4444; font-size: 13px; margin-top: 10px; }

        .examples { display: flex; gap: 8px; flex-wrap: wrap; animation: fadeUp 0.6s var(--ease-out) 0.3s both; }
        .example-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text-muted); font-size: 13px; cursor: pointer; transition: transform 0.2s var(--spring); }
        .example-btn:hover { transform: translateY(-1px); }

        .report { animation: fadeUp 0.6s var(--ease-out) both; }
        .reset-btn { background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 10px 16px; color: var(--text-secondary); font-size: 14px; cursor: pointer; margin-bottom: 36px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s var(--spring); }
        .reset-btn:hover { transform: translateY(-1px); }
        .address-display { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 13px; color: var(--text-secondary); word-break: break-all; background: var(--surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 28px; }

        .score-section { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 8px; }
        .score-display { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 20px 24px; }
        .score-num { font-size: 56px; font-weight: 700; color: var(--accent); line-height: 1; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
        .score-meta { padding-top: 8px; }
        .score-label { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .score-confidence { font-size: 13px; color: var(--text-muted); }
        .score-detail { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; padding-top: 12px; border-top: 1px solid var(--border); }

        .summary { font-size: 15px; color: var(--text-secondary); line-height: 1.75; margin-bottom: 28px; min-height: 1.5em; }
        .cursor { display: inline-block; width: 2px; height: 14px; background: var(--accent); margin-left: 2px; animation: blink 0.7s infinite; vertical-align: text-bottom; }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }

        .evidence-list { margin-bottom: 28px; }
        .evidence-placeholder { height: 60px; }
        .evidence-card { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--border); }
        .evidence-num { width: 28px; height: 28px; border-radius: 6px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; font-family: 'Geist Mono', monospace; }
        .evidence-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; font-family: 'Geist Mono', ui-monospace, monospace; }

        .patterns-section { background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border); }
        .patterns-label { color: var(--warning) !important; margin-bottom: 14px; }
        .patterns { display: flex; flex-wrap: wrap; gap: 8px; }
        .pattern { font-size: 13px; padding: 6px 12px; background: var(--bg-elevated); border-radius: 6px; color: var(--text-secondary); }

        .sidebar { animation: fadeUp 0.6s var(--ease-out) 0.4s both; }
        .info-card, .example-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 24px; }
        .info-card { margin-bottom: 20px; }
        .info-title { font-size: 12px; color: var(--text-muted); margin-bottom: 20px; }
        .info-items { display: flex; flex-direction: column; gap: 20px; }
        .info-item { display: flex; gap: 14px; }
        .info-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--accent-subtle); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .info-item-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
        .info-item-desc { font-size: 13px; color: var(--text-muted); }
        .example-card { margin-top: 20px; }
        .example-score { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .example-num { font-size: 36px; font-weight: 700; color: var(--accent); }
        .example-label { font-size: 13px; color: var(--text-muted); }
        .example-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

        .verify-section { animation: fadeUp 0.6s var(--ease-out) both; }
        .links { display: flex; flex-direction: column; gap: 10px; }
        .link { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--surface); border-radius: 10px; border: 1px solid var(--border); text-decoration: none; color: var(--text-primary); font-size: 14px; transition: transform 0.2s var(--spring); }
        .link:hover { transform: translateY(-1px); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
