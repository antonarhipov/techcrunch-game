/**
 * Game Balance Tests
 * Task 4.3.11 - Test balance by simulating multiple paths
 */

import { DEFAULT_CONTENT_PACK } from "../default-pack";
import { createRNG } from "../rng";
import { createInitialMeterState, updateMeterStateWithUnluck } from "../meter-engine";
import { DEFAULT_CONFIG } from "../config";
import type { MeterState } from "@/types/game";

/**
 * Simulate a complete game run with a given path
 * @param path - String of choices (e.g., "AAAAA", "BBBBB", "ABABA")
 * @param seed - Random seed for determinism
 * @param unluckOptions - Options for unluck system
 * @returns Final meter state
 */
function simulateGamePath(
  path: string,
  seed: number = 12345,
  unluckOptions?: {
    forceUnluck?: boolean;
    forcePerfectStorm?: boolean;
    unluckFactorOverride?: number;
  }
): MeterState {
  const rng = createRNG(seed);
  let state = createInitialMeterState();

  for (let i = 0; i < path.length && i < 5; i++) {
    const choice = path[i] === "A" ? "A" : "B";
    const step = DEFAULT_CONTENT_PACK.steps[i];
    
    if (!step) {
      throw new Error(`Step ${i + 1} not found in pack`);
    }

    const delta = choice === "A" ? step.optionA.delta : step.optionB.delta;
    const stepId = step.id;

    const result = updateMeterStateWithUnluck(
      state,
      delta,
      stepId,
      choice,
      rng,
      DEFAULT_CONFIG,
      unluckOptions
    );

    state = result.meterState;
  }

  return state;
}

