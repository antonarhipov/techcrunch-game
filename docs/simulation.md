# Simulation Page Guide

Last updated: 2025-10-25

This guide explains how to use the Simulation page to tune the scoring formula, test alternate paths, and reproduce game runs deterministically.

The Simulation page is an operator/developer tool. It does not change your saved game; it renders a synthetic run using the active content pack and your inputs.

---

## Open the Simulation Page

- Start the app: `npm run dev`
- Navigate to: `http://localhost:3000/simulation`

The layout mirrors the in-game UI: a left “Scenario” column with editors, a right “Console” column with Journey Breakdown, and a bottom meter panel.

---

## Panels Overview

### 1) Formula Editor
Adjust core MeterConfig parameters on the fly. Changes re-run the entire simulated journey immediately.

- Weights: R, U, S, C, I
- Sigmoid: μ (mu) and σ (sigma)
- Toggles:
  - Diminishing Returns (power 0.9)
  - Randomness (± bounds)
  - Momentum (bonus, streak threshold)
  - Rubber-band (threshold → S bump)
  - Bad Luck (probability)

Validation errors are shown inline (e.g., weights must sum to 1.0). These are computed with `validateConfig()`.

### 2) Deterministic Seed
Set a numeric seed to make randomness reproducible.

- Field: “Deterministic Seed” (default 123456)
- Every RNG call during the simulated journey uses this seed (via `createRNG(seed)`).
- Using the same seed + same choices + same config yields identical results.

### 3) Journey Editor
Define which option (A or B) is chosen at each of the 5 steps and optionally tweak the deltas to run “what-if” scenarios.

Per-step controls:
- Choice selector: A or B
- Delta editors for R, U, S, C, I (both Option A and Option B)
- Bad luck overrides:
  - Force Bad Luck (this step only)
  - Luck factor override (e.g., 0.55)
  - Force Perfect Storm (primarily relevant for Step 4B)

---

## Output Panels

- Journey Breakdown (right column): Expand to see how each step affected the score, including unluck details and the full formula view. The header shows the Seed for this run.
- Scaling Meter (bottom panel): Shows the final meter value and tier for the simulated journey.

---

## Reproducing a Real Game Run in Simulation

1. Play the game normally and finish a run.
2. Open the Journey Breakdown panel on the Results/Ending screen.
3. Copy the Seed from the header (displayed next to “Seed:” in monospace).
4. Open `/simulation`, paste that Seed into the “Deterministic Seed” field.
5. In Journey Editor, select the same choices (A/B) you took in the game.
6. Ensure the Formula Editor matches the default config (or whatever config was used in your game session).
7. The Simulation page will reproduce the same meter trajectory and final score.

Tip: If you enabled operator flags (e.g., forceUnluck) during the game, mirror those effects in Journey Editor (Force Bad Luck, Luck factor, Force Perfect Storm) to match the run.

---

## Where to Get the Seed (Journey Breakdown)

- After completing a game (or at any time if the breakdown is available), click the “Your Journey Breakdown” panel to expand it.
- In the header of that panel you will see:
  - Label: `Seed:`
  - The exact numeric value used for that run, e.g., `1712345678901`.
- Use that number as the seed in the Simulation page to reproduce the run.

Note: The seed is also accepted as a URL parameter for the main game (`?seed=12345`) via the feature flags system.

---

## FAQ

- Do Simulation edits change my actual game?  
  No. The Simulation page constructs a synthetic RunState and never writes to your saved progress.

- Can I try different content packs?  
  Yes. The Simulation uses the active content pack from GameContext. Load a different pack first (if supported in your build), then open `/simulation`.

- Why do I see “Config errors”?  
  Some combinations are invalid (e.g., weights not summing to ~1.0). Fix the values to proceed.

---

## Related Docs

- docs/meter-engine-quick-reference.md — scoring pipeline, RNG API, and example simulations
- docs/unluck-api.md — regular unluck and Perfect Storm rules
- docs/content-packs.md — defining and loading content
