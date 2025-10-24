/**
 * Unit tests for Unluck System
 * Tasks 3.1.10, 3.2.11, 3.3.10
 */

import {
  rollUnluck,
  generateLuckFactor,
  applyUnluckToDeltas,
  getUnluckMessage,
  shouldCheckPerfectStorm,
  rollPerfectStorm,
  applyPerfectStormPenalties,
  getPerfectStormMessage,
  createUnluckResult,
  processUnluck,
} from "../unluck";
import { updateMeterStateWithUnluck, createInitialMeterState } from "../meter-engine";
import { createRNG } from "../rng";
import { DEFAULT_CONFIG } from "../config";
import type { Delta } from "@/types/game";

describe("Unluck System", () => {
  describe("rollUnluck() - Task 3.1.10", () => {
    it("should return true when forceUnluck is true", () => {
      const rng = createRNG(42);
      const result = rollUnluck(rng, DEFAULT_CONFIG, true);
      expect(result).toBe(true);
    });

    it("should return false when unluck is disabled in config", () => {
      const rng = createRNG(42);
      const config = {
        ...DEFAULT_CONFIG,
        unluck: { ...DEFAULT_CONFIG.unluck, enabled: false },
      };
      const result = rollUnluck(rng, config, false);
      expect(result).toBe(false);
    });

    it("should trigger based on probability", () => {
      const rng = createRNG(42);
      const results: boolean[] = [];
      
      for (let i = 0; i < 100; i++) {
        results.push(rollUnluck(rng, DEFAULT_CONFIG, false));
      }

      const triggerCount = results.filter(r => r).length;
      // With 10% probability, expect roughly 10 triggers (±5 for randomness)
      expect(triggerCount).toBeGreaterThan(0);
      expect(triggerCount).toBeLessThan(30);
    });

    it("should be deterministic with same seed", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);

      const results1 = Array.from({ length: 10 }, () =>
        rollUnluck(rng1, DEFAULT_CONFIG, false)
      );
      const results2 = Array.from({ length: 10 }, () =>
        rollUnluck(rng2, DEFAULT_CONFIG, false)
      );

      expect(results1).toEqual(results2);
    });
  });

  describe("generateLuckFactor() - Task 3.1.10", () => {
    it("should generate factor in configured range", () => {
      const rng = createRNG(42);
      const factorRange: [number, number] = [0.4, 0.7];

      for (let i = 0; i < 100; i++) {
        const factor = generateLuckFactor(rng, factorRange);
        expect(factor).toBeGreaterThanOrEqual(0.4);
        expect(factor).toBeLessThanOrEqual(0.7);
      }
    });

    it("should return override value if provided", () => {
      const rng = createRNG(42);
      const factorRange: [number, number] = [0.4, 0.7];
      const override = 0.5;

      const factor = generateLuckFactor(rng, factorRange, override);
      expect(factor).toBe(0.5);
    });

    it("should be deterministic with same seed", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);
      const factorRange: [number, number] = [0.4, 0.7];

      const factors1 = Array.from({ length: 10 }, () =>
        generateLuckFactor(rng1, factorRange)
      );
      const factors2 = Array.from({ length: 10 }, () =>
        generateLuckFactor(rng2, factorRange)
      );

      expect(factors1).toEqual(factors2);
    });
  });

  describe("applyUnluckToDeltas() - Task 3.1.10", () => {
    it("should scale only positive values", () => {
      const delta: Delta = { R: 10, U: 5, S: -3, C: 8, I: -2 };
      const luckFactor = 0.5;

      const result = applyUnluckToDeltas(delta, luckFactor);

      expect(result.R).toBe(5); // 10 * 0.5
      expect(result.U).toBe(2.5); // 5 * 0.5
      expect(result.S).toBe(-3); // Negative unchanged
      expect(result.C).toBe(4); // 8 * 0.5
      expect(result.I).toBe(-2); // Negative unchanged
    });

    it("should preserve negative values (tradeoffs)", () => {
      const delta: Delta = { R: -5, U: -3, S: -10, C: -2, I: -1 };
      const luckFactor = 0.5;

      const result = applyUnluckToDeltas(delta, luckFactor);

      expect(result.R).toBe(-5);
      expect(result.U).toBe(-3);
      expect(result.S).toBe(-10);
      expect(result.C).toBe(-2);
      expect(result.I).toBe(-1);
    });

    it("should handle zero values", () => {
      const delta: Delta = { R: 0, U: 0, S: 0, C: 0, I: 0 };
      const luckFactor = 0.5;

      const result = applyUnluckToDeltas(delta, luckFactor);

      expect(result.R).toBe(0);
      expect(result.U).toBe(0);
      expect(result.S).toBe(0);
      expect(result.C).toBe(0);
      expect(result.I).toBe(0);
    });

    it("should handle mixed positive and negative", () => {
      const delta: Delta = { R: 10, U: -5, S: 8, C: -3, I: 2 };
      const luckFactor = 0.6;

      const result = applyUnluckToDeltas(delta, luckFactor);

      expect(result.R).toBe(6); // Positive scaled
      expect(result.U).toBe(-5); // Negative unchanged
      expect(result.S).toBe(4.8); // Positive scaled
      expect(result.C).toBe(-3); // Negative unchanged
      expect(result.I).toBe(1.2); // Positive scaled
    });
  });

  describe("getUnluckMessage() - Task 3.1.10", () => {
    it("should return a message for each step/choice combination", () => {
      const rng = createRNG(42);

      for (let step = 1; step <= 5; step++) {
        const messageA = getUnluckMessage(step, "A", rng);
        const messageB = getUnluckMessage(step, "B", rng);

        expect(messageA).toBeTruthy();
        expect(messageA.length).toBeGreaterThan(10);
        expect(messageB).toBeTruthy();
        expect(messageB.length).toBeGreaterThan(10);
      }
    });

    it("should be deterministic with same seed", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);

      const messages1 = Array.from({ length: 5 }, (_, i) =>
        getUnluckMessage(i + 1, "A", rng1)
      );
      const messages2 = Array.from({ length: 5 }, (_, i) =>
        getUnluckMessage(i + 1, "A", rng2)
      );

      expect(messages1).toEqual(messages2);
    });

    it("should handle invalid step gracefully", () => {
      const rng = createRNG(42);
      const message = getUnluckMessage(99, "A", rng);
      
      expect(message).toBeTruthy();
      expect(typeof message).toBe("string");
    });
  });

  describe("Perfect Storm - Task 3.2.11", () => {
    describe("shouldCheckPerfectStorm()", () => {
      it("should return true only for Step 4B with unluck", () => {
        expect(shouldCheckPerfectStorm(4, "B", true)).toBe(true);
      });

      it("should return false for Step 4A even with unluck", () => {
        expect(shouldCheckPerfectStorm(4, "A", true)).toBe(false);
      });

      it("should return false for Step 4B without unluck", () => {
        expect(shouldCheckPerfectStorm(4, "B", false)).toBe(false);
      });

      it("should return false for other steps", () => {
        expect(shouldCheckPerfectStorm(1, "B", true)).toBe(false);
        expect(shouldCheckPerfectStorm(2, "B", true)).toBe(false);
        expect(shouldCheckPerfectStorm(3, "B", true)).toBe(false);
        expect(shouldCheckPerfectStorm(5, "B", true)).toBe(false);
      });
    });

    describe("rollPerfectStorm()", () => {
      it("should return true when forcePerfectStorm is true", () => {
        const rng = createRNG(42);
        const result = rollPerfectStorm(rng, DEFAULT_CONFIG, true);
        expect(result).toBe(true);
      });

      it("should return false when Perfect Storm is disabled", () => {
        const rng = createRNG(42);
        const config = {
          ...DEFAULT_CONFIG,
          specialUnluck: { ...DEFAULT_CONFIG.specialUnluck, enabled: false },
        };
        const result = rollPerfectStorm(rng, config, false);
        expect(result).toBe(false);
      });

      it("should trigger based on probability", () => {
        const rng = createRNG(42);
        const results: boolean[] = [];
        
        for (let i = 0; i < 100; i++) {
          results.push(rollPerfectStorm(rng, DEFAULT_CONFIG, false));
        }

        // With 100% probability in default config, all should trigger
        const triggerCount = results.filter(r => r).length;
        expect(triggerCount).toBe(100);
      });
    });

    describe("applyPerfectStormPenalties()", () => {
      it("should apply additional reduction to R and S (positive only)", () => {
        const delta: Delta = { R: 10, U: 5, S: 8, C: 3, I: 2 };
        const result = applyPerfectStormPenalties(delta, DEFAULT_CONFIG);

        // R and S get 50% additional reduction (50% of 10 = 5, 50% of 8 = 4)
        expect(result.R).toBe(5);
        expect(result.S).toBe(4);
      });

      it("should reduce U, C, I for both positive and negative", () => {
        const delta: Delta = { R: 0, U: 10, S: 0, C: 8, I: 6 };
        const result = applyPerfectStormPenalties(delta, DEFAULT_CONFIG);

        // U: 50% reduction → 5
        // C: 70% reduction → 2.4
        // I: 40% reduction → 3.6
        expect(result.U).toBeCloseTo(5, 5);
        expect(result.C).toBeCloseTo(2.4, 5);
        expect(result.I).toBeCloseTo(3.6, 5);
      });

      it("should amplify negative values for U, C, I", () => {
        const delta: Delta = { R: 0, U: -10, S: 0, C: -8, I: -6 };
        const result = applyPerfectStormPenalties(delta, DEFAULT_CONFIG);

        // Symmetric scaling: negatives are amplified by (1 + reduction)
        // U: -10 * (1 + 0.5) = -15
        // C: -8 * (1 + 0.7) = -13.6
        // I: -6 * (1 + 0.4) = -8.4
        expect(result.U).toBeCloseTo(-15, 5);
        expect(result.C).toBeCloseTo(-13.6, 5);
        expect(result.I).toBeCloseTo(-8.4, 5);
      });

      it("should amplify negative R and S", () => {
        const delta: Delta = { R: -10, U: 0, S: -8, C: 0, I: 0 };
        const result = applyPerfectStormPenalties(delta, DEFAULT_CONFIG);

        // Symmetric scaling with scalingGainsReduction = 0.5
        expect(result.R).toBeCloseTo(-15, 5);
        expect(result.S).toBeCloseTo(-12, 5);
      });
    });

    describe("getPerfectStormMessage()", () => {
      it("should return a dramatic message", () => {
        const rng = createRNG(42);
        const message = getPerfectStormMessage(rng);

        expect(message).toBeTruthy();
        expect(message).toContain("PERFECT STORM");
        expect(message).toContain("💥");
      });

      it("should be deterministic with same seed", () => {
        const rng1 = createRNG(12345);
        const rng2 = createRNG(12345);

        const message1 = getPerfectStormMessage(rng1);
        const message2 = getPerfectStormMessage(rng2);

        expect(message1).toBe(message2);
      });
    });
  });

  describe("createUnluckResult()", () => {
    it("should create correct result object", () => {
      const result = createUnluckResult(true, 0.5, "Test message", false);

      expect(result.unluckApplied).toBe(true);
      expect(result.luckFactor).toBe(0.5);
      expect(result.message).toBe("Test message");
      expect(result.perfectStorm).toBe(false);
    });

    it("should handle no unluck", () => {
      const result = createUnluckResult(false, 1.0, null, false);

      expect(result.unluckApplied).toBe(false);
      expect(result.luckFactor).toBe(1.0);
      expect(result.message).toBeNull();
      expect(result.perfectStorm).toBe(false);
    });

    it("should handle Perfect Storm", () => {
      const result = createUnluckResult(true, 0.5, "Perfect Storm!", true);

      expect(result.unluckApplied).toBe(true);
      expect(result.perfectStorm).toBe(true);
      expect(result.message).toBe("Perfect Storm!");
    });
  });

  describe("processUnluck() - Integration - Task 3.3.10", () => {
    it("should return original delta when no unluck", () => {
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(99999); // Seed that won't trigger unluck
      
      const { finalDelta, result } = processUnluck(1, "A", delta, rng, DEFAULT_CONFIG);

      expect(finalDelta).toEqual(delta);
      expect(result.unluckApplied).toBe(false);
      expect(result.luckFactor).toBe(1.0);
      expect(result.message).toBeNull();
    });

    it("should apply regular unluck when forced", () => {
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(42);
      
      const { finalDelta, result } = processUnluck(
        1,
        "A",
        delta,
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true }
      );

      expect(result.unluckApplied).toBe(true);
      expect(result.luckFactor).toBeGreaterThan(0);
      expect(result.luckFactor).toBeLessThan(1);
      expect(result.message).toBeTruthy();
      
      // Positive values should be reduced
      expect(finalDelta.R).toBeLessThan(delta.R);
      expect(finalDelta.U).toBeLessThan(delta.U);
    });

    it("should trigger Perfect Storm only on Step 4B with unluck", () => {
      const delta: Delta = { R: 10, U: 5, S: 8, C: 3, I: 2 };
      const rng = createRNG(42);
      
      const { result } = processUnluck(
        4,
        "B",
        delta,
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, forcePerfectStorm: true }
      );

      expect(result.perfectStorm).toBe(true);
      expect(result.message).toContain("PERFECT STORM");
    });

    it("should NOT trigger Perfect Storm on Step 4A", () => {
      const delta: Delta = { R: 10, U: 5, S: 8, C: 3, I: 2 };
      const rng = createRNG(42);
      
      const { result } = processUnluck(
        4,
        "A",
        delta,
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, forcePerfectStorm: true }
      );

      expect(result.perfectStorm).toBe(false);
    });

    it("should respect unluck factor override", () => {
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(42);
      
      const { finalDelta, result } = processUnluck(
        1,
        "A",
        delta,
        rng,
        DEFAULT_CONFIG,
        { forceUnluck: true, unluckFactorOverride: 0.5 }
      );

      expect(result.luckFactor).toBe(0.5);
      expect(finalDelta.R).toBe(5); // 10 * 0.5
    });

    it("should maintain RNG call order for determinism", () => {
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      
      const rng1 = createRNG(12345);
      const result1 = processUnluck(1, "A", delta, rng1, DEFAULT_CONFIG);
      
      const rng2 = createRNG(12345);
      const result2 = processUnluck(1, "A", delta, rng2, DEFAULT_CONFIG);

      expect(result1.finalDelta).toEqual(result2.finalDelta);
      expect(result1.result).toEqual(result2.result);
    });
  });

  describe("updateMeterStateWithUnluck() - Task 3.3.10", () => {
    it("should update meter and return unluck result", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(42);

      const result = updateMeterStateWithUnluck(
        state,
        delta,
        1,
        "A",
        rng,
        DEFAULT_CONFIG
      );

      expect(result.meterState).toBeDefined();
      expect(result.unluckResult).toBeDefined();
      expect(result.meterState.displayValue).toBeGreaterThan(0);
    });

    it("should apply unluck before meter update", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 8, S: 6, C: 4, I: 2 };
      const rng1 = createRNG(42);
      const rng2 = createRNG(42);

      // With unluck
      const withUnluck = updateMeterStateWithUnluck(
        state,
        delta,
        1,
        "A",
        rng1,
        DEFAULT_CONFIG,
        { forceUnluck: true, unluckFactorOverride: 0.5 }
      );

      // Without unluck
      const withoutUnluck = updateMeterStateWithUnluck(
        state,
        delta,
        1,
        "A",
        rng2,
        DEFAULT_CONFIG,
        { forceUnluck: false }
      );

      // Meter should be lower with unluck
      if (withoutUnluck.unluckResult.unluckApplied === false) {
        expect(withUnluck.meterState.displayValue).toBeLessThan(
          withoutUnluck.meterState.displayValue
        );
      }
    });

    it("should be deterministic with same seed", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      
      const rng1 = createRNG(12345);
      const result1 = updateMeterStateWithUnluck(
        state,
        delta,
        1,
        "A",
        rng1,
        DEFAULT_CONFIG
      );
      
      const rng2 = createRNG(12345);
      const result2 = updateMeterStateWithUnluck(
        state,
        delta,
        1,
        "A",
        rng2,
        DEFAULT_CONFIG
      );

      expect(result1.meterState).toEqual(result2.meterState);
      expect(result1.unluckResult).toEqual(result2.unluckResult);
    });
  });
});

