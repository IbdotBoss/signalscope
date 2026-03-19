from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import subprocess
import json
import re

app = FastAPI(title="SignalScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvestigateRequest(BaseModel):
    input: str
    depth: Optional[str] = "standard"
    chain_preference: Optional[str] = "base"

class InvestigateResponse(BaseModel):
    entity: dict
    score: int
    verdict: str
    confidence: str
    summary: str
    bullets: List[str]
    risk_flags: List[str]
    evidence_links: List[dict]
    raw: dict

def classify_entity(raw_input: str):
    inp = raw_input.strip()
    if re.match(r'^0x[a-fA-F0-9]{40}$', inp):
        return {"input": inp, "normalized": inp.lower(), "type": "wallet", "is_evm": True}
    if inp.endswith('.eth'):
        return {"input": inp, "normalized": inp, "type": "ens", "is_evm": True}
    return {"input": inp, "normalized": inp, "type": "unknown", "is_evm": False}

def run_nansen_profiler(address: str, chain: str) -> dict:
    try:
        cmd = ["nansen", "research", "profiler", "balance", "--address", address, "--chain", chain, "--limit", "20"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return json.loads(result.stdout)
        return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_nansen_smart_money(address: str, chain: str) -> dict:
    try:
        cmd = ["nansen", "research", "smart-money", "netflow", "--chain", chain, "--limit", "10"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return json.loads(result.stdout)
        return {"success": False, "error": "No Smart Money data"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def calculate_score(profiler_data: dict, sm_data: dict) -> tuple:
    score = 0
    positives = []
    negatives = []
    risk_flags = []
    
    # Parse profiler data - handle Nansen's response structure
    holdings = []
    total_value = 0
    token_count = 0
    
    if profiler_data.get("success") and "data" in profiler_data:
        data = profiler_data["data"]
        if isinstance(data, dict) and "data" in data:
            holdings = data["data"]
        elif isinstance(data, list):
            holdings = data
        
        token_count = len(holdings)
        for h in holdings:
            total_value += h.get("value_usd", 0)
    
    # Scoring logic
    if sm_data.get("success"):
        score += 40
        positives.append("Smart Money activity detected in ecosystem")
    else:
        score += 15
        negatives.append("Limited Smart Money correlation")
    
    if token_count >= 5:
        score += 20
        positives.append(f"Diverse portfolio: {token_count} tokens")
    elif token_count >= 2:
        score += 15
        positives.append(f"Moderate diversity: {token_count} tokens")
    else:
        score += 5
        negatives.append("Low token diversity")
    
    if holdings:
        score += 20
        positives.append("Active onchain presence")
    else:
        negatives.append("No recent activity data")
    
    if total_value > 10000:
        score += 10
        positives.append(f"Significant holdings: ${total_value:,.0f}")
    elif total_value > 1000:
        score += 5
    else:
        risk_flags.append("Low portfolio value")
    
    if token_count == 0:
        risk_flags.append("No token holdings found")
        score -= 10
    
    if score < 30:
        risk_flags.append("Low signal strength")
    
    score = max(0, min(100, score))
    
    if score >= 85:
        verdict = "high_conviction"
        confidence = "high"
    elif score >= 70:
        verdict = "strong"
        confidence = "high"
    elif score >= 50:
        verdict = "watchlist"
        confidence = "medium"
    elif score >= 25:
        verdict = "weak"
        confidence = "low"
    else:
        verdict = "avoid"
        confidence = "low"
    
    return score, verdict, confidence, positives, negatives, risk_flags, holdings

@app.get("/health")
def health():
    return {"status": "ok", "service": "SignalScope"}

@app.post("/api/investigate", response_model=InvestigateResponse)
def investigate(req: InvestigateRequest):
    inp = req.input.strip()
    
    if not re.match(r'^0x[a-fA-F0-9]{40}$', inp):
        raise HTTPException(status_code=400, detail="Invalid input. Provide a valid EVM wallet address (0x...).")
    
    address = inp.lower()
    chain = req.chain_preference or "base"
    
    profiler = run_nansen_profiler(address, chain)
    sm_data = run_nansen_smart_money(address, chain)
    
    score, verdict, confidence, positives, negatives, risk_flags, holdings = calculate_score(profiler, sm_data)
    
    bullets = positives[:2] if len(positives) >= 2 else positives + ["Onchain presence confirmed"]
    if negatives:
        bullets.append(negatives[0])
    
    evidence = [
        {"label": f"View on {chain.capitalize()}", "url": f"https://{chain}.blockscout.com/address/{address}"},
        {"label": "View on Ethereum", "url": f"https://eth.blockscout.com/address/{address}"}
    ]
    
    summary = f"This wallet shows {verdict.replace('_', ' ')} characteristics with {confidence} confidence based on {len(holdings)} token holdings and ecosystem activity."
    
    return InvestigateResponse(
        entity={"input": inp, "normalized": address, "type": "wallet"},
        score=score,
        verdict=verdict,
        confidence=confidence,
        summary=summary,
        bullets=bullets,
        risk_flags=risk_flags if risk_flags else ["Standard due diligence required"],
        evidence_links=evidence,
        raw={"profiler": profiler, "smart_money": sm_data}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
