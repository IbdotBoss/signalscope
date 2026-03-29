# SignalScope Redesign Spec

## Current State
- Font: Bricolage Grotesque (display) + Figtree (body) ✓
- Icons: Phosphor ✓
- Palette: Dark (#050505) + Orange accent (#FF6B35) ✓
- Layout: Clean two-column ✓
- Slop: IntelOrb, scanlines, degen copy, trading bot UI ✗

---

## Voice: The Trusted Analyst

**Positioning:** Not a trading tool. Not a degen scanner. A quiet, confident analysis tool for people who want to understand wallets before committing capital.

**Tone:** 
- Quiet confidence. No shouting. No spinning orbs.
- Like reading a well-written research note, not a trading terminal.
- Honest about what the data shows — doesn't oversell.

**What to remove:**
- "ape in" / "whales" / "Smart Money" / "conviction" jargon
- Spinning orbital animations
- Scanlines overlay
- Trading terminal aesthetics (score as a big number with green/red)
- "Nansen connected" badge

**What to keep:**
- Fast analysis
- Real data from Nansen
- Explorer proof/links
- Clean, fast interface

---

## New Copy Direction

### Tagline (before)
> "See what the whales see"

### Tagline (after)
> "Read any wallet."

Simple. Confident. No metaphor.

### Hero (before)
> "Before you ape in, check if Smart Money already moved. SignalScope reads wallet conviction from Nansen chain data."

### Hero (after)
> "Paste an address. Get a clear read on what that wallet has been doing."

No "Smart Money". No "conviction". No "ape in".

### Feature copy (before)
- "Track Smart Money" — "See where whales move before the crowd"
- "Conviction Scoring" — "Data-driven wallet reliability scores"
- "Seconds, Not Hours" — "Instant intel on any EVM address"

### Feature copy (after)
- "On-chain history" — "See every move, in order"
- "Behavior score" — "Rate the patterns, not the tokens"
- "Ready in seconds" — "No waiting for reports"

### Verdict language (before)
- AVOID / WEAK / WATCHLIST / STRONG / HIGH CONFIDENCE

### Verdict language (after)
Keep the score, but change the presentation:
- No more badge with all-caps label
- Score is prominent
- Below it: plain English. "Has a history of early token sells" or "Hasn't moved in 6 months" — actual observations, not trading signals

### Loading phases (before)
- "Mapping wallets → Tracking Smart Money → Scoring conviction → Building intel"

### Loading phases (after)
- "Reading transactions..."
- "Checking behavior patterns..."
- "Scoring activity..."
- "Finalizing report..."

---

## Design Changes

### Remove
1. IntelOrb component — replace with something that shows actual analysis/reading
2. Scanlines overlay — gimmicky
3. Spinning animations — every crypto site has these
4. "Nansen connected" badge in nav
5. The radial gradient "glow" in top-left corner

### Change
1. **Score display**: Currently shows 0-100 with trading colors (red/green/yellow). Should feel more like a "readability score" — maybe use a single color or just the accent color, not green=good red=bad
2. **Verdict presentation**: Instead of a badge, show a plain-English summary of what the score means. "This address has been actively trading for 8 months, mostly stablecoins" vs "This address deployed a token 3 days ago and has moved 40% of supply"
3. **Feature section**: Instead of 3 icon cards with "Smart Money" language, show a cleaner breakdown

### Keep
1. Dark palette (but maybe soften the orange — consider a cooler accent or no accent at all)
2. Bricolage Grotesque + Figtree
3. Phosphor icons
4. Clean two-column layout
5. Monospace for addresses

### Consider
1. **What if the accent was a cool gray-blue instead of orange?** Would feel more "analyst" and less "trading terminal"
2. **What if the hero was just: address input + tagline, nothing else?** Less clutter
3. **What if the "evidence" section was the main visual?** Instead of an orb, show actual wallet activity visualization (even if simple — just a timeline)

---

## Component Changes

### HeroVisual (replaces IntelOrb)
- Remove spinning circles
- Instead: simple visualization of wallet analysis
- Could be: a simple timeline of wallet activity, or just clean typography with the tagline
- The key: let the data speak, not the graphics

### ScoreDisplay
- Remove colored verdict badges (AVOID/WATCHLIST/etc)
- Keep the score number but present it differently
- Add: plain-English interpretation below the number
- Example: "Score: 74 — Active trader, profit-taking pattern detected"

### Input Section
- Keep clean, minimal
- Change button from "Investigate" to something else? Maybe just show arrows or keep "Investigate" — it's actually fine
- Change example buttons from "vitalik.eth" / "Base deployer" to maybe "Try these:" or remove labels entirely

### Footer
- Remove "Powered by Nansen CLI" — it's in the README but feels like a badge on the site
- Just keep version number or remove entirely

---

## Technical Notes

- Keep all existing functionality (API integration, loading states, error handling)
- Only change: visuals and copy
- Test locally before deploying
- The API response structure stays the same

---

## Priority Order

1. Copy refresh (remove jargon, new tone)
2. Remove gimmicks (IntelOrb, scanlines, glow)
3. Redesign score/verdict display
4. New hero visual
5. Feature section refresh
6. Polish and test
