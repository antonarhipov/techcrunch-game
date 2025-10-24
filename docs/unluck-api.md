# Unluck System API Reference

## Overview

The Unluck System adds contextual bad luck events to the game, reducing positive gains with snarky narratives. Includes Perfect Storm special unluck for Step 4B.

## Core Functions

### `processUnluck()`

Main entry point for unluck processing. Orchestrates all unluck logic.

```typescript
function processUnluck(
  stepId: number,
  choice: "A" | "B",
  delta: Delta,
  rng: SeededRNG,
  config: MeterConfig = DEFAULT_CONFIG,
  options: {
    forceUnluck?: boolean;
    forcePerfectStorm?: boolean;
    unluckFactorOverride?: number;
  } = {}
): { finalDelta: Delta; result: UnluckResult }
```

**Parameters:**
- `stepId` - Current step number (1-5)
- `choice` - Player's choice ("A" or "B")
- `delta` - Original choice delta from content pack
- `rng` - SeededRNG instance
- `config` - Meter configuration (optional, uses DEFAULT_CONFIG)
- `options` - Optional overrides for testing/demos

**Returns:**
- `finalDelta` - Modified delta after unluck/Perfect Storm
- `result` - UnluckResult with metadata

**Example:**
```typescript
const { finalDelta, result } = processUnluck(
  2, // Step 2
  "B", // Onboarding emails
  { R: 0, U: 8, S: 0, C: 6, I: 0 },
  rng,
  DEFAULT_CONFIG,
  { forceUnluck: true }
);

console.log(result.unluckApplied); // true
console.log(result.luckFactor);    // 0.55 (example)
console.log(result.message);       // "Emails went to spam..."
```

### `rollUnluck()`

Determines if unluck should trigger this step.

```typescript
function rollUnluck(
  rng: SeededRNG,
  config: MeterConfig = DEFAULT_CONFIG,
  forceUnluck = false
): boolean
```

**Returns:** `true` if unluck should trigger (default 10% probability)

### `rollPerfectStorm()`

Determines if Perfect Storm should trigger (only on Step 4B with unluck).

```typescript
function rollPerfectStorm(
  stepId: number,
  choice: "A" | "B",
  unluckOccurred: boolean,
  rng: SeededRNG,
  config: MeterConfig = DEFAULT_CONFIG,
  forcePerfectStorm = false
): boolean
```

**Trigger conditions:**
1. `stepId === 4` (Viral Spike)
2. `choice === "B"` (AI Support Chatbot)
3. `unluckOccurred === true` (regular unluck already triggered)
4. Probability roll passes (default 100%)

### `applyUnluckToDeltas()`

Scales only positive delta components by luck factor.

```typescript
function applyUnluckToDeltas(delta: Delta, luckFactor: number): Delta
```

**Behavior:**
- Positive values: multiplied by `luckFactor` (0.4-0.7)
- Negative values: unchanged (tradeoffs preserved)
- Zero values: unchanged

**Example:**
```typescript
const original = { R: 5, U: -2, S: 8, C: 0, I: 3 };
const modified = applyUnluckToDeltas(original, 0.5);
// Result: { R: 2.5, U: -2, S: 4, C: 0, I: 1.5 }
//         ↑ reduced  ↑ kept  ↑ reduced  ↑ kept  ↑ reduced
```

### `applyPerfectStormPenalties()`

Applies Perfect Storm penalties to delta.

```typescript
function applyPerfectStormPenalties(
  delta: Delta,
  config: MeterConfig = DEFAULT_CONFIG
): Delta
```

**Penalties (default config):**
- **R (Revenue):** 50% symmetric scaling — positives reduced by 50%, negatives amplified by 50%
- **U (Users):** 50% symmetric scaling — positives reduced, negatives amplified
- **S (System):** 50% symmetric scaling — positives reduced, negatives amplified
- **C (Customers):** 70% symmetric scaling — positives reduced, negatives amplified
- **I (Investors):** 40% symmetric scaling — positives reduced, negatives amplified

