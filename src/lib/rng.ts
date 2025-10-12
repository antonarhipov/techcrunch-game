/**
 * Seeded Random Number Generator using Mulberry32 algorithm
 * Provides deterministic random number generation for reproducible game runs
 */

import type { SeededRNG } from "@/types/game";

/**
 * Implementation of SeededRNG using Mulberry32 algorithm
 * Mulberry32 is a simple, fast PRNG with good statistical properties
 */
class Mulberry32RNG implements SeededRNG {
  private state: number;

  constructor(seed: number) {
    // Ensure seed is a positive 32-bit integer
    this.state = Math.abs(seed) >>> 0;
    
    // If seed is 0, use a non-zero value to avoid degenerate sequences
    if (this.state === 0) {
      this.state = 2147483647;
    }
  }

  /**
   * Generate next random float in [0, 1)
   * Uses Mulberry32 algorithm
   */
  next(): number {
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }

  /**
   * Generate random integer in [min, max] (inclusive on both ends)
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) must be <= max (${max})`);
    }
    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  /**
   * Generate random float in [min, max]
   */
  nextFloat(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) must be <= max (${max})`);
    }
    return this.next() * (max - min) + min;
  }

  /**
   * Reset RNG with new seed
   */
  reset(seed: number): void {
    this.state = Math.abs(seed) >>> 0;
    if (this.state === 0) {
      this.state = 2147483647;
    }
  }

  /**
   * Get current internal state (for debugging/testing)
   */
  getState(): number {
    return this.state;
  }
}

/**
 * Factory function to create a new seeded RNG instance
 * @param seed - The seed value for the RNG
 * @returns A new SeededRNG instance
 */
export function createRNG(seed: number): SeededRNG {
  return new Mulberry32RNG(seed);
}

/**
 * Generate a random seed from current timestamp
 * Useful for creating new game runs
 */
export function generateSeed(): number {
  return Date.now();
}

