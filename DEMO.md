# SignalScope Demo Script

## Setup (Terminal 1 - API)
```bash
cd /home/ubuntu/.openclaw/workspace/signalscope/api
python main.py
```
API runs on http://localhost:8000

## Setup (Terminal 2 - Frontend)
```bash
cd /home/ubuntu/.openclaw/workspace/signalscope
npm run dev
```
Frontend runs on http://localhost:3000

## Demo Flow (2-3 minutes)

### 1. Homepage (0:00-0:15)
- Show clean dark UI
- Highlight: "Understand any wallet, token, or contract in seconds"
- Point out seeded examples

### 2. Example 1: vitalik.eth (0:15-0:45)
- Click "vitalik.eth" example
- Loading states: "Classifying entity → Checking Smart Money → Scoring conviction → Building brief"
- Reveal score card
- Highlight: Score, verdict badge, confidence

### 3. Result View (0:45-1:30)
- Scroll through:
  - Entity label + address
  - Big score (e.g., 74)
  - Verdict badge (e.g., "WATCHLIST")
  - Summary paragraph
  - Bull/Bear bullets
  - Risk flags
  - Blockscout explorer links
  - Raw data toggle (click to show)

### 4. New Investigation (1:30-2:00)
- Click "New Investigation"
- Paste custom address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
- Show real-time analysis

### 5. API Demo (2:00-2:30)
- Show `curl` example:
```bash
curl -X POST http://localhost:8000/api/investigate \
  -H "Content-Type: application/json" \
  -d '{"input":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```
- Highlight: Real Nansen CLI integration, structured response

### 6. Closing (2:30-3:00)
- Return to homepage
- Mention: "Built with Nansen CLI, Next.js, FastAPI"
- Show GitHub repo link

## Key Talking Points
- "One input, one conviction report"
- "Smart Money intelligence from Nansen CLI"
- "Blockscout explorer proof"
- "Agent-ready API"

## Screenshot Moments
1. Homepage with hero
2. Loading animation
3. Score card (high score = green)
4. Raw data expanded
