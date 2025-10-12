/**
 * Game Flow Integration - Orchestrates step progression and game mechanics
 */

import type {
  RunState,
  StepResult,
  ContentPack,
  Delta,
  MeterState,
  FeatureFlags,
} from "@/types/game";
import { updateMeterStateWithUnluck } from "./meter-engine";
import { createRNG } from "./rng";
import { DEFAULT_CONFIG } from "./config";
import { generateInsights } from "./insights";

/**
 * Result of processing a step choice
 */
export interface StepProgressionResult {
  /** New meter state after choice */
  newMeterState: MeterState;
  /** Step result metadata */
  stepResult: StepResult;
  /** Whether the game is complete (all 5 steps done) */
  isGameComplete: boolean;
}

/**
 * Process a player's choice for a step
 * Orchestrates: unluck processing, meter update, insights generation
 * 
 * @param runState - Current run state
 * @param choice - Choice made ("A" or "B")
 * @param contentPack - Content pack being used
 * @param featureFlags - Feature flags for testing/operator mode
 * @returns Step progression result with new state
 */
export function processStepChoice(
  runState: RunState,
  choice: "A" | "B",
  contentPack: ContentPack,
  featureFlags: FeatureFlags
): StepProgressionResult {
  const currentStepId = runState.currentStep;
  
  // Get current step from content pack
  const step = contentPack.steps.find(s => s.id === currentStepId);
  if (!step) {
    throw new Error(`Step ${currentStepId} not found in content pack`);
  }

  // Get delta for chosen option
  const chosenOption = choice === "A" ? step.optionA : step.optionB;
  const originalDelta: Delta = { ...chosenOption.delta };

  // Create RNG from seed
  const rng = createRNG(runState.seed);
  
  // Fast-forward RNG to current state
  // We need to replay all previous random calls to maintain determinism
  for (const prevResult of runState.stepHistory) {
    // Replay RNG calls from unluck processing for this step
    replayUnluckRNGCalls(prevResult, rng);
  }

  // Store meter state before update
  const meterBefore = runState.meterState.displayValue;
  const tierBefore = runState.meterState.tier;

  // Process unluck and update meter
  const { meterState: newMeterState, unluckResult } = updateMeterStateWithUnluck(
    runState.meterState,
    originalDelta,
    currentStepId,
    choice,
    rng,
    DEFAULT_CONFIG,
    {
      forceUnluck: featureFlags.forceUnluck,
      forcePerfectStorm: featureFlags.forcePerfectStorm,
      unluckFactorOverride: featureFlags.unluckFactorOverride,
    }
  );

  // Generate insights
  const insights = generateInsights(newMeterState);

  // Create step result
  const stepResult: StepResult = {
    stepId: currentStepId,
    choice,
    appliedDelta: newMeterState.lastDelta || originalDelta,
    meterBefore,
    meterAfter: newMeterState.displayValue,
    tierBefore,
    tierAfter: newMeterState.tier,
    insights,
    unluckApplied: unluckResult.unluckApplied,
    luckFactor: unluckResult.luckFactor,
    perfectStorm: unluckResult.perfectStorm,
    timestamp: new Date().toISOString(),
  };

  // Check if game is complete
  const isGameComplete = currentStepId === 5;

  return {
    newMeterState,
    stepResult,
    isGameComplete,
  };
}

/**
 * Replay RNG calls from a previous step result to maintain determinism
 * This ensures the RNG state is consistent when processing each step
 */
function replayUnluckRNGCalls(stepResult: StepResult, rng: ReturnType<typeof createRNG>): void {
  // Replay unluck processing RNG calls
  // Order: 1) unluck roll, 2) luck factor, 3) message selection
  
  if (stepResult.unluckApplied) {
    // 1. Unluck roll (1 call)
    rng.next();
    
    // 2. Luck factor (1 call)
    rng.nextFloat(0.4, 0.7);
    
    // 3. Message selection (1 call for nextInt)
    rng.nextInt(0, 2); // Approximate - actual depends on message count
    
    // 4. If Perfect Storm, replay those calls too
    if (stepResult.perfectStorm) {
      rng.next(); // Perfect Storm roll
      rng.nextInt(0, 7); // Perfect Storm message selection
    }
  } else {
    // Still need to consume the unluck roll even if not applied
    rng.next();
  }
  
  // Replay meter engine randomness (if enabled)
  // This is one call to nextFloat for random noise
  rng.nextFloat(-5, 5);
}

/**
 * Prepare next step ID
 * Returns the next step number (2-5) or 0 if game is complete
 */
export function prepareNextStep(runState: RunState): number {
  if (runState.currentStep >= 5) {
    return 0; // Game complete
  }
  return runState.currentStep + 1;
}