### `getUnluckMessage()`

Returns contextual message for step/choice combination.

```typescript
function getUnluckMessage(
  stepId: number,
  choice: "A" | "B",
  rng: SeededRNG
): string
```

**Returns:** Deterministic message variant based on RNG state

**Message count:** 30+ variants (5 steps × 2 choices × 2-3 variants each)

### `getPerfectStormMessage()`

Returns dramatic Perfect Storm message.

```typescript
function getPerfectStormMessage(rng: SeededRNG): string
```

**Returns:** One of 8 dramatic system-collapse messages

## Types

### `UnluckResult`

```typescript
interface UnluckResult {
  unluckApplied: boolean;    // Whether unluck triggered
  luckFactor: number;        // 1.0 if no unluck, [0.4-0.7] if unluck
  message: string | null;    // Contextual message (null if no unluck)
  perfectStorm: boolean;     // Whether Perfect Storm triggered
}
```

### `StepResult` (extends existing)

```typescript
interface StepResult {
  // ... existing fields
  unluckApplied: boolean;
  luckFactor?: number;       // Actual multiplier used
  perfectStorm: boolean;
  // ... other fields
}
```

## Integration with Meter Engine

> Note on hidden state (2025-10-24): Deltas now accumulate in the hidden 5-D state exactly as applied each step (after any unluck/Perfect Storm modifications). Diminishing returns are applied only to a derived copy for scoring/visualization, not stored back into hiddenState. This keeps JourneyBreakdown math and the final "Final State" readout consistent with the sum of applied deltas.

### `updateMeterStateWithUnluck()`

Main entry point for game flow. Integrates unluck with meter updates.

```typescript
function updateMeterStateWithUnluck(
  currentState: MeterState,
  delta: Delta,
  stepId: number,
  choice: "A" | "B",
  rng: SeededRNG,
  config: MeterConfig = DEFAULT_CONFIG,
  unluckOptions: {
    forceUnluck?: boolean;
    forcePerfectStorm?: boolean;
    unluckFactorOverride?: number;
  } = {}
): MeterUpdateResult
```

**Returns:**
```typescript
interface MeterUpdateResult {
  meterState: MeterState;    // Updated meter state
  unluckResult: UnluckResult; // Unluck metadata
}
```

**RNG Call Order (critical for determinism):**
1. Unluck roll
2. Luck factor generation (if unluck)
3. Message selection
4. Perfect Storm roll (if applicable)
5. Perfect Storm message selection (if applicable)
6. Rubber-banding check
7. Meter randomness

## Configuration

### Default Config (src/lib/config.ts)

```typescript
DEFAULT_CONFIG.unluck = {
  enabled: true,
  probability: 0.1,        // 10% chance per step
  factorRange: [0.4, 0.7], // Reduce gains to 40-70%
}

DEFAULT_CONFIG.specialUnluck = {
  enabled: true,
  step: 4,                        // Viral Spike
  choice: "B",                    // AI Support Chatbot
  probability: 1.0,               // 100% if regular unluck hits
  scalingGainsReduction: 0.5,     // Additional 50% to R, S
  usersReduction: 0.5,            // 50% to U
  customersReduction: 0.7,        // 70% to C
  investorsReduction: 0.4,        // 40% to I
}
```

## Operator Controls

### Feature Flags (src/lib/feature-flags.ts)

```typescript
interface FeatureFlags {
  forceUnluck: boolean;          // Force unluck every step
  forcePerfectStorm: boolean;    // Force Perfect Storm on Step 4B
  unluckFactorOverride?: number; // Pin luck factor [0.4-0.7]
  // ... other flags
}
```

### URL Parameters

```bash
# Enable operator panel
?operator=true

# Force unluck
?forceUnluck=true

# Force Perfect Storm
?forcePerfectStorm=true

# Set specific luck factor
?unluckFactor=0.5

# Combine with fixed seed
?seed=12345&forceUnluck=true&unluckFactor=0.6
```

