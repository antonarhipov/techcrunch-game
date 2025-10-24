/**
 * Configuration system for the scaling meter engine
 * Contains default tuning parameters for all game mechanics
 */

import type { MeterConfig } from "@/types/game";

/**
 * Default configuration for the scaling meter engine
 * These values have been tuned for balanced gameplay
 */
export const DEFAULT_CONFIG: MeterConfig = {
  // Dimension weights for weighted sum calculation
  // Total: 1.00 (Revenue is most important, Investors least)
  weights: {
    R: 0.30, // Revenue - 30%
    U: 0.25, // Users - 25%
    S: 0.20, // System - 20%
    C: 0.15, // Customers - 15%
    I: 0.10, // Investors - 10%
  },

  // Sigmoid normalization parameters
  // Maps weighted sum to [0, 100] range with S-curve
  sigmoid: {
    mu: -4,      // Midpoint of sigmoid (shift)
    sigma: 11,   // Steepness of sigmoid (scale)
  },

  // Momentum bonus for consecutive gains
  momentum: {
    enabled: true,
    bonus: 3,           // +3 points per streak
    streakThreshold: 2, // Bonus applies after 2+ consecutive gains
  },

  // Random noise to add variation
  randomness: {
    enabled: true,
    bounds: [-2, 5], // Random value in [-2, +5] range
  },

  // Diminishing returns on high dimension values
  diminishingReturns: {
    enabled: true,
    power: 0.9, // Apply value^0.9 to each dimension
  },

  // Rubber-band mechanic to help struggling players
  rubberBand: {
    enabled: true,
    threshold: 30, // Trigger when meter < 30
    bump: 2,       // Add +2 to System dimension
  },

  // Regular unluck system (10% chance)
  unluck: {
    enabled: true,
    probability: 0.10,           // 10% chance per step
    factorRange: [0.4, 0.7],     // Scale positive gains by 40-70%
  },

  // Perfect Storm special unluck (Step 4, Option B only)
  specialUnluck: {
    enabled: true,
    step: 4,              // Triggers on Step 4
    choice: "B",          // Only on Option B
    probability: 1.0,     // 100% chance if conditions met
    scalingGainsReduction: 0.5,  // 50% additional reduction to R (Revenue)
    usersReduction: 0.5,         // 50% reduction to U (both positive and negative)
    customersReduction: 0.7,     // 70% reduction to C (both positive and negative)
    investorsReduction: 0.4,     // 40% reduction to I (both positive and negative)
  },
};

/**
 * Deep clone a config object
 * Useful for creating modified configs without mutating the default
 */
export function cloneConfig(config: MeterConfig): MeterConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Merge partial config overrides with default config
 * @param overrides - Partial config to merge
 * @returns Complete config with overrides applied
 */
export function mergeConfig(
  overrides: Partial<MeterConfig>
): MeterConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    weights: { ...DEFAULT_CONFIG.weights, ...overrides.weights },
    sigmoid: { ...DEFAULT_CONFIG.sigmoid, ...overrides.sigmoid },
    momentum: { ...DEFAULT_CONFIG.momentum, ...overrides.momentum },
    randomness: { ...DEFAULT_CONFIG.randomness, ...overrides.randomness },
    diminishingReturns: {
      ...DEFAULT_CONFIG.diminishingReturns,
      ...overrides.diminishingReturns,
    },
    rubberBand: { ...DEFAULT_CONFIG.rubberBand, ...overrides.rubberBand },
    unluck: { ...DEFAULT_CONFIG.unluck, ...overrides.unluck },
    specialUnluck: {
      ...DEFAULT_CONFIG.specialUnluck,
      ...overrides.specialUnluck,
    },
  };
}

/**
 * Validate that a config object has valid values
 * @param config - Config to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateConfig(config: MeterConfig): string[] {
  const errors: string[] = [];

  // Validate weights sum to approximately 1.0 (allow small floating point errors)
  const weightSum = Object.values(config.weights).reduce((a, b) => a + b, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    errors.push(
      `Weights must sum to 1.0 (got ${weightSum.toFixed(3)})`
    );
  }

  // Validate weight values are positive
  for (const [key, value] of Object.entries(config.weights)) {
    if (value < 0) {
      errors.push(`Weight ${key} must be non-negative (got ${value})`);
    }
  }

  // Validate momentum bonus is reasonable
  if (config.momentum.bonus < 0 || config.momentum.bonus > 10) {
    errors.push(
      `Momentum bonus should be in [0, 10] range (got ${config.momentum.bonus})`
    );
  }

  // Validate unluck probability is in [0, 1]
  if (
    config.unluck.probability < 0 ||
    config.unluck.probability > 1
  ) {
    errors.push(
      `Unluck probability must be in [0, 1] range (got ${config.unluck.probability})`
    );
  }

  // Validate luck factor range
  const [minFactor, maxFactor] = config.unluck.factorRange;
  if (minFactor < 0 || minFactor > 1 || maxFactor < 0 || maxFactor > 1) {
    errors.push(
      `Unluck factor range must be in [0, 1] (got [${minFactor}, ${maxFactor}])`
    );
  }
  if (minFactor >= maxFactor) {
    errors.push(
      `Unluck factor min must be < max (got [${minFactor}, ${maxFactor}])`
    );
  }

  return errors;
}

