

## Scaling Meter — design

1) Track a hidden state, not just one number

Keep a 5-dim vector that updates every step:
•	R = Revenue Momentum
•	U = User Growth / Activation
•	S = System Reliability / Scalability
•	C = Customer Love (NPS / retention)
•	I = Investor Confidence / Story

These are intuitive, map well to your steps, and let you show different endings later.

2) Each choice applies deltas to the vector

Define small effect bundles per task (positive and tradeoffs). Example deltas (tune later):
•	Step 1A – Subscriptions: +R +U, slight -I (investor visibility lag)
•	Δ ≈ R+10, U+4, I-2
•	Step 1B – Investor Dashboard: +I, slight -R (delay monetization)
•	Δ ≈ I+10, R-3
•	Step 2A – Landing page: +U, slight -C (onboarding gap)
•	Δ ≈ U+8, C-2
•	Step 2B – Onboarding emails: +C, slight -U (top-funnel slower)
•	Δ ≈ C+8, U-2
•	Step 3A – Collaboration features: +U +R, slight -S (heavier load)
•	Δ ≈ U+6, R+5, S-3
•	Step 3B – Analytics: +C +I, slight -U
•	Δ ≈ C+6, I+4, U-2
•	Step 4A – Autoscaling: +S +I, no change to C (tickets still high)
•	Δ ≈ S+10, I+3
•	Step 4B – AI Support: +C +I, risk to S (load spike)
•	Δ ≈ C+7, I+4, S-5
•	Step 5A – Multilingual: +U +C, no immediate R
•	Δ ≈ U+6, C+5
•	Step 5B – Intl payments: +R +I, slight -C (UX gaps)
•	Δ ≈ R+8, I+3, C-2

Tip: Keep each Δ in the range [-6, +12] so steps feel meaningful but not swingy.

3) Convert hidden state to a single meter (0–100)

Weight what “scaling” means at a tech expo (speed, traction, and trust):
score_raw = 0.30*R + 0.25*U + 0.20*S + 0.15*C + 0.10*I

Normalize and clamp:
score_norm = 100 * sigmoid((score_raw - μ)/σ)
meter = clamp(round(score_norm), 0, 100)

•	Use μ ≈ -4, σ ≈ 11 (tuned via seeded simulations; median ~60–75, greedy ≥80 reachable).
•	sigmoid prevents impossible 0/100s and makes mid-range differences visible.

4) Add controlled randomness (so runs feel fresh)

Use mean-zero noise with tight bounds:

ε ~ Uniform(-5, +5)   // or Normal(0, 2)
meter = clamp(meter + ε, 0, 100)

•	Keep randomness small vs. choice impact so players feel agency.
•	Seed it with a per-session seed for reproducibility if you want a “fair mode”.

Troubleshooting
- If you see very low finals (e.g., ~27–29) on strong routes like 1A→2A→3A→4A→5B, you might be running an old build
  or a cached config (older μ≈25/σ≈12, randomness ±3). Hard refresh/clear cache and ensure the app uses μ≈-4/σ≈11
  and randomness ±5 (see DEFAULT_CONFIG in src/lib/scaling-meter.ts).


5) Momentum & diminishing returns (feels real)
   •	Momentum: recent gains count slightly more:

streak = +3 if last_step_meter_increase else 0
meter += streak

•	Diminishing returns: big values in any dimension contribute less over time:
R_eff = R^(0.9); U_eff = U^(0.9); ...  // or cap each dim at 40

Then compute score_raw from the _eff values.

6) Rubber-band to avoid death spirals (expo-friendly)

If meter < 30, give a hidden +2 resilience bump to S or C after the next step (do not tell the player). Keeps the experience fun in a booth.

7) Nice, readable feedback tiers

After each step, show:
•	Meter: 0–100 bar.
•	Tagline (based on meter):
•	0–29: “🚧 Scrappy Mode”
•	30–49: “🌱 Finding Fit”
•	50–69: “⚡ Gaining Steam”
•	70–84: “🚀 Scaling Up”
•	85–100: “🦄 Breakout Trajectory”
•	Two micro-insights pulled from the dominant dimensions (e.g., “Infra is your bottleneck; consider autoscaling” or “Investors love your visibility; revenue can catch up”).

8) Pseudocode (drop-in ready)
```js
// init
state = { R:0, U:0, S:0, C:0, I:0 }
seed = getSessionSeed()        // optional
rng  = mulberry32(seed)        // deterministic RNG

function applyChoice(choice) {
  let delta = deltas[choice]   // from the table above
  for (k in delta) state[k] += delta[k]

  // diminishing returns
  let Re = Math.pow(Math.max(0,state.R), 0.9)
  let Ue = Math.pow(Math.max(0,state.U), 0.9)
  let Se = Math.pow(Math.max(0,state.S), 0.9)
  let Ce = Math.pow(Math.max(0,state.C), 0.9)
  let Ie = Math.pow(Math.max(0,state.I), 0.9)

  let raw = 0.30*Re + 0.25*Ue + 0.20*Se + 0.15*Ce + 0.10*Ie
  let meter = Math.round(100 * sigmoid((raw - 25)/12))

  // momentum
  if (meter > lastMeter) meter += 3

  // randomness (tight)
  meter += (rng()*6 - 3)  // [-3,+3]
  meter = Math.max(0, Math.min(100, Math.round(meter)))

  // rubber-band (next step helper)
  if (meter < 30) state.S += 2  // quiet nudge

  lastMeter = meter
  return meter
}
```

9) Balancing tips
   •	Start playtests with Δ values ~20% smaller than you think; it’s easier to buff later.
   •	Tune μ/σ so “smart but imperfect” play lands ~75.
   •	Keep randomness ≤ 10% of a typical step’s effect.

10) How to reach 80+
- A solid, high-performing route to start with is: 1A → 2A → 3A → 4A → 5B.
- With current tuning, expect ~60–75 on this route; to reach 80+, keep a rising streak and pick options maximizing projected raw after diminishing returns (a greedy heuristic may deviate at times).
- See also: docs/how-to-reach-80+.md for step-by-step reasoning, momentum tips, and troubleshooting.

See Unluck parameters and UI mapping in docs/unluck.md.
