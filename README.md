# SignalScope

A premium dark web app for onchain conviction reports. Understand any wallet, token, or contract in seconds.

Powered by Nansen CLI + Blockscout evidence.

## Quick Start

```bash
# Install dependencies
npm install
cd api && pip install -r requirements.txt

# Start API server
cd api && python main.py

# Start frontend (new terminal)
npm run dev
```

## Features

- One input, one report
- Smart Money intelligence from Nansen CLI
- Blockscout explorer proof
- 0-100 conviction score
- Verdict: avoid / weak / watchlist / strong / high_conviction
- Agent-ready API + skill.md

## Demo

1. Paste a wallet address
2. Click Investigate
3. Get score, verdict, summary
4. View explorer evidence

## Stack

- Next.js + TypeScript + Tailwind
- FastAPI backend
- Nansen CLI for onchain data
- Blockscout for explorer links

## License

MIT
