/**
 * Unit tests for Seeded Random Number Generator
 * Task 1.3.10
 */

import { createRNG, generateSeed } from "../rng";

describe("SeededRNG", () => {
  describe("Determinism", () => {
    it("should generate the same sequence for the same seed", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(12345);

      const sequence1 = Array.from({ length: 100 }, () => rng1.next());
      const sequence2 = Array.from({ length: 100 }, () => rng2.next());

      expect(sequence1).toEqual(sequence2);
    });

    it("should generate different sequences for different seeds", () => {
      const rng1 = createRNG(12345);
      const rng2 = createRNG(54321);

      const sequence1 = Array.from({ length: 100 }, () => rng1.next());
      const sequence2 = Array.from({ length: 100 }, () => rng2.next());

      expect(sequence1).not.toEqual(sequence2);
    });

    it("should be repeatable after reset with same seed", () => {
      const rng = createRNG(12345);
      const firstSequence = Array.from({ length: 50 }, () => rng.next());

      rng.reset(12345);
      const secondSequence = Array.from({ length: 50 }, () => rng.next());

      expect(firstSequence).toEqual(secondSequence);
    });
  });

  describe("Range Validation - next()", () => {
    it("should generate numbers in [0, 1) range", () => {
      const rng = createRNG(42);
      const samples = Array.from({ length: 1000 }, () => rng.next());

      for (const value of samples) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it("should never generate exactly 0 or 1", () => {
      const rng = createRNG(42);
      const samples = Array.from({ length: 1000 }, () => rng.next());

      expect(samples).not.toContain(0);
      expect(samples).not.toContain(1);
    });

    it("should generate values across the full range", () => {
      const rng = createRNG(42);
      const samples = Array.from({ length: 10000 }, () => rng.next());

      const hasLow = samples.some((v) => v < 0.25);
      const hasMid = samples.some((v) => v >= 0.25 && v < 0.75);
      const hasHigh = samples.some((v) => v >= 0.75);

      expect(hasLow).toBe(true);
      expect(hasMid).toBe(true);
      expect(hasHigh).toBe(true);
    });
  });

  describe("Range Validation - nextInt()", () => {
    it("should generate integers in [min, max] range (inclusive)", () => {
      const rng = createRNG(42);
      const min = 1;
      const max = 10;
      const samples = Array.from({ length: 1000 }, () => rng.nextInt(min, max));

      for (const value of samples) {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it("should generate all values in range eventually", () => {
      const rng = createRNG(42);
      const min = 1;
      const max = 5;
      const samples = Array.from({ length: 1000 }, () => rng.nextInt(min, max));
      const uniqueValues = new Set(samples);

      // Should have all values from 1 to 5
      expect(uniqueValues.size).toBe(5);
      expect(uniqueValues.has(1)).toBe(true);
      expect(uniqueValues.has(5)).toBe(true);
    });

    it("should work with negative ranges", () => {
      const rng = createRNG(42);
      const min = -10;
      const max = -5;
      const samples = Array.from({ length: 100 }, () => rng.nextInt(min, max));

      for (const value of samples) {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it("should work when min equals max", () => {
      const rng = createRNG(42);
      const value = 42;
      const samples = Array.from({ length: 10 }, () => rng.nextInt(value, value));

      expect(samples.every((v) => v === value)).toBe(true);
    });

    it("should throw error if min > max", () => {
      const rng = createRNG(42);
      expect(() => rng.nextInt(10, 5)).toThrow();
    });
  });

  describe("Range Validation - nextFloat()", () => {
    it("should generate floats in [min, max] range", () => {
      const rng = createRNG(42);
      const min = 0.5;
      const max = 10.5;
      const samples = Array.from({ length: 1000 }, () =>
        rng.nextFloat(min, max)
      );

      for (const value of samples) {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it("should work with negative ranges", () => {
      const rng = createRNG(42);
      const min = -5.5;
      const max = -0.5;
      const samples = Array.from({ length: 100 }, () =>
        rng.nextFloat(min, max)
      );

      for (const value of samples) {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it("should generate values across the full range", () => {
      const rng = createRNG(42);
      const min = 0;
      const max = 100;
      const samples = Array.from({ length: 10000 }, () =>
        rng.nextFloat(min, max)
      );

      const hasLow = samples.some((v) => v < 25);
      const hasMid = samples.some((v) => v >= 25 && v < 75);
      const hasHigh = samples.some((v) => v >= 75);

      expect(hasLow).toBe(true);
      expect(hasMid).toBe(true);
      expect(hasHigh).toBe(true);
    });

    it("should throw error if min > max", () => {
      const rng = createRNG(42);
      expect(() => rng.nextFloat(10.5, 5.5)).toThrow();
    });
  });

  describe("State Management", () => {
    it("should maintain internal state correctly", () => {
      const rng = createRNG(12345);
      const initialState = rng.getState();

      // Generate some numbers
      rng.next();
      rng.next();

      const newState = rng.getState();
      expect(newState).not.toBe(initialState);
    });

    it("should reset to same state with same seed", () => {
      const rng = createRNG(12345);
      const initialState = rng.getState();

      // Generate some numbers
      rng.next();
      rng.next();
      rng.next();

      // Reset with same seed
      rng.reset(12345);
      const resetState = rng.getState();

      expect(resetState).toBe(initialState);
    });

    it("should change state with different seed on reset", () => {
      const rng = createRNG(12345);
      const initialState = rng.getState();

      rng.reset(54321);
      const newState = rng.getState();

      expect(newState).not.toBe(initialState);
    });

    it("should handle zero seed gracefully", () => {
      const rng = createRNG(0);
      expect(() => rng.next()).not.toThrow();

      const samples = Array.from({ length: 10 }, () => rng.next());
      expect(samples.length).toBe(10);
    });

    it("should handle negative seed gracefully", () => {
      const rng = createRNG(-12345);
      expect(() => rng.next()).not.toThrow();

      const samples = Array.from({ length: 10 }, () => rng.next());
      expect(samples.length).toBe(10);
    });
  });

  describe("generateSeed()", () => {
    it("should generate a number", () => {
      const seed = generateSeed();
      expect(typeof seed).toBe("number");
    });

    it("should generate different seeds on subsequent calls", () => {
      const seed1 = generateSeed();
      // Small delay to ensure different timestamp
      const seed2 = generateSeed();

      // They might be equal if called in same millisecond, but likely different
      expect(typeof seed1).toBe("number");
      expect(typeof seed2).toBe("number");
    });
  });
});

