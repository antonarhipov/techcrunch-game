/**
 * Core type definitions for the Choose Your Own Startup Adventure game
 */

// ============================================================================
// Delta and Basic Game Types
// ============================================================================

/**
 * Represents changes to the five hidden dimensions of the scaling meter
 * R = Revenue, U = Users, S = System, C = Customers, I = Investors
 * Valid range: [-10, +15]
 */
export interface Delta {
  R: number;
  U: number;
  S: number;
  C: number;
  I: number;
}

/**
 * A single choice option within a step
 */
export interface Choice {
  /** Short label for the choice (≤200 chars) */
  label: string;
  /** Detailed description of the choice (≤1000 chars) */
  body: string;
  /** Impact on hidden dimensions */
  delta: Delta;
}

/**
 * A single decision step in the game
 */
export interface Step {
  /** Step ID (1-5) */
  id: number;
  /** Step title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** The scenario description */
  scenario: string;
  /** First choice option */
  optionA: Choice;
  /** Second choice option */
  optionB: Choice;
  /** Optional asset URLs (images, videos, etc.) */
  assets?: string[];
}

/**
 * A complete content pack containing all game steps
 */
export interface ContentPack {
  /** Unique identifier */
  id: string;
  /** Semantic version (X.Y.Z) */
  version: string;
  /** Display title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional author */
  author?: string;
  /** Exactly 5 steps with sequential IDs 1-5 */
  steps: Step[];
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Meter System Types
// ============================================================================

/**
 * Scaling meter tier levels
 */
export type MeterTier =
  | "crash"          // 0-29
  | "finding-fit"    // 30-49
  | "gaining-steam"  // 50-69
  | "scaling-up"     // 70-84
  | "breakout";      // 85-100

/**
 * Current state of the scaling meter
 */
export interface MeterState {
  /** Hidden multi-dimensional state (R, U, S, C, I) */
  hiddenState: Delta;
  /** Visible meter value (0-100) */
  displayValue: number;
  /** Current tier */
  tier: MeterTier;
  /** Last applied delta (for display purposes) */
  lastDelta?: Delta;
  /** Consecutive gains streak count */
  streak: number;
}

/**
 * Configuration for the scaling meter engine
 */
export interface MeterConfig {
  /** Weights for each dimension */
  weights: {
    R: number;
    U: number;
    S: number;
    C: number;
    I: number;
  };
  /** Sigmoid normalization parameters */
  sigmoid: {
    mu: number;
    sigma: number;
  };
  /** Momentum/streak bonus */
  momentum: {
    enabled: boolean;
    bonus: number;
    streakThreshold: number;
  };
  /** Random noise bounds */
  randomness: {
    enabled: boolean;
    bounds: [number, number];
  };
  /** Diminishing returns */
  diminishingReturns: {
    enabled: boolean;
    power: number;
  };
  /** Rubber-band mechanic */
  rubberBand: {
    enabled: boolean;
    threshold: number;
    bump: number;
  };
  /** Regular unluck */
  unluck: {
    enabled: boolean;
    probability: number;
    factorRange: [number, number];
  };
  /** Perfect Storm special unluck */
  specialUnluck: {
    enabled: boolean;
    step: number;
    choice: "A" | "B";
    probability: number;
    scalingGainsReduction: number;
    usersReduction: number;
    customersReduction: number;
    investorsReduction: number;
  };
}

// ============================================================================
// Unluck System Types
// ============================================================================

/**
 * Result of unluck processing
 */
export interface UnluckResult {
  /** Whether unluck was applied */
  unluckApplied: boolean;
  /** Luck factor (0.4-0.7 for unluck, 1.0 for no unluck) */
  luckFactor: number;
  /** Contextual message for the player */
  message: string | null;
  /** Whether Perfect Storm was triggered */
  perfectStorm: boolean;
}

// ============================================================================
// Game State Types
// ============================================================================

/**
 * Result of completing a single step
 */
export interface StepResult {
  /** Step ID (1-5) */
  stepId: number;
  /** Choice made ("A" or "B") */
  choice: "A" | "B";
  /** Delta that was applied (after unluck modifications) */
  appliedDelta: Delta;
  /** Meter value before this step */
  meterBefore: number;
  /** Meter value after this step */
  meterAfter: number;
  /** Tier before this step */
  tierBefore: MeterTier;
  /** Tier after this step */
  tierAfter: MeterTier;
  /** Generated insights for this step */
  insights: string[];
  /** Whether unluck was applied */
  unluckApplied: boolean;
  /** Luck factor if unluck was applied */
  luckFactor?: number;
  /** Whether Perfect Storm was triggered */
  perfectStorm: boolean;
  /** ISO timestamp */
  timestamp: string;
}

/**
 * Complete state of a game run
 */
export interface RunState {
  /** Random seed for this run */
  seed: number;
  /** Current step number (1-5) */
  currentStep: number;
  /** Current meter state */
  meterState: MeterState;
  /** History of completed steps */
  stepHistory: StepResult[];
  /** Run start time (ISO timestamp) */
  startTime: string;
  /** Run end time (ISO timestamp, undefined if not complete) */
  endTime?: string;
  /** Content pack ID used for this run */
  contentPackId: string;
}

// ============================================================================
// RNG Types
// ============================================================================

/**
 * Seeded random number generator interface
 */
export interface SeededRNG {
  /** Generate random float in [0, 1) */
  next(): number;
  /** Generate random integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number;
  /** Generate random float in [min, max] */
  nextFloat(min: number, max: number): number;
  /** Reset RNG with new seed */
  reset(seed: number): void;
  /** Get current internal state */
  getState(): number;
}

// ============================================================================
// Feature Flags Types
// ============================================================================

/**
 * Feature flags for testing and operator mode
 */
export interface FeatureFlags {
  /** Fixed seed for deterministic testing */
  fixedSeed?: number;
  /** Force unluck to trigger on every step */
  forceUnluck: boolean;
  /** Force Perfect Storm to trigger */
  forcePerfectStorm: boolean;
  /** Override unluck factor (0.4-0.7) */
  unluckFactorOverride?: number;
  /** Show hidden state values in UI */
  showHiddenState: boolean;
  /** Enable debug console logging */
  enableDebugConsole: boolean;
  /** Skip animations and videos */
  skipAnimations: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** Path to the invalid field */
  path: string;
  /** Error code */
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Log entry for Junie Console
 */
export interface LogEntry {
  /** Log type */
  type: "info" | "success" | "warning" | "error";
  /** Log text */
  text: string;
  /** Optional timestamp */
  timestamp?: string;
  /** Optional code diff */
  codeDiff?: string;
}

/**
 * Console script for a step/choice combination
 */
export interface ConsoleScript {
  /** List of log entries */
  logs: LogEntry[];
  /** Total duration in milliseconds */
  totalDuration: number;
}

/**
 * Ending data for final screen
 */
export interface EndingData {
  /** Ending tier name */
  tier: string;
  /** Tier emoji */
  emoji: string;
  /** Ending title */
  title: string;
  /** Ending description */
  description: string;
  /** Top 2 positive drivers */
  topDrivers: string[];
  /** Main bottleneck */
  bottleneck: string;
  /** Next step suggestion */
  nextStepSuggestion: string;
}

/**
 * Tier configuration for display
 */
export interface TierConfig {
  /** Tier label */
  label: string;
  /** Tier emoji */
  emoji: string;
  /** Tier description */
  description: string;
  /** Minimum meter value */
  min: number;
  /** Maximum meter value */
  max: number;
}

