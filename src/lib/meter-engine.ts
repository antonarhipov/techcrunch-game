/**
 * Scaling Meter Engine - Core calculation logic
 * Transforms multi-dimensional deltas into a single 0-100 meter value
 */

import type { Delta, MeterState, MeterConfig, SeededRNG, UnluckResult } from "@/types/game";
import { calculateTier } from "./tiers";
import { processUnluck } from "./unluck";

/**
 * Create initial meter state (hidden state at zeros, display at 50% gaining-steam tier)
 */
export function createInitialMeterState(): MeterState {
  return {
    hiddenState: {
      R: 0,
      U: 0,
      S: 0,
      C: 0,
      I: 0,
    },
    displayValue: 50,
    tier: "gaining-steam",
    streak: 0,
  };
}

/**
 * Apply a delta to the hidden state (element-wise addition)
 */
export function applyDeltaToHiddenState(state: Delta, delta: Delta): Delta {
  return {
    R: state.R + delta.R,
    U: state.U + delta.U,
    S: state.S + delta.S,
    C: state.C + delta.C,
    I: state.I + delta.I,
  };
}

/**
 * Apply diminishing returns to each dimension
 * Uses power function: value^power (e.g., value^0.9)
 * Preserves sign for negative values
 */
export function applyDiminishingReturns(state: Delta, power: number): Delta {
  const applyPower = (value: number): number => {
    if (value === 0) return 0;
    const sign = Math.sign(value);
    const absValue = Math.abs(value);
    return sign * Math.pow(absValue, power);
  };

  return {
    R: applyPower(state.R),
    U: applyPower(state.U),
    S: applyPower(state.S),
    C: applyPower(state.C),
    I: applyPower(state.I),
  };
}

/**
 * Compute weighted sum of dimensions
 */
export function computeWeightedSum(
  state: Delta,
  weights: { R: number; U: number; S: number; C: number; I: number }
): number {
  return (
    state.R * weights.R +
    state.U * weights.U +
    state.S * weights.S +
    state.C * weights.C +
    state.I * weights.I
  );
}

/**
 * Sigmoid function for normalization
 * Formula: 1 / (1 + exp(-(x - mu) / sigma))
 */
export function sigmoid(x: number, mu: number, sigma: number): number {
  return 1 / (1 + Math.exp(-(x - mu) / sigma));
}

/**
 * Normalize raw score to [0, 100] range using sigmoid
 */
export function normalizeMeter(rawScore: number, config: MeterConfig): number {
  const normalized = sigmoid(rawScore, config.sigmoid.mu, config.sigmoid.sigma);
  return normalized * 100;
}

/**
 * Apply random noise to meter value
 */
export function applyRandomness(
  value: number,
  rng: SeededRNG,
  bounds: [number, number]
): number {
  const [min, max] = bounds;
  const noise = rng.nextFloat(min, max);
  return value + noise;
}

/**
 * Clamp meter value to [0, 100] and round to 1 decimal place
 */
export function clampMeter(value: number): number {
  const clamped = Math.max(0, Math.min(100, value));
  return Math.round(clamped * 10) / 10;
}

/**
 * Update streak counter based on meter change
 */
export function updateStreak(
  oldValue: number,
  newValue: number,
  currentStreak: number
): number {
  if (newValue > oldValue) {
    return currentStreak + 1;
  }
  return 0;
}

/**
 * Apply momentum bonus if streak threshold is met
 */
export function applyMomentumBonus(
  value: number,
  streak: number,
  config: MeterConfig
): number {
  if (!config.momentum.enabled) {
    return value;
  }

  if (streak >= config.momentum.streakThreshold) {
    return value + config.momentum.bonus;
  }

  return value;
}

/**
 * Check if rubber-band mechanic should apply
 */
export function shouldApplyRubberBand(
  meterValue: number,
  config: MeterConfig
): boolean {
  return config.rubberBand.enabled && meterValue < config.rubberBand.threshold;
}

/**
 * Apply rubber-band bump to hidden state
 * Adds bump to System (S) dimension to help struggling players
 */
export function applyRubberBandBump(state: Delta, bump: number): Delta {
  return {
    ...state,
    S: state.S + bump,
  };
}

/**
 * Core meter state update function
 * Orchestrates all meter calculations
 * 
 * @param state - Current meter state
 * @param delta - Delta to apply
 * @param rng - Seeded random number generator
 * @param config - Meter configuration
 * @returns New meter state
 */
export function updateMeterState(
  state: MeterState,
  delta: Delta,
  rng: SeededRNG,
  config: MeterConfig
): MeterState {
  const oldDisplayValue = state.displayValue;

  // Step 1: Apply delta to hidden state (accumulate raw deltas)
  const accumulatedHidden = applyDeltaToHiddenState(state.hiddenState, delta);

  // Step 2: Derive effective hidden state for scoring (apply diminishing returns only for calculation)
  const effectiveHidden = config.diminishingReturns.enabled
    ? applyDiminishingReturns(accumulatedHidden, config.diminishingReturns.power)
    : accumulatedHidden;

  // Step 3: Compute weighted sum using effective hidden state
  const weightedSum = computeWeightedSum(effectiveHidden, config.weights);

  // Step 4: Normalize to [0, 100] using sigmoid
  let meterValue = normalizeMeter(weightedSum, config);

  // Step 5: Apply random noise
  if (config.randomness.enabled) {
    meterValue = applyRandomness(meterValue, rng, config.randomness.bounds);
  }

  // Step 6: Update streak
  const newStreak = updateStreak(oldDisplayValue, meterValue, state.streak);

  // Step 7: Apply momentum bonus
  meterValue = applyMomentumBonus(meterValue, newStreak, config);

  // Step 8: Clamp to [0, 100]
  const finalValue = clampMeter(meterValue);

  // Step 9: Calculate tier
  const tier = calculateTier(finalValue);

  // Step 10: Check for rubber-band (applies to NEXT step, not current)
  // This is handled by the game flow, not here

  return {
    hiddenState: accumulatedHidden,
    displayValue: finalValue,
    tier,
    lastDelta: delta,
    streak: newStreak,
  };
}

// ============================================================================
// Unluck Integration
// ============================================================================

/**
 * Result of meter update with unluck
 */
export interface MeterUpdateResult {
  meterState: MeterState;
  unluckResult: UnluckResult;
}

/**
 * Update meter state with unluck processing
 * This is the main entry point for game flow that includes unluck mechanics
 * 
 * @param state - Current meter state
 * @param delta - Original delta from choice
 * @param stepId - Current step ID (1-5)
 * @param choice - Choice made ("A" or "B")
 * @param rng - Seeded random number generator
 * @param config - Meter configuration
 * @param unluckOptions - Optional unluck overrides (for testing/operator mode)
 * @returns Updated meter state and unluck result
 */
export function updateMeterStateWithUnluck(
  state: MeterState,
  delta: Delta,
  stepId: number,
  choice: "A" | "B",
  rng: SeededRNG,
  config: MeterConfig,
  unluckOptions?: {
    forceUnluck?: boolean;
    forcePerfectStorm?: boolean;
    unluckFactorOverride?: number;
  }
): MeterUpdateResult {
  // Step 1: Process unluck (may modify delta)
  const { finalDelta, result: unluckResult } = processUnluck(
    stepId,
    choice,
    delta,
    rng,
    config,
    unluckOptions
  );

  // Step 2: Update meter with (possibly modified) delta
  const newMeterState = updateMeterState(state, finalDelta, rng, config);

  return {
    meterState: newMeterState,
    unluckResult,
  };
}

