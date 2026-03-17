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
    chain_preference: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "SignalScope"}

@app.post("/api/investigate")
def investigate(req: InvestigateRequest):
    inp = req.input.strip()
    
    # Classify input
    is_wallet = re.match(r'^0x[a-fA-F0-9]{40}$', inp)
    is_ens = inp.endswith('.eth')
    is_tx = re.match(r'^0x[a-fA-F0-9]{64}$', inp)
    
    if is_wallet:
        entity_type = "wallet"
        normalized = inp.lower()
    elif is_ens:
        entity_type = "ens"
        normalized = inp
    elif is_tx:
        entity_type = "transaction"
        normalized = inp
    else:
        entity_type = "unknown"
        normalized = inp
    
    # Run Nansen command
    try:
        if entity_type == "wallet":
            cmd = ["nansen", "research", "profiler", "balance", "--address", normalized, "--chain", req.chain_preference or "base", "--pretty"]
        else:
            cmd = ["nansen", "research", "token", "screener", "--chain", req.chain_preference or "base", "--limit", "1", "--pretty"]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        nansen_data = result.stdout if result.returncode == 0 else "Nansen query failed"
    except Exception as e:
        nansen_data = f"Error: {str(e)}"
    
    # Generate mock score for MVP (Nansen integration stub)
    import hashlib
    score_seed = int(hashlib.md5(normalized.encode()).hexdigest(), 16)
    score = (score_seed % 60) + 30  # Score between 30-90
    
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
    
    # Build response
    return {
        "entity": {
            "input": inp,
            "normalized": normalized,
            "type": entity_type
        },
        "score": score,
        "verdict": verdict,
        "confidence": confidence,
        "summary": f"This {entity_type} shows {verdict.replace('_', ' ')} characteristics with {confidence} confidence.",
        "bull_case": ["Smart Money activity detected", "Cross-chain presence confirmed"],
        "bear_case": ["Evidence is limited", "Signal requires more context"],
        "risk_flags": ["Standard due diligence required"],
        "smart_money": {"signal": "moderate" if score > 50 else "weak", "notes": "Net flows indicate activity"},
        "cross_chain_evidence": [
            {"chain": "base", "type": "wallet" if entity_type == "wallet" else "token", "url": f"https://base.blockscout.com/address/{normalized}"},
            {"chain": "ethereum", "type": "wallet" if entity_type == "wallet" else "token", "url": f"https://eth.blockscout.com/address/{normalized}"}
        ] if is_wallet else [],
        "sources": [{"label": "Nansen CLI", "type": "nansen"}, {"label": "Blockscout", "type": "blockscout"}],
        "raw_nansen": nansen_data[:500] + "..." if len(nansen_data) > 500 else nansen_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