### Operator Panel Component

```typescript
import { OperatorPanel } from "@/components/OperatorPanel";

// In your game component
<OperatorPanel currentMeterState={runState.meterState} />
```

**Features:**
- Toggle force unluck/Perfect Storm
- Set custom seed
- Override luck factor
- Show hidden 5-D state
- Enable debug console
- Skip animations

## Usage Examples

### Basic Game Flow

```typescript
import { createRNG, updateMeterStateWithUnluck } from "@/lib/meter-engine";
import { getFeatureFlags } from "@/lib/feature-flags";
import { DEFAULT_CONFIG } from "@/lib/config";

const flags = getFeatureFlags();
const rng = createRNG(flags.fixedSeed ?? Date.now());

const result = updateMeterStateWithUnluck(
  runState.meterState,
  choice.delta,
  currentStep,
  selectedChoice,
  rng,
  DEFAULT_CONFIG,
  {
    forceUnluck: flags.forceUnluck,
    forcePerfectStorm: flags.forcePerfectStorm,
    unluckFactorOverride: flags.unluckFactorOverride,
  }
);

// Update game state
setMeterState(result.meterState);

// Show unluck popup if triggered
if (result.unluckResult.unluckApplied) {
  showUnluckPopup({
    message: result.unluckResult.message,
    isPerfectStorm: result.unluckResult.perfectStorm,
  });
}
```

### Recording Step Result

```typescript
const stepResult: StepResult = {
  stepId: currentStep,
  choice: selectedChoice,
  appliedDelta: result.meterState.lastDelta!,
  meterBefore: runState.meterState.displayValue,
  meterAfter: result.meterState.displayValue,
  tierBefore: runState.meterState.tier,
  tierAfter: result.meterState.tier,
  insights: generateInsights(result.meterState),
  unluckApplied: result.unluckResult.unluckApplied,
  luckFactor: result.unluckResult.luckFactor,
  perfectStorm: result.unluckResult.perfectStorm,
  timestamp: new Date().toISOString(),
};
```

### Testing Unluck

```typescript
// Test regular unluck
const regularResult = processUnluck(
  2, "B",
  { R: 0, U: 8, S: 0, C: 6, I: 0 },
  rng,
  DEFAULT_CONFIG,
  { forceUnluck: true }
);

expect(regularResult.result.unluckApplied).toBe(true);
expect(regularResult.result.luckFactor).toBeGreaterThanOrEqual(0.4);
expect(regularResult.result.luckFactor).toBeLessThanOrEqual(0.7);
expect(regularResult.result.perfectStorm).toBe(false);

// Test Perfect Storm
const stormResult = processUnluck(
  4, "B",
  { R: 5, U: 12, S: -3, C: 8, I: 4 },
  rng,
  DEFAULT_CONFIG,
  { forceUnluck: true, forcePerfectStorm: true }
);

expect(stormResult.result.perfectStorm).toBe(true);
```

## Utility Functions

### `formatLuckFactor()`

```typescript
function formatLuckFactor(factor: number): string
```

**Returns:** Percentage string (e.g., "55%")

### `calculateUnluckImpact()`

```typescript
function calculateUnluckImpact(
  originalDelta: Delta,
  finalDelta: Delta
): Delta
```

**Returns:** Difference delta showing how much was lost to unluck

### `getTotalPositiveGain()`

```typescript
function getTotalPositiveGain(delta: Delta): number
```

**Returns:** Sum of all positive components

## Message Reference

### Step 1 — Early Maturity

**Choice A: Subscription billing**
- "Stripe pushed a surprise API change..."
- "Billing portal worked… until compliance flagged you..."
- "Perfect timing: your payment processor went down..."

**Choice B: Investor dashboard**
- "Dashboard looked slick… then crashed five minutes before..."
- "Charts were perfect — until the data pipeline broke..."
- "Board meeting in 10 minutes. Dashboard shows: 'Database connection failed.'"

