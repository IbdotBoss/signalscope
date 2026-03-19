from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import re
import time
from collections import OrderedDict

app = Flask(__name__)

# FIXED: CORS - explicit origins
CORS(app, origins=["https://signalscope.app", "http://localhost:3000", "http://localhost:3001"])

# Cache with size limit (LRU)
CACHE_TTL = 300
MAX_CACHE_SIZE = 1000
_cache = OrderedDict()

ALLOWED_CHAINS = ["ethereum", "base", "arbitrum", "optimism", "polygon", "solana", "avalanche"]

def get_cache(key):
    if key in _cache:
        timestamp, data = _cache[key]
        if time.time() - timestamp < CACHE_TTL:
            _cache.move_to_end(key)
            return data
        else:
            del _cache[key]
    return None

def set_cache(key, data):
    if key in _cache:
        _cache.move_to_end(key)
    else:
        if len(_cache) >= MAX_CACHE_SIZE:
            _cache.popitem(last=False)
    _cache[key] = (time.time(), data)

def run_nansen_profiler(address, chain):
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

def calculate_score(profiler_data):
    score = 0
    positives = []
    negatives = []
    risk_flags = []
    holdings = []
    total_value = 0
    token_count = 0
    
    if not profiler_data:
        return 0, "unknown", "low", ["Unable to fetch data"], ["API error"], ["No data available"], []
    
    if not profiler_data.get("success"):
        return 0, "unknown", "low", ["API returned error"], [profiler_data.get("error", "Unknown")], ["No data available"], []
    
    data = profiler_data.get("data")
    if not data:
        return 0, "unknown", "low", ["No data returned"], ["Empty response"], ["No data available"], []
    
    if isinstance(data, dict) and "data" in data:
        holdings = data["data"]
    elif isinstance(data, list):
        holdings = data
    else:
        return 0, "unknown", "low", ["Unexpected data format"], ["Invalid structure"], ["No data available"], []
    
    token_count = len(holdings)
    for h in holdings:
        total_value += h.get("value_usd", 0)
    
    if token_count >= 3:
        score += 35
        positives.append("Diverse portfolio indicates active trading")
    
    if token_count >= 5:
        score += 30
        positives.append(f"Strong diversification: {token_count} tokens")
    elif token_count >= 2:
        score += 20
        positives.append(f"Moderate holdings: {token_count} tokens")
    else:
        score += 5
        negatives.append("Limited token diversity")
    
    if holdings and total_value > 0:
        score += 20
        positives.append("Active onchain presence")
    else:
        negatives.append("No significant activity")
    
    if total_value > 10000:
        score += 10
        positives.append(f"Substantial holdings: ${total_value:,.0f}")
    elif total_value > 1000:
        score += 5
    else:
        risk_flags.append("Low portfolio value")
    
    if token_count == 0:
        risk_flags.append("No token holdings found")
        score -= 15
    
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

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "SignalScope", "cache_size": len(_cache)})

@app.route("/cache/clear", methods=["GET"])
def clear_cache():
    global _cache
    _cache.clear()
    return jsonify({"status": "cleared", "cache_size": 0})

@app.route("/api/investigate", methods=["POST"])
def investigate():
    data = request.get_json()
    inp = data.get("input", "").strip()
    
    if not re.match(r'^0x[a-fA-F0-9]{40}$', inp):
        return jsonify({"error": "Invalid input. Provide a valid EVM wallet address (0x...)."}), 400
    
    address = inp.lower()
    chain = (data.get("chain_preference") or "base").lower()
    
    if chain not in ALLOWED_CHAINS:
        return jsonify({"error": f"Invalid chain. Allowed: {ALLOWED_CHAINS}"}), 400
    
    profiler = run_nansen_profiler(address, chain)
    score, verdict, confidence, positives, negatives, risk_flags, holdings = calculate_score(profiler)
    
    bullets = positives[:2] if len(positives) >= 2 else positives + ["Onchain presence confirmed"]
    if negatives:
        bullets.append(negatives[0])
    
    evidence = [
        {"label": f"View on {chain.capitalize()}", "url": f"https://{chain}.blockscout.com/address/{address}"},
        {"label": "View on Ethereum", "url": f"https://eth.blockscout.com/address/{address}"}
    ]
    
    summary = f"This wallet shows {verdict.replace('_', ' ')} characteristics with {confidence} confidence based on {len(holdings)} token holdings."
    
    return jsonify({
        "entity": {"input": inp, "normalized": address, "type": "wallet"},
        "score": score,
        "verdict": verdict,
        "confidence": confidence,
        "summary": summary,
        "bullets": bullets,
        "risk_flags": risk_flags if risk_flags else ["Standard due diligence required"],
        "evidence_links": evidence
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
