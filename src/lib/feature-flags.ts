/**
 * Feature flags system for testing and operator mode
 * Supports URL parameter overrides and localStorage persistence
 */

import type { FeatureFlags } from "@/types/game";

/**
 * Get feature flags from URL parameters and localStorage
 * URL parameters take precedence over localStorage
 * @returns Current feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  const flags: FeatureFlags = {
    fixedSeed: undefined,
    forceUnluck: false,
    forcePerfectStorm: false,
    unluckFactorOverride: undefined,
    showHiddenState: false,
    enableDebugConsole: false,
    skipAnimations: false,
  };

  // Only access URL and localStorage in browser environment
  if (typeof window === "undefined") {
    return flags;
  }

  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);

  // Fixed seed
  const seedParam = params.get("seed");
  if (seedParam) {
    const seed = Number.parseInt(seedParam, 10);
    if (!Number.isNaN(seed)) {
      flags.fixedSeed = seed;
    }
  }

  // Force unluck
  const forceUnluckParam = params.get("forceUnluck");
  if (forceUnluckParam === "true" || forceUnluckParam === "1") {
    flags.forceUnluck = true;
  }

  // Force Perfect Storm
  const forcePerfectStormParam = params.get("forcePerfectStorm");
  if (forcePerfectStormParam === "true" || forcePerfectStormParam === "1") {
    flags.forcePerfectStorm = true;
  }

  // Unluck factor override
  const unluckFactorParam = params.get("unluckFactor");
  if (unluckFactorParam) {
    const factor = Number.parseFloat(unluckFactorParam);
    if (!Number.isNaN(factor) && factor >= 0.4 && factor <= 0.7) {
      flags.unluckFactorOverride = factor;
    }
  }

  // Operator mode (enables all debug features)
  const operatorParam = params.get("operator");
  if (operatorParam === "true" || operatorParam === "1") {
    flags.showHiddenState = true;
    flags.enableDebugConsole = true;
  }

  // Show hidden state
  const showHiddenParam = params.get("showHiddenState");
  if (showHiddenParam === "true" || showHiddenParam === "1") {
    flags.showHiddenState = true;
  }

  // Enable debug console
  const debugConsoleParam = params.get("debugConsole");
  if (debugConsoleParam === "true" || debugConsoleParam === "1") {
    flags.enableDebugConsole = true;
  }

  // Skip animations
  const skipAnimationsParam = params.get("skipAnimations");
  if (skipAnimationsParam === "true" || skipAnimationsParam === "1") {
    flags.skipAnimations = true;
  }

  // Try to load from localStorage as fallback
  try {
    const stored = localStorage.getItem("startup-game-feature-flags");
    if (stored) {
      const storedFlags = JSON.parse(stored) as Partial<FeatureFlags>;
      
      // Only apply stored flags if not overridden by URL params
      if (flags.fixedSeed === undefined && storedFlags.fixedSeed !== undefined) {
        flags.fixedSeed = storedFlags.fixedSeed;
      }
      if (!flags.forceUnluck && storedFlags.forceUnluck) {
        flags.forceUnluck = storedFlags.forceUnluck;
      }
      if (!flags.forcePerfectStorm && storedFlags.forcePerfectStorm) {
        flags.forcePerfectStorm = storedFlags.forcePerfectStorm;
      }
      if (
        flags.unluckFactorOverride === undefined &&
        storedFlags.unluckFactorOverride !== undefined
      ) {
        flags.unluckFactorOverride = storedFlags.unluckFactorOverride;
      }
      if (!flags.showHiddenState && storedFlags.showHiddenState) {
        flags.showHiddenState = storedFlags.showHiddenState;
      }
      if (!flags.enableDebugConsole && storedFlags.enableDebugConsole) {
        flags.enableDebugConsole = storedFlags.enableDebugConsole;
      }
      if (!flags.skipAnimations && storedFlags.skipAnimations) {
        flags.skipAnimations = storedFlags.skipAnimations;
      }
    }
  } catch (error) {
    // Ignore localStorage errors (might be disabled or unavailable)
    console.warn("Failed to load feature flags from localStorage:", error);
  }

  return flags;
}

/**
 * Save feature flags to localStorage
 * @param flags - Feature flags to save
 */
export function saveFeatureFlags(flags: FeatureFlags): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      "startup-game-feature-flags",
      JSON.stringify(flags)
    );
  } catch (error) {
    console.warn("Failed to save feature flags to localStorage:", error);
  }
}

/**
 * Clear feature flags from localStorage
 */
export function clearFeatureFlags(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("startup-game-feature-flags");
  } catch (error) {
    console.warn("Failed to clear feature flags from localStorage:", error);
  }
}

/**
 * Check if operator mode is enabled
 * @returns True if operator mode is active
 */
export function isOperatorMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("operator") === "true" || params.get("operator") === "1";
}