### Step 2 — First Customers

**Choice A: Landing page**
- "Your landing page looked great… until Google Ads flagged it as spam..."
- "Competitor bought your domain typo..."
- "SEO optimized perfectly… and then Google's algorithm update tanked..."

**Choice B: Onboarding emails**
- "Emails queued nicely… straight into Gmail's spam folder..."
- "AWS SES flagged your emails as 'suspicious activity...'"
- "Onboarding emails sent! All 10,000 of them… to the same test user..."

### Step 3 — Growth Stage

**Choice A: Collaboration features**
- "Collaboration worked… until an intern accidentally deleted half..."
- "Launch was hyped — but Slack went down the same day..."
- "Multi-user editing live! And now three users are fighting..."

**Choice B: Customer analytics**
- "Analytics dashboard impressed — until investors misread the churn chart..."
- "Charts worked — until a timezone bug doubled daily active users..."
- "Beautiful graphs! Too bad the SQL query was counting bots..."

### Step 4 — Viral Spike

**Choice A: Autoscale infrastructure**
- "Autoscaling kicked in — and wiped half your staging data..."
- "Traffic surge handled — but you forgot rate limits..."
- "Kubernetes autoscaled beautifully… and your AWS bill went from $200 to $20,000..."

**Choice B: AI support chatbot** ⚠️ Can trigger Perfect Storm
- "Chatbot replied honestly: 'Have you tried shutting down your company?'..."
- "Bot answered everything — then went offline mid-surge..."
- "AI support launched! First question: 'Is this company a scam?' Bot: 'Probably.'"

### Step 5 — Global Expansion

**Choice A: Multilingual support**
- "Great translations — except Japanese tagline now reads: 'Hire a Goat...'"
- "Spanish users thrilled… until accents broke the UI..."
- "Localization perfect! Except you translated 'Sign Up' as 'Give Up'..."

**Choice B: International payments**
- "Payments launched globally — then processor froze funds..."
- "Currency detection worked — until VAT compliance email landed in spam..."
- "Global payments live! Except Brazil requires 47 tax forms..."

## Perfect Storm Messages (8 variants)

- "🔥 PERFECT STORM! You thought you could skip infrastructure for an AI chatbot?"
- "💥 Everything breaks at once! No autoscaling + viral spike + AI support = disaster."
- "⚠️ Your system just imploded. Users fleeing, servers dying, investors panicking."
- "🌪️ The startup gods are ANGRY. You ignored warnings, cut corners..."
- "🔴 CRITICAL FAILURE: Chatbot offline, servers melting, customer support drowning..."
- "💣 Plot twist: Your 'move fast and break things' strategy actually broke everything."
- "🚨 SYSTEM OVERLOAD! The AI chatbot became sentient, realized your infrastructure is terrible..."
- "⛈️ You thought you could get away with this!? Time to learn why technical debt..."

## Best Practices

1. **Always use SeededRNG** for deterministic results
2. **Call unluck before rubber-banding** to maintain RNG order
3. **Record luckFactor in StepResult** for analytics
4. **Show contextual messages in UI** to enhance narrative
5. **Use operator controls for demos** to guarantee unluck triggers
6. **Test with fixed seeds** for reproducible QA
7. **Preserve negative deltas** (tradeoffs should not be reduced)

## Troubleshooting

**Unluck not triggering?**
- Check `DEFAULT_CONFIG.unluck.enabled` is `true`
- Verify probability is reasonable (default 10%)
- Use `forceUnluck: true` for testing

**Perfect Storm not triggering?**
- Must be Step 4, Choice B
- Regular unluck must trigger first
- Use `forcePerfectStorm: true` for testing

**Messages not deterministic?**
- Ensure same seed used
- Check RNG call order not changed
- Verify no external randomness

**Wrong messages showing?**
- Check stepId is 1-5 (not 0-4)
- Verify choice is "A" or "B" (uppercase)
- Ensure RNG state is correct