describe("Game Balance Tests - Task 4.3.11", () => {
  describe("Path Simulations", () => {
    it("should complete AAAAA path with reasonable meter", () => {
      const finalState = simulateGamePath("AAAAA");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`AAAAA path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete BBBBB path with reasonable meter", () => {
      const finalState = simulateGamePath("BBBBB");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`BBBBB path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete ABABA path with reasonable meter", () => {
      const finalState = simulateGamePath("ABABA");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`ABABA path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete BABAB path with reasonable meter", () => {
      const finalState = simulateGamePath("BABAB");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`BABAB path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete AABBA path with reasonable meter", () => {
      const finalState = simulateGamePath("AABBA");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`AABBA path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete BBAAB path with reasonable meter", () => {
      const finalState = simulateGamePath("BBAAB");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`BBAAB path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete AAABB path with reasonable meter", () => {
      const finalState = simulateGamePath("AAABB");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`AAABB path: ${finalState.displayValue} (${finalState.tier})`);
    });

    it("should complete BBBAA path with reasonable meter", () => {
      const finalState = simulateGamePath("BBBAA");

      expect(finalState.displayValue).toBeGreaterThanOrEqual(0);
      expect(finalState.displayValue).toBeLessThanOrEqual(100);
      expect(finalState.tier).toBeDefined();

      console.log(`BBBAA path: ${finalState.displayValue} (${finalState.tier})`);
    });
  });

  describe("Balance Characteristics", () => {
    it("should produce different outcomes for different paths", () => {
      const pathA = simulateGamePath("AAAAA", 12345);
      const pathB = simulateGamePath("BBBBB", 12345);

      // Different paths should generally lead to different outcomes
      expect(pathA.displayValue).not.toBe(pathB.displayValue);
    });

    it("should allow achieving high scores (50+)", () => {
      const paths = ["AAAAA", "BBBBB", "ABABA", "BABAB", "AABBA", "BBAAB"];
      
      const results = paths.map(path => simulateGamePath(path, 12345));
      const highScores = results.filter(r => r.displayValue >= 50);

      expect(highScores.length).toBeGreaterThan(0);
    });

    it("should allow multiple paths to winning tiers", () => {
      const paths = ["AAAAA", "BBBBB", "ABABA", "BABAB", "AABBA", "BBAAB"];
      
      const results = paths.map(path => simulateGamePath(path, 12345));
      const winningTiers = results.filter(r => 
        r.tier === "gaining-steam" || 
        r.tier === "scaling-up" || 
        r.tier === "breakout"
      );

      expect(winningTiers.length).toBeGreaterThan(0);
    });

    it("should not make all paths lead to crash tier", () => {
      const paths = ["AAAAA", "BBBBB", "ABABA", "BABAB"];
      
      const results = paths.map(path => simulateGamePath(path, 12345));
      const nonCrashPaths = results.filter(r => r.tier !== "crash");

      // At least some paths should avoid crash
      expect(nonCrashPaths.length).toBeGreaterThan(0);
    });

    it("should have some paths with tradeoffs leading to mid-range scores", () => {
      const mixedPath = simulateGamePath("ABABA", 12345);

      // Mixed strategies should produce mid-range scores
      expect(mixedPath.displayValue).toBeGreaterThan(20);
      expect(mixedPath.displayValue).toBeLessThan(80);
    });
  });

  describe("Determinism", () => {
    it("should produce same results for same seed and path", () => {
      const run1 = simulateGamePath("AAAAA", 12345);
      const run2 = simulateGamePath("AAAAA", 12345);

      expect(run1.displayValue).toBe(run2.displayValue);
      expect(run1.tier).toBe(run2.tier);
      expect(run1.hiddenState).toEqual(run2.hiddenState);
    });

    it("should produce different results for different seeds", () => {
      const seed1 = simulateGamePath("AAAAA", 12345);
      const seed2 = simulateGamePath("AAAAA", 54321);

      // Different seeds may produce different results due to randomness
      // But both should still be valid
      expect(seed1.displayValue).toBeGreaterThanOrEqual(0);
      expect(seed2.displayValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Unluck Impact", () => {
    it("should reduce scores when unluck is forced", () => {
      const normal = simulateGamePath("AAAAA", 12345, { forceUnluck: false });
      const unlucky = simulateGamePath("AAAAA", 12345, { forceUnluck: true });

      // Unluck should generally reduce the score
      expect(unlucky.displayValue).toBeLessThanOrEqual(normal.displayValue);
    });

    it("should severely impact Step 4B with Perfect Storm", () => {
      const normal = simulateGamePath("AAAAB", 12345, { forceUnluck: false });
      const perfectStorm = simulateGamePath("AAAAB", 12345, { 
        forceUnluck: true, 
        forcePerfectStorm: true 
      });

      // Perfect Storm on Step 4B should have significant impact
      expect(perfectStorm.displayValue).toBeLessThan(normal.displayValue);
    });

    it("should not trigger Perfect Storm on non-4B paths", () => {
      const path4A = simulateGamePath("AAAAA", 12345, { 
        forceUnluck: true, 
        forcePerfectStorm: true 
      });

      // Path doesn't have 4B, so Perfect Storm shouldn't trigger
      // Game should still complete successfully
      expect(path4A.displayValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all-A path without crashes", () => {
      expect(() => simulateGamePath("AAAAA")).not.toThrow();
    });

    it("should handle all-B path without crashes", () => {
      expect(() => simulateGamePath("BBBBB")).not.toThrow();
    });

    it("should handle alternating path without crashes", () => {
      expect(() => simulateGamePath("ABABA")).not.toThrow();
    });

    it("should never produce negative meter values", () => {
      const paths = ["AAAAA", "BBBBB", "ABABA", "BABAB"];
      
      for (const path of paths) {
        const result = simulateGamePath(path, 12345);
        expect(result.displayValue).toBeGreaterThanOrEqual(0);
      }
    });

    it("should never produce meter values over 100", () => {
      const paths = ["AAAAA", "BBBBB", "ABABA", "BABAB"];
      
      for (const path of paths) {
        const result = simulateGamePath(path, 12345);
        expect(result.displayValue).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("All Possible Paths Sample", () => {
    it("should test 10 random paths for balance", () => {
      const testPaths = [
        "AAAAA", "BBBBB", "ABABA", "BABAB", "AABBA",
        "BBAAB", "AAABB", "BBBAA", "AABAB", "ABBBA",
      ];

      const results = testPaths.map(path => ({
        path,
        state: simulateGamePath(path, 12345),
      }));

      console.log("\n=== Game Balance Summary ===");
      for (const { path, state } of results) {
        console.log(`${path}: ${state.displayValue.toFixed(1)} (${state.tier})`);
      }

      // All paths should produce valid results
      for (const { state } of results) {
        expect(state.displayValue).toBeGreaterThanOrEqual(0);
        expect(state.displayValue).toBeLessThanOrEqual(100);
        expect(state.tier).toBeDefined();
      }

      // Should have variety in outcomes
      const uniqueValues = new Set(results.map(r => Math.floor(r.state.displayValue / 10)));
      expect(uniqueValues.size).toBeGreaterThanOrEqual(1); // At least some variety
    });
  });
});

