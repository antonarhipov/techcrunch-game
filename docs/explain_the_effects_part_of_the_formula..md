### TL;DR
- In the formulas you see in `JourneyBreakdown.tsx`, `effects` is the catch‑all “extra” that explains the difference between the baseline sigmoid result and the actual meter value you see.
- It bundles together post‑sigmoid mechanics: randomness, momentum bonus, and clamping/rounding. It does not include unluck itself (because unluck changes the deltas before the sigmoid baseline is computed).
- There isn’t a single `effects(parameter)` function; the “parameter” printed next to `effects` is just the numeric amount of these extras for that step or for the final total.

---

### Where you see it in the UI
- Per step (lines 292–300):
  ```
  Score change (sigmoid + effects):
  100/(1 + e^-((rawAfter - μ)/σ)) - 100/(1 + e^-((rawBefore - μ)/σ)) = {baseDelta} + effects ({effectsDeltaStep}) = {totalDelta}%
  ```
- Final summary (lines 475–481):
  ```
  Final Score:
  100/(1 + e^-((rawWeightedSum - μ)/σ)) = {baseScore} + effects ({signedEffects}) = {displayValue}%
  ```
  Source: `src/components/JourneyBreakdown.tsx`.

---

### What “effects” actually measures
Conceptually, for a given moment:
- `base` = what the meter would be if we only applied the weighted sum → sigmoid (with diminishing returns baked into the effective hidden state) and stopped there.
- `effects` = everything applied after that baseline to produce the final, visible meter value.

Formally, for a step:
```
effectsDeltaStep = (meterAfter - meterBefore) - (baseAfter - baseBefore)
```
For the whole run (final line):
```
effectsTotal = displayValue - baseScore
```
Both are computed in `JourneyBreakdown.tsx` (e.g., lines 282–289 and 41–42).

---

### What contributes to “effects”
“Effects” aggregates these post‑sigmoid mechanics from the meter engine (`src/lib/meter-engine.ts`):

1) Randomness (noise)
- Code: `applyRandomness()` then added in `updateMeterState()` right after normalization.
- Snippet:
  ```ts
  // after normalizeMeter(...)
  if (config.randomness.enabled) {
    meterValue = applyRandomness(meterValue, rng, config.randomness.bounds);
  }
  ```
- Config “parameters” that govern it: `config.randomness.enabled`, `config.randomness.bounds: [min, max]`.

2) Momentum bonus
- Code: streak is updated, then `applyMomentumBonus()` may add a fixed bonus.
  ```ts
  const newStreak = updateStreak(oldDisplayValue, meterValue, state.streak);
  meterValue = applyMomentumBonus(meterValue, newStreak, config);
  ```
- Config parameters: `config.momentum.enabled`, `config.momentum.bonus`, `config.momentum.streakThreshold`.

3) Clamping and rounding of the displayed meter
- Code: `clampMeter()` caps to `[0, 100]` and rounds to 1 decimal, which can slightly change the value compared to the raw sigmoid+noise+momentum result.
  ```ts
  const finalValue = clampMeter(meterValue); // clamp + round
  ```
- No configurable parameter for rounding itself; it’s fixed behavior.

Notes about what is NOT counted inside “effects” here:
- Unluck mechanics (regular or Perfect Storm) change the `delta` before the sigmoid stage. In `updateMeterStateWithUnluck()`, we first run `processUnluck()` to modify the delta, then call `updateMeterState()` with the modified delta. Because the per‑step baseline in the breakdown is computed from `step.appliedDelta` (the already‑modified delta), unluck is reflected in the baseline portion, not in `effects`.
- Diminishing returns are applied when forming the effective hidden state for the baseline; they are therefore included in the `base` part, not in `effects`.
- Rubber‑band bumps affect the hidden state for the next step (game flow), so they manifest as part of the future step’s baseline, not as an “effect” on the current step.

---

### So… what’s the “parameter” to `effects`?
There is no `effects()` function with a formal parameter list. The word `effects` in the printed formula is a label, and the value in parentheses is simply the numeric residual:
- Per step: `effectsDeltaStep` (e.g., `+0.6`) — the part of that step’s change caused by randomness, momentum, and rounding.
- Final: `effectsDelta` (e.g., `-1.2`) — the total difference between your final displayed score and the pure sigmoid baseline for the final hidden state.

If you’re looking for knobs to tune how big that number becomes, these are the relevant configuration “parameters”:
- `randomness.bounds` (e.g., `[-0.5, +0.5]`): size of the random nudge per update
- `momentum.bonus` and `momentum.streakThreshold`: extra points once a streak is achieved
- The rounding/clamping behavior (fixed in `clampMeter`) can also make `effects` slightly non‑zero even with randomness disabled

---

### Tiny numeric example
Suppose for a step:
- Baseline `baseBefore → baseAfter` = `+4.2`
- Random noise that frame = `-0.35`
- Momentum triggers = `+1.0`
- Rounding trims `0.1`

Then:
```
effectsDeltaStep = (-0.35) + (+1.0) + (-0.1) = +0.55
Total step change = 4.2 + 0.55 = +4.75
```
What you’ll see printed is: `... = +4.2 + effects (+0.6) = +4.8%` (numbers rounded for display).

---

### File pointers (for quick verification)
- Breakdown and printed formulas: `src/components/JourneyBreakdown.tsx` (see lines ~256–304 and ~468–481)
- Engine steps where “effects” come from: `src/lib/meter-engine.ts`
  - Randomness: `applyRandomness` and its use in `updateMeterState`
  - Momentum: `updateStreak` + `applyMomentumBonus`
  - Clamping/Rounding: `clampMeter`
- Unluck (runs before the engine and thus affects the baseline, not `effects`): `src/lib/unluck.ts`, orchestrated by `updateMeterStateWithUnluck()` in `meter-engine.ts`

If you want, I can walk through a concrete step from a recent run and compute each term side‑by‑side to show exactly how its `effects` number was formed.