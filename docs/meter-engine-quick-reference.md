# Meter Engine Quick Reference

## Quick Start

```typescript
import { createRNG, createInitialMeterState, updateMeterState } from "@/lib/meter-engine";
import { DEFAULT_CONFIG } from "@/lib/config";
import type { Delta } from "@/types/game";

// 1. Initialize
const rng = createRNG(12345); // Use seed from RunState
let meter = createInitialMeterState();

// 2. Apply choice
const delta: Delta = { R: 8, U: 10, S: 5, C: 6, I: 7 };
meter = updateMeterState(meter, delta, rng, DEFAULT_CONFIG);

// 3. Read results
console.log(meter.displayValue); // 45.2
console.log(meter.tier);         // "finding-fit"
console.log(meter.streak);       // 1
```

## Core Functions

### `updateMeterState(state, delta, rng, config)`
**Main entry point** - Updates meter with new choice delta

**Parameters:**
- `state: MeterState` - Current meter state
- `delta: Delta` - Choice impact vector
- `rng: SeededRNG` - Random number generator
- `config: MeterConfig` - Configuration (use `DEFAULT_CONFIG`)

**Returns:** `MeterState` - Updated state

### `createRNG(seed)`
Creates seeded random number generator

**Parameters:**
- `seed: number` - RNG seed for reproducibility

**Returns:** `SeededRNG` instance

### `createInitialMeterState()`
Creates starting meter state (all zeros)

**Returns:** `MeterState` with displayValue=0, tier="crash"

## Data Structures

### Delta (5-D Impact Vector)
```typescript
interface Delta {
  R: number; // Revenue Momentum [-10 to +15]
  U: number; // User Growth [-10 to +15]
  S: number; // System Reliability [-10 to +15]
  C: number; // Customer Love [-10 to +15]
  I: number; // Investor Confidence [-10 to +15]
}
```

### MeterState
```typescript
interface MeterState {
  hiddenState: Delta;      // The 5-D state
  displayValue: number;    // Computed meter [0-100]
  tier: MeterTier;         // Visual tier
  lastDelta?: Delta;       // Most recent delta applied
  streak: number;          // Consecutive gains count
}
```

### MeterTier
```typescript
type MeterTier =
  | "crash"          // 0-29
  | "finding-fit"    // 30-49
  | "gaining-steam"  // 50-69
  | "scaling-up"     // 70-84
  | "breakout";      // 85-100
```

## Computation Pipeline

```
Delta → Hidden State → Weighted Sum → Sigmoid → Randomness → Momentum → Clamp [0,100]
  ↓
  Apply to 5-D state with diminishing returns (R^0.9)
                    ↓
                    Sum with weights: R×0.3 + U×0.25 + S×0.2 + C×0.15 + I×0.1
                                ↓
                                Normalize: 100 / (1 + exp(-(x - μ) / σ))
                                            ↓
                                            Add noise: ±5 random
                                                    ↓
                                                    Add bonus: +3 if streak ≥ 2
                                                            ↓
                                                            Clamp to [0, 100]
```

## Game Mechanics

### Momentum Bonus
- Tracks consecutive steps with gains
- +3 bonus when streak ≥ 2
- Resets to 0 on no gain

### Diminishing Returns
- Applies R^0.9 to each dimension
- Prevents runaway values
- Early gains > late gains

### Rubber-Banding
- Activates when meter < 30
- Adds +2 to System dimension next step
- Prevents death spirals

### Randomness
- Tight bounds: ±5 (< 10% impact)
- Seeded for reproducibility
- Preserves player agency

## Configuration

```typescript
// In src/lib/config.ts
export const DEFAULT_CONFIG: MeterConfig = {
  weights: { R: 0.3, U: 0.25, S: 0.2, C: 0.15, I: 0.1 },
  sigmoid: { mu: -4, sigma: 11 },
  momentum: { enabled: true, bonus: 3 },
  randomness: { enabled: true, bounds: [-5, 5] },
  diminishingReturns: { enabled: true, power: 0.9 },
  rubberBand: { enabled: true, threshold: 30, bump: 2 },
  unluck: { ... }, // Phase 2
  specialUnluck: { ... } // Phase 2
};
```

