/**
 * Unit tests for Scaling Meter Engine
 * Task 2.1.12 and 2.3.6
 */

import {
  createInitialMeterState,
  applyDeltaToHiddenState,
  applyDiminishingReturns,
  computeWeightedSum,
  sigmoid,
  normalizeMeter,
  applyRandomness,
  clampMeter,
  updateStreak,
  applyMomentumBonus,
  shouldApplyRubberBand,
  applyRubberBandBump,
  updateMeterState,
} from "../meter-engine";
import { createRNG } from "../rng";
import { DEFAULT_CONFIG } from "../config";
import type { Delta } from "@/types/game";

describe("Meter Engine", () => {
  describe("createInitialMeterState()", () => {
    it("should create state with all zeros in hidden state", () => {
      const state = createInitialMeterState();

      expect(state.hiddenState.R).toBe(0);
      expect(state.hiddenState.U).toBe(0);
      expect(state.hiddenState.S).toBe(0);
      expect(state.hiddenState.C).toBe(0);
      expect(state.hiddenState.I).toBe(0);
    });

    it("should start with displayValue of 50", () => {
      const state = createInitialMeterState();
      expect(state.displayValue).toBe(50);
    });

    it("should start with gaining-steam tier", () => {
      const state = createInitialMeterState();
      expect(state.tier).toBe("gaining-steam");
    });

    it("should start with streak of 0", () => {
      const state = createInitialMeterState();
      expect(state.streak).toBe(0);
    });
  });

  describe("applyDeltaToHiddenState()", () => {
    it("should add delta to each dimension", () => {
      const state: Delta = { R: 5, U: 3, S: 2, C: 1, I: 0 };
      const delta: Delta = { R: 2, U: 1, S: 1, C: 1, I: 1 };

      const result = applyDeltaToHiddenState(state, delta);

      expect(result.R).toBe(7);
      expect(result.U).toBe(4);
      expect(result.S).toBe(3);
      expect(result.C).toBe(2);
      expect(result.I).toBe(1);
    });

    it("should handle negative deltas", () => {
      const state: Delta = { R: 5, U: 3, S: 2, C: 1, I: 0 };
      const delta: Delta = { R: -2, U: -1, S: 0, C: 1, I: -1 };

      const result = applyDeltaToHiddenState(state, delta);

      expect(result.R).toBe(3);
      expect(result.U).toBe(2);
      expect(result.S).toBe(2);
      expect(result.C).toBe(2);
      expect(result.I).toBe(-1);
    });

    it("should not mutate original state", () => {
      const state: Delta = { R: 5, U: 3, S: 2, C: 1, I: 0 };
      const delta: Delta = { R: 2, U: 1, S: 1, C: 1, I: 1 };

      applyDeltaToHiddenState(state, delta);

      expect(state.R).toBe(5); // Unchanged
    });
  });

  describe("applyDiminishingReturns()", () => {
    it("should apply power function to positive values", () => {
      const state: Delta = { R: 10, U: 8, S: 0, C: 0, I: 0 };
      const result = applyDiminishingReturns(state, 0.9);

      expect(result.R).toBeCloseTo(Math.pow(10, 0.9), 5);
      expect(result.U).toBeCloseTo(Math.pow(8, 0.9), 5);
    });

    it("should preserve sign for negative values", () => {
      const state: Delta = { R: -10, U: 0, S: 0, C: 0, I: 0 };
      const result = applyDiminishingReturns(state, 0.9);

      expect(result.R).toBeLessThan(0);
      expect(result.R).toBeCloseTo(-Math.pow(10, 0.9), 5);
    });

    it("should handle zero values", () => {
      const state: Delta = { R: 0, U: 0, S: 0, C: 0, I: 0 };
      const result = applyDiminishingReturns(state, 0.9);

      expect(result.R).toBe(0);
      expect(result.U).toBe(0);
    });
  });

  describe("computeWeightedSum()", () => {
    it("should compute correct weighted sum", () => {
      const state: Delta = { R: 10, U: 10, S: 10, C: 10, I: 10 };
      const weights = { R: 0.3, U: 0.25, S: 0.2, C: 0.15, I: 0.1 };

      const result = computeWeightedSum(state, weights);

      expect(result).toBe(10); // 10 * (0.3 + 0.25 + 0.2 + 0.15 + 0.1) = 10
    });

    it("should handle different values per dimension", () => {
      const state: Delta = { R: 10, U: 5, S: 0, C: -5, I: 2 };
      const weights = { R: 0.3, U: 0.25, S: 0.2, C: 0.15, I: 0.1 };

      const result = computeWeightedSum(state, weights);

      const expected = 10 * 0.3 + 5 * 0.25 + 0 * 0.2 + -5 * 0.15 + 2 * 0.1;
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("sigmoid()", () => {
    it("should return value between 0 and 1", () => {
      const result1 = sigmoid(0, -4, 11);
      const result2 = sigmoid(10, -4, 11);
      const result3 = sigmoid(-10, -4, 11);

      expect(result1).toBeGreaterThan(0);
      expect(result1).toBeLessThan(1);
      expect(result2).toBeGreaterThan(0);
      expect(result2).toBeLessThan(1);
      expect(result3).toBeGreaterThan(0);
      expect(result3).toBeLessThan(1);
    });

    it("should return ~0.5 at midpoint (mu)", () => {
      const result = sigmoid(-4, -4, 11);
      expect(result).toBeCloseTo(0.5, 2);
    });

    it("should be monotonically increasing", () => {
      const values = [-20, -10, 0, 10, 20].map((x) => sigmoid(x, -4, 11));

      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe("normalizeMeter()", () => {
    it("should scale sigmoid output to [0, 100]", () => {
      const result1 = normalizeMeter(0, DEFAULT_CONFIG);
      const result2 = normalizeMeter(10, DEFAULT_CONFIG);

      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThanOrEqual(100);
      expect(result2).toBeGreaterThanOrEqual(0);
      expect(result2).toBeLessThanOrEqual(100);
    });
  });

  describe("applyRandomness()", () => {
    it("should add noise within bounds", () => {
      const rng = createRNG(42);
      const baseValue = 50;
      const bounds: [number, number] = [-5, 5];

      const results = Array.from({ length: 100 }, () =>
        applyRandomness(baseValue, rng, bounds)
      );

      for (const result of results) {
        expect(result).toBeGreaterThanOrEqual(baseValue + bounds[0]);
        expect(result).toBeLessThanOrEqual(baseValue + bounds[1]);
      }
    });

    it("should be deterministic with same seed", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);

      const results1 = Array.from({ length: 10 }, () =>
        applyRandomness(50, rng1, [-5, 5])
      );
      const results2 = Array.from({ length: 10 }, () =>
        applyRandomness(50, rng2, [-5, 5])
      );

      expect(results1).toEqual(results2);
    });
  });

  describe("clampMeter()", () => {
    it("should clamp values below 0", () => {
      expect(clampMeter(-10)).toBe(0);
      expect(clampMeter(-0.1)).toBe(0);
    });

    it("should clamp values above 100", () => {
      expect(clampMeter(110)).toBe(100);
      expect(clampMeter(100.1)).toBe(100);
    });

    it("should round to 1 decimal place", () => {
      expect(clampMeter(50.123456)).toBe(50.1);
      expect(clampMeter(75.789)).toBe(75.8);
    });

    it("should not modify values in range", () => {
      expect(clampMeter(50)).toBe(50);
      expect(clampMeter(0)).toBe(0);
      expect(clampMeter(100)).toBe(100);
    });
  });

  describe("updateStreak()", () => {
    it("should increment streak when meter increases", () => {
      expect(updateStreak(50, 55, 0)).toBe(1);
      expect(updateStreak(50, 55, 1)).toBe(2);
      expect(updateStreak(50, 55, 5)).toBe(6);
    });

    it("should reset streak when meter stays same", () => {
      expect(updateStreak(50, 50, 3)).toBe(0);
    });

    it("should reset streak when meter decreases", () => {
      expect(updateStreak(50, 45, 3)).toBe(0);
    });
  });

  describe("applyMomentumBonus()", () => {
    it("should add bonus when streak meets threshold", () => {
      const config = DEFAULT_CONFIG;
      const value = 50;

      const result = applyMomentumBonus(value, 2, config);
      expect(result).toBe(53); // 50 + 3 bonus
    });

    it("should not add bonus when streak below threshold", () => {
      const config = DEFAULT_CONFIG;
      const value = 50;

      const result = applyMomentumBonus(value, 1, config);
      expect(result).toBe(50); // No bonus
    });

    it("should respect enabled flag", () => {
      const config = {
        ...DEFAULT_CONFIG,
        momentum: { ...DEFAULT_CONFIG.momentum, enabled: false },
      };
      const value = 50;

      const result = applyMomentumBonus(value, 3, config);
      expect(result).toBe(50); // No bonus when disabled
    });
  });

  describe("shouldApplyRubberBand() - Task 2.3.6", () => {
    it("should return true when meter < threshold", () => {
      expect(shouldApplyRubberBand(25, DEFAULT_CONFIG)).toBe(true);
      expect(shouldApplyRubberBand(0, DEFAULT_CONFIG)).toBe(true);
      expect(shouldApplyRubberBand(29.9, DEFAULT_CONFIG)).toBe(true);
    });

    it("should return false when meter >= threshold", () => {
      expect(shouldApplyRubberBand(30, DEFAULT_CONFIG)).toBe(false);
      expect(shouldApplyRubberBand(50, DEFAULT_CONFIG)).toBe(false);
      expect(shouldApplyRubberBand(100, DEFAULT_CONFIG)).toBe(false);
    });

    it("should respect enabled flag", () => {
      const config = {
        ...DEFAULT_CONFIG,
        rubberBand: { ...DEFAULT_CONFIG.rubberBand, enabled: false },
      };

      expect(shouldApplyRubberBand(25, config)).toBe(false);
    });
  });

  describe("applyRubberBandBump()", () => {
    it("should add bump to System (S) dimension", () => {
      const state: Delta = { R: 5, U: 3, S: 2, C: 1, I: 0 };
      const result = applyRubberBandBump(state, 2);

      expect(result.S).toBe(4); // 2 + 2
      expect(result.R).toBe(5); // Unchanged
    });

    it("should not mutate original state", () => {
      const state: Delta = { R: 5, U: 3, S: 2, C: 1, I: 0 };
      applyRubberBandBump(state, 2);

      expect(state.S).toBe(2); // Unchanged
    });
  });

  describe("updateMeterState() - Integration", () => {
    it("should update meter state correctly", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(42);

      const newState = updateMeterState(state, delta, rng, DEFAULT_CONFIG);

      expect(newState.displayValue).toBeGreaterThan(0);
      expect(newState.displayValue).toBeLessThanOrEqual(100);
      expect(newState.hiddenState.R).toBeGreaterThan(0);
      expect(newState.lastDelta).toEqual(delta);
    });

    it("should be deterministic with same seed", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };

      const rng1 = createRNG(12345);
      const result1 = updateMeterState(state, delta, rng1, DEFAULT_CONFIG);

      const rng2 = createRNG(12345);
      const result2 = updateMeterState(state, delta, rng2, DEFAULT_CONFIG);

      expect(result1.displayValue).toBe(result2.displayValue);
      expect(result1.hiddenState).toEqual(result2.hiddenState);
    });

    it("should handle multiple sequential updates", () => {
      let state = createInitialMeterState();
      const rng = createRNG(42);
      const delta: Delta = { R: 5, U: 4, S: 3, C: 2, I: 1 };

      for (let i = 0; i < 5; i++) {
        state = updateMeterState(state, delta, rng, DEFAULT_CONFIG);
      }

      expect(state.displayValue).toBeGreaterThan(0);
      expect(state.streak).toBeGreaterThanOrEqual(0);
    });

    it("should update streak correctly on consecutive gains", () => {
      let state = createInitialMeterState();
      const rng = createRNG(42);
      const delta: Delta = { R: 8, U: 7, S: 6, C: 5, I: 4 };

      // First update
      state = updateMeterState(state, delta, rng, DEFAULT_CONFIG);
      expect(state.streak).toBe(1);

      // Second update
      state = updateMeterState(state, delta, rng, DEFAULT_CONFIG);
      expect(state.streak).toBeGreaterThanOrEqual(1);
    });

    it("should store applied delta", () => {
      const state = createInitialMeterState();
      const delta: Delta = { R: 10, U: 5, S: 3, C: 2, I: 1 };
      const rng = createRNG(42);

      const newState = updateMeterState(state, delta, rng, DEFAULT_CONFIG);

      expect(newState.lastDelta).toEqual(delta);
    });
  });
});

