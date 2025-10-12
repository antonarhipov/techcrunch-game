/**
 * Integration Tests for Complete Game Flow
 * Tasks 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.2.6, 10.2.7
 */

import { createRNG } from "@/lib/rng";
import { createInitialMeterState, updateMeterStateWithUnluck } from "@/lib/meter-engine";
import { DEFAULT_CONTENT_PACK } from "@/lib/default-pack";
import { DEFAULT_CONFIG } from "@/lib/config";
import { calculateEnding } from "@/lib/endings";
import { processUnluck } from "@/lib/unluck";
import type { MeterState, RunState, StepResult } from "@/types/game";

describe("Game Flow Integration Tests", () => {
  describe("Complete Game Flow - 5 Steps AAAAA Path (Task 10.2.1, 10.2.2)", () => {
    it("should complete a full game with all A choices", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();
      const stepHistory: StepResult[] = [];

      // Play through all 5 steps with A choices
      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) {
          throw new Error(`Step ${i + 1} not found`);
        }

        const delta = step.optionA.delta;
        const result = updateMeterStateWithUnluck(
          meterState,
          delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;

        stepHistory.push({
          stepId: step.id,
          choiceMade: "A",
          timestamp: new Date().toISOString(),
          deltasApplied: delta,
          unluckTriggered: result.unluckResult.unluckApplied,
          unluckFactor: result.unluckResult.unluckApplied ? result.unluckResult.luckFactor : undefined,
          perfectStorm: result.unluckResult.perfectStorm,
        });
      }

      // Verify we completed all 5 steps
      expect(stepHistory).toHaveLength(5);
      expect(stepHistory.every((s) => s.choiceMade === "A")).toBe(true);

      // Verify meter is at a reasonable value
      expect(meterState.displayValue).toBeGreaterThan(0);
      expect(meterState.displayValue).toBeLessThanOrEqual(100);

      // Verify ending can be calculated
      const ending = calculateEnding(meterState.displayValue, meterState.hiddenState);
      expect(ending).toBeDefined();
      expect(ending.tier).toBeDefined();
      expect(ending.title).toBeTruthy();
      expect(ending.description).toBeTruthy();
    });

    it("should maintain state consistency after each step", () => {
      const seed = 54321;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();
      let previousValue = 0;

      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) {
          throw new Error(`Step ${i + 1} not found`);
        }

        const delta = step.optionA.delta;
        const result = updateMeterStateWithUnluck(
          meterState,
          delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;

        // Verify state is valid
        expect(meterState.displayValue).toBeGreaterThanOrEqual(0);
        expect(meterState.displayValue).toBeLessThanOrEqual(100);
        expect(meterState.hiddenState).toBeDefined();
        expect(meterState.tier).toBeDefined();
        expect(meterState.lastDelta).toEqual(result.unluckResult.unluckApplied ? 
          expect.anything() : delta);

        // Track if meter increased
        if (meterState.displayValue > previousValue) {
          expect(meterState.streak).toBeGreaterThan(0);
        }
        previousValue = meterState.displayValue;
      }
    });

    it("should be deterministic with same seed", () => {
      const seed = 99999;

      // Run 1
      const rng1 = createRNG(seed);
      let state1 = createInitialMeterState();
      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;
        const result = updateMeterStateWithUnluck(
          state1,
          step.optionA.delta,
          step.id,
          "A",
          rng1,
          DEFAULT_CONFIG
        );
        state1 = result.meterState;
      }

      // Run 2 with same seed
      const rng2 = createRNG(seed);
      let state2 = createInitialMeterState();
      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;
        const result = updateMeterStateWithUnluck(
          state2,
          step.optionA.delta,
          step.id,
          "A",
          rng2,
          DEFAULT_CONFIG
        );
        state2 = result.meterState;
      }

      // Results should be identical
      expect(state1.displayValue).toBe(state2.displayValue);
      expect(state1.hiddenState).toEqual(state2.hiddenState);
      expect(state1.tier).toBe(state2.tier);
      expect(state1.streak).toBe(state2.streak);
    });
  });

  describe("Unluck Triggering (Task 10.2.3)", () => {
    it("should trigger unluck when forced", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();
      let unluckCount = 0;

      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG,
          { forceUnluck: true }
        );

        meterState = result.meterState;

        if (result.unluckResult.unluckApplied) {
          unluckCount++;
          expect(result.unluckResult.luckFactor).toBeGreaterThan(0);
          expect(result.unluckResult.luckFactor).toBeLessThan(1);
          expect(result.unluckResult.message).toBeTruthy();
        }
      }

      // With forceUnluck, all steps should trigger unluck
      expect(unluckCount).toBe(5);
    });

    it("should reduce meter value when unluck is applied", () => {
      const seed = 12345;
      const step = DEFAULT_CONTENT_PACK.steps[0];
      if (!step) throw new Error("Step 1 not found");

      // Without unluck
      const rng1 = createRNG(seed);
      const state1 = createInitialMeterState();
      const result1 = updateMeterStateWithUnluck(
        state1,
        step.optionA.delta,
        step.id,
        "A",
        rng1,
        DEFAULT_CONFIG,
        { forceUnluck: false }
      );

      // With unluck
      const rng2 = createRNG(seed);
      const state2 = createInitialMeterState();
      const result2 = updateMeterStateWithUnluck(
        state2,
        step.optionA.delta,
        step.id,
        "A",
        rng2,
        DEFAULT_CONFIG,
        { forceUnluck: true, unluckFactorOverride: 0.5 }
      );

      // Unluck should reduce the meter
      expect(result2.meterState.displayValue).toBeLessThan(result1.meterState.displayValue);
    });

    it("should use custom unluck factor when provided", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      const state = createInitialMeterState();
      const step = DEFAULT_CONTENT_PACK.steps[0];
      if (!step) throw new Error("Step 1 not found");

      const result = updateMeterStateWithUnluck(
        state,
        step.optionA.delta,
        step.id,
        "A",
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, unluckFactorOverride: 0.3 }
      );

      expect(result.unluckResult.unluckApplied).toBe(true);
      expect(result.unluckResult.luckFactor).toBe(0.3);
    });
  });

  describe("Perfect Storm (Task 10.2.4)", () => {
    it("should trigger Perfect Storm on Step 4B with unluck", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();

      // Play through steps 1-3 with A choices
      for (let i = 0; i < 3; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;
      }

      // Step 4 with B choice and forced Perfect Storm
      const step4 = DEFAULT_CONTENT_PACK.steps[3];
      if (!step4) throw new Error("Step 4 not found");

      const result = updateMeterStateWithUnluck(
        meterState,
        step4.optionB.delta,
        step4.id,
        "B",
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, forcePerfectStorm: true }
      );

      expect(result.unluckResult.unluckApplied).toBe(true);
      expect(result.unluckResult.perfectStorm).toBe(true);
      expect(result.unluckResult.message).toContain("PERFECT STORM");
      expect(result.unluckResult.message).toContain("💥");
    });

    it("should NOT trigger Perfect Storm on Step 4A", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();

      // Play through steps 1-3
      for (let i = 0; i < 3; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;
      }

      // Step 4 with A choice (should NOT trigger Perfect Storm)
      const step4 = DEFAULT_CONTENT_PACK.steps[3];
      if (!step4) throw new Error("Step 4 not found");

      const result = updateMeterStateWithUnluck(
        meterState,
        step4.optionA.delta,
        step4.id,
        "A",
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, forcePerfectStorm: true }
      );

      expect(result.unluckResult.perfectStorm).toBe(false);
    });

    it("should apply additional penalties during Perfect Storm", () => {
      const seed = 12345;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();

      // Build up meter with steps 1-3
      for (let i = 0; i < 3; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );
        meterState = result.meterState;
      }

      // Trigger Perfect Storm on Step 4B
      const step4 = DEFAULT_CONTENT_PACK.steps[3];
      if (!step4) throw new Error("Step 4 not found");

      const result = updateMeterStateWithUnluck(
        meterState,
        step4.optionB.delta,
        step4.id,
        "B",
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, forcePerfectStorm: true }
      );

      // Perfect Storm should be applied
      expect(result.unluckResult.perfectStorm).toBe(true);
      expect(result.unluckResult.message).toContain("PERFECT STORM");
      
      // Meter should still be valid after Perfect Storm
      expect(result.meterState.displayValue).toBeGreaterThanOrEqual(0);
      expect(result.meterState.displayValue).toBeLessThanOrEqual(100);
    });
  });

  describe("Content Pack Loading (Task 10.2.6)", () => {
    it("should validate default content pack structure", () => {
      expect(DEFAULT_CONTENT_PACK).toBeDefined();
      expect(DEFAULT_CONTENT_PACK.id).toBe("ai-cofounder-v1");
      expect(DEFAULT_CONTENT_PACK.version).toBe("1.0.0");
      expect(DEFAULT_CONTENT_PACK.steps).toHaveLength(5);

      // Verify each step has required structure
      for (const step of DEFAULT_CONTENT_PACK.steps) {
        expect(step.id).toBeGreaterThan(0);
        expect(step.id).toBeLessThanOrEqual(5);
        expect(step.title).toBeTruthy();
        expect(step.scenario).toBeTruthy();
        expect(step.optionA).toBeDefined();
        expect(step.optionB).toBeDefined();

        // Verify options have required fields
        expect(step.optionA.label).toBeTruthy();
        expect(step.optionA.body).toBeTruthy();
        expect(step.optionA.delta).toBeDefined();
        expect(step.optionB.label).toBeTruthy();
        expect(step.optionB.body).toBeTruthy();
        expect(step.optionB.delta).toBeDefined();

        // Verify deltas are in valid range
        for (const dim of ["R", "U", "S", "C", "I"] as const) {
          expect(step.optionA.delta[dim]).toBeGreaterThanOrEqual(-10);
          expect(step.optionA.delta[dim]).toBeLessThanOrEqual(15);
          expect(step.optionB.delta[dim]).toBeGreaterThanOrEqual(-10);
          expect(step.optionB.delta[dim]).toBeLessThanOrEqual(15);
        }
      }
    });

    it("should have sequential step IDs", () => {
      const steps = DEFAULT_CONTENT_PACK.steps;
      for (let i = 0; i < steps.length; i++) {
        expect(steps[i]?.id).toBe(i + 1);
      }
    });
  });

  describe("Replay Flow (Task 10.2.7)", () => {
    it("should be able to replay the same game with same seed", () => {
      const seed = 777777;
      const choices: ("A" | "B")[] = ["A", "B", "A", "B", "A"];

      // Play game twice with same seed and choices
      const results: number[] = [];

      for (let playthrough = 0; playthrough < 2; playthrough++) {
        const rng = createRNG(seed);
        let meterState = createInitialMeterState();

        for (let i = 0; i < 5; i++) {
          const step = DEFAULT_CONTENT_PACK.steps[i];
          if (!step) continue;

          const choice = choices[i];
          const delta = choice === "A" ? step.optionA.delta : step.optionB.delta;

          const result = updateMeterStateWithUnluck(
            meterState,
            delta,
            step.id,
            choice!,
            rng,
            DEFAULT_CONFIG
          );

          meterState = result.meterState;
        }

        results.push(meterState.displayValue);
      }

      // Both playthroughs should produce identical results
      expect(results[0]).toBe(results[1]);
    });

    it("should be able to continue from saved state", () => {
      const seed = 888888;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();
      const stepHistory: StepResult[] = [];

      // Play through first 3 steps
      for (let i = 0; i < 3; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;
        stepHistory.push({
          stepId: step.id,
          choiceMade: "A",
          timestamp: new Date().toISOString(),
          deltasApplied: step.optionA.delta,
          unluckTriggered: result.unluckResult.unluckApplied,
        });
      }

      // Save state
      const savedMeterState = JSON.parse(JSON.stringify(meterState));
      const savedHistory = JSON.parse(JSON.stringify(stepHistory));
      const savedRngState = rng.getState();

      // Continue from saved state
      const resumedRng = createRNG(0); // Dummy seed
      resumedRng.reset(seed); // Reset to same seed
      // Advance RNG to same state by playing through saved steps
      for (let i = 0; i < 3; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;
        updateMeterStateWithUnluck(
          createInitialMeterState(),
          step.optionA.delta,
          step.id,
          "A",
          resumedRng,
          DEFAULT_CONFIG
        );
      }

      let resumedMeterState = savedMeterState;
      const resumedHistory = savedHistory;

      // Complete remaining steps
      for (let i = 3; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          resumedMeterState,
          step.optionA.delta,
          step.id,
          "A",
          resumedRng,
          DEFAULT_CONFIG
        );

        resumedMeterState = result.meterState;
        resumedHistory.push({
          stepId: step.id,
          choiceMade: "A",
          timestamp: new Date().toISOString(),
          deltasApplied: step.optionA.delta,
          unluckTriggered: result.unluckResult.unluckApplied,
        });
      }

      // Verify we completed all 5 steps
      expect(resumedHistory).toHaveLength(5);
      expect(resumedMeterState.displayValue).toBeGreaterThan(0);
    });
  });

  describe("Ending Calculation (Task 10.2.1)", () => {
    it("should calculate ending based on final meter state", () => {
      const seed = 123456;
      const rng = createRNG(seed);
      let meterState = createInitialMeterState();
      const stepHistory: StepResult[] = [];

      // Play through all steps
      for (let i = 0; i < 5; i++) {
        const step = DEFAULT_CONTENT_PACK.steps[i];
        if (!step) continue;

        const result = updateMeterStateWithUnluck(
          meterState,
          step.optionA.delta,
          step.id,
          "A",
          rng,
          DEFAULT_CONFIG
        );

        meterState = result.meterState;
        stepHistory.push({
          stepId: step.id,
          choiceMade: "A",
          timestamp: new Date().toISOString(),
          deltasApplied: step.optionA.delta,
          unluckTriggered: result.unluckResult.unluckApplied,
        });
      }

      // Calculate ending
      const ending = calculateEnding(meterState.displayValue, meterState.hiddenState);

      expect(ending).toBeDefined();
      expect(ending.tier).toBeDefined();
      expect(ending.title).toBeTruthy();
      expect(ending.description).toBeTruthy();
      expect(ending.topDrivers).toBeDefined();
      expect(ending.bottleneck).toBeDefined();
      expect(ending.nextStepSuggestion).toBeTruthy();
    });
  });
});

