# SignalScope Iteration 3: Evidence Accumulation

## Creative Brief

**What is SignalScope's ONE job?**
Give you confidence to trust (or not trust) an address by revealing evidence about its behavior.

**What would ONLY SignalScope look like?**
A detective's evidence board — findings appear one by one as evidence accumulates, like a case being built.

**The creative thesis:**
"Wallet analysis is evidence accumulation. The score reflects how much evidence we've gathered."

---

## Copy Direction

| Before | After |
|--------|-------|
| "Score: 74" | "Evidence strength: 74%" |
| "Confidence: High" | "Confidence: Strong signal" |
| "Finding:" | "Evidence suggests:" |
| "Risk flag:" | "Pattern detected:" |
| "Risk Notes" | "Detected patterns" |
| "Summary:" | (no label — just plain English) |
| "Findings" | "Evidence" |

---

## Visual Changes

### Score Display
- Label changes to "Evidence strength"
- Score counts up from 0 using CountUp component
- Duration: 1.5s, warm accent color

### Findings (Evidence)
- Each finding appears with AnimatedList stagger
- Numbered as "Evidence 1", "Evidence 2", etc.
- Each has a warm accent color from the palette
- Plain English throughout — no trading jargon

### Loading Phases
- "Gathering evidence..."
- "Analyzing patterns..."
- "Building case..."
- "Finalizing report..."

---

## Components Used

- `CountUp` from reactbits — score animation
- `AnimatedList` from reactbits — findings stagger in
- `Noise` from reactbits — subtle grain texture (optional)

---

## Font & Color (unchanged from iter 2)

- Geist (self-hosted from fonts.geist.xyz)
- Warm accent: #FF724C
- Dark palette: #080808 / #141414

---

## What This Achieves

1. **Unique identity** — Evidence accumulation is specific to wallet analysis
2. **No competitors** — Nansen and Arkham use trading terminal aesthetic
3. **Medium as message** — The UX IS the analysis process
4. **Distinctive copy** — "Evidence suggests" vs "Finding:"
5. **Confidence-building** — The stagger of evidence building creates anticipation
