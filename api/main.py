from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import subprocess
import json
import re
import hashlib
from functools import lru_cache
import time

app = FastAPI(title="SignalScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache: address -> (timestamp, data)
# Cache for 5 minutes to save Nansen credits
CACHE_TTL = 300  # 5 minutes
_cache: Dict[str, tuple] = {}

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

def get_cache(key: str):
    if key in _cache:
        timestamp, data = _cache[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
    return None

def set_cache(key: str, data):
    _cache[key] = (time.time(), data)

def classify_entity(raw_input: str):
    inp = raw_input.strip()
    if re.match(r'^0x[a-fA-F0-9]{40}$', inp):
        return {"input": inp, "normalized": inp.lower(), "type": "wallet", "is_evm": True}
    if inp.endswith('.eth'):
        return {"input": inp, "normalized": inp, "type": "ens", "is_evm": True}
    return {"input": inp, "normalized": inp, "type": "unknown", "is_evm": False}

def run_nansen_profiler(address: str, chain: str) -> dict:
    """Get wallet balance/profile from Nansen - CACHED"""
    cache_key = f"profiler:{address}:{chain}"
    cached = get_cache(cache_key)
    if cached:
        print(f"[CACHE HIT] {address}")
        return cached
    
    try:
        cmd = ["nansen", "research", "profiler", "balance", "--address", address, "--chain", chain, "--limit", "20"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            set_cache(cache_key, data)
            return data
        return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}

def calculate_score(profiler_data: dict) -> tuple:
    """Calculate conviction score - NO extra Nansen calls"""
    score = 0
    positives = []
    negatives = []
    risk_flags = []
    
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
    
    # Scoring - simplified to use ONLY profiler data (saves credits)
    # Smart Money signal (40 pts) - inferred from holdings quality
    if token_count >= 3:
        score += 35
        positives.append("Diverse portfolio indicates active trading")
    
    # Wallet quality (30 pts) - based on holdings diversity
    if token_count >= 5:
        score += 30
        positives.append(f"Strong diversification: {token_count} tokens")
    elif token_count >= 2:
        score += 20
        positives.append(f"Moderate holdings: {token_count} tokens")
    else:
        score += 5
        negatives.append("Limited token diversity")
    
    # Recent activity (20 pts)
    if holdings and total_value > 0:
        score += 20
        positives.append("Active onchain presence")
    else:
        negatives.append("No significant activity")
    
    # Value indicator (10 pts)
    if total_value > 10000:
        score += 10
        positives.append(f"Substantial holdings: ${total_value:,.0f}")
    elif total_value > 1000:
        score += 5
    else:
        risk_flags.append("Low portfolio value")
    
    # Penalties
    if token_count == 0:
        risk_flags.append("No token holdings found")
        score -= 15
    
    score = max(0, min(100, score))
    
    # Verdict
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
    return {"status": "ok", "service": "SignalScope", "credits": "Check Nansen dashboard"}

@app.get("/cache/clear")
def clear_cache():
    global _cache
    _cache.clear()
    return {"status": "cleared"}

@app.post("/api/investigate", response_model=InvestigateResponse)
def investigate(req: InvestigateRequest):
    inp = req.input.strip()
    
    if not re.match(r'^0x[a-fA-F0-9]{40}$', inp):
        raise HTTPException(status_code=400, detail="Invalid input. Provide a valid EVM wallet address (0x...).")
    
    address = inp.lower()
    chain = req.chain_preference or "base"
    
    # ONE API call only (profiler balance) - cached for 5 min
    profiler = run_nansen_profiler(address, chain)
    
    # Calculate score from single call
    score, verdict, confidence, positives, negatives, risk_flags, holdings = calculate_score(profiler)
    
    bullets = positives[:2] if len(positives) >= 2 else positives + ["Onchain presence confirmed"]
    if negatives:
        bullets.append(negatives[0])
    
    evidence = [
        {"label": f"View on {chain.capitalize()}", "url": f"https://{chain}.blockscout.com/address/{address}"},
        {"label": "View on Ethereum", "url": f"https://eth.blockscout.com/address/{address}"}
    ]
    
    summary = f"This wallet shows {verdict.replace('_', ' ')} characteristics with {confidence} confidence based on {len(holdings)} token holdings."
    
    return InvestigateResponse(
        entity={"input": inp, "normalized": address, "type": "wallet"},
        score=score,
        verdict=verdict,
        confidence=confidence,
        summary=summary,
        bullets=bullets,
        risk_flags=risk_flags if risk_flags else ["Standard due diligence required"],
        evidence_links=evidence,
        raw={"profiler": profiler}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