## Utility Functions

```typescript
// Formatting
formatMeter(value: number): string // "45.2"

// Validation
validateDelta(delta: Delta): boolean // Check [-10, +15] bounds

// Tier lookup
getTierConfig(tier: MeterTier): TierConfig

// Analysis
getTopDimension(state: Delta): keyof Delta      // Highest dimension
getBottleneckDimension(state: Delta): keyof Delta // Lowest dimension
```

## Seeded RNG API

```typescript
const rng = new SeededRNG(seed);

rng.next();                    // Random float [0, 1)
rng.nextInt(1, 10);           // Random int [1, 10]
rng.nextFloat(-5, 5);         // Random float [-5, 5]
rng.reset(seed);              // Reset to specific seed
rng.getState();               // Get current internal state
```

## Common Patterns

### In Game Component
```typescript
const { runState, recordStepResult } = useGame();

// Player makes choice
const handleChoice = (choice: "A" | "B") => {
  const delta = step[`option${choice}`].delta;
  const rng = createRNG(runState.seed);
  
  const newMeter = updateMeterState(
    runState.meterState,
    delta,
    rng,
    DEFAULT_CONFIG
  );
  
  const result: StepResult = {
    stepId: runState.currentStep,
    choice,
    appliedDelta: delta,
    meterBefore: runState.meterState.displayValue,
    meterAfter: newMeter.displayValue,
    tierBefore: runState.meterState.tier,
    tierAfter: newMeter.tier,
    insights: generateInsights(delta, newMeter),
    unluckApplied: false,
    perfectStorm: false,
    timestamp: new Date().toISOString(),
  };
  
  recordStepResult(result, newMeter);
};
```

### Testing with Fixed Seed
```typescript
// URL: ?seed=12345
const flags = getFeatureFlags();
const seed = flags.fixedSeed ?? Date.now();
const rng = createRNG(seed);
```

### Simulation Mode
```typescript
// Run through multiple paths
const seeds = [100, 200, 300];
const paths = [
  [deltaA1, deltaA2, deltaA3, deltaA4, deltaA5],
  [deltaB1, deltaB2, deltaB3, deltaB4, deltaB5],
];

seeds.forEach(seed => {
  paths.forEach(path => {
    const rng = createRNG(seed);
    let meter = createInitialMeterState();
    
    path.forEach(delta => {
      meter = updateMeterState(meter, delta, rng, DEFAULT_CONFIG);
    });
    
    console.log(`Seed ${seed}: Final meter = ${meter.displayValue}`);
  });
});
```

## Debugging

### Show Hidden State
```typescript
// URL: ?showState=true
const flags = getFeatureFlags();
if (flags.showHiddenState) {
  console.log("Hidden State:", meter.hiddenState);
  console.log("Weighted Sum:", computeWeightedSum(meter.hiddenState));
}
```

### Force Specific Seed
```typescript
// URL: ?seed=12345&dev=true
// Or localStorage: { fixedSeed: 12345 }
```

### Skip Randomness
```typescript
const testConfig = {
  ...DEFAULT_CONFIG,
  randomness: { enabled: false, bounds: [0, 0] }
};
```

## Performance Notes

- **O(1)** computation per update
- **Pure functions** - no side effects
- **No allocations** in hot paths
- **Type-safe** - full TypeScript

## Integration Points

- **GameContext**: `src/contexts/GameContext.tsx` - Manages RunState
- **Types**: `src/types/game.ts` - All type definitions
- **Config**: `src/lib/config.ts` - Tunable parameters
- **Feature Flags**: `src/lib/feature-flags.ts` - Runtime toggles

## Examples

See `src/lib/meter-engine.example.ts` for:
- Basic flow through 5 steps
- Rubber-banding demonstration
- Momentum building
- Diminishing returns effect
- Seeded RNG reproducibility

Run examples:
```bash
npx tsx src/lib/meter-engine.example.ts
```

## Phase Status

**Phase 1: ✅ COMPLETE**
- Tasks 6-10 implemented
- All TypeScript types valid
- Build successful

**Phase 2: 🔜 NEXT**
- Task 11: Unluck roll
- Task 12: Perfect Storm
- Task 13: Operator controls
