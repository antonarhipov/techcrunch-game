/**
 * localStorage Persistence Utilities
 * Handles saving and loading game state with error handling
 * Tasks: 5.2.1 - 5.2.9
 */

import type { RunState } from "@/types/game";

/** Storage key for run state in localStorage */
const RUN_STATE_KEY = "startup-game-run-state";

/**
 * Check if localStorage is available
 * Handles private browsing mode, disabled storage, etc.
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Save run state to localStorage
 * Handles QuotaExceededError and SecurityError gracefully
 * @param state - Run state to save
 */
export function saveRunState(state: RunState): void {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available. State will not be persisted.");
    return;
  }

  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(RUN_STATE_KEY, serialized);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded. State cannot be saved:", error);
      } else if (error.name === "SecurityError") {
        console.warn("localStorage access denied (SecurityError):", error);
      } else {
        console.error("Failed to save run state:", error);
      }
    }
  }
}

/**
 * Load run state from localStorage
 * Returns null if no state exists or on any error
 * @returns Run state or null
 */
export function loadRunState(): RunState | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const serialized = localStorage.getItem(RUN_STATE_KEY);
    
    if (!serialized) {
      return null;
    }

    const state = JSON.parse(serialized) as RunState;
    
    // Basic validation
    if (!state || typeof state !== "object") {
      console.warn("Invalid run state in localStorage");
      return null;
    }

    // Validate required fields
    if (
      typeof state.seed !== "number" ||
      typeof state.currentStep !== "number" ||
      !Array.isArray(state.stepHistory) ||
      !state.meterState ||
      !state.startTime
    ) {
      console.warn("Run state missing required fields");
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to load run state:", error);
    return null;
  }
}

/**
 * Clear run state from localStorage
 */
export function clearRunState(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(RUN_STATE_KEY);
  } catch (error) {
    console.error("Failed to clear run state:", error);
  }
}

/**
 * Get the storage key (for testing)
 */
export function getStorageKey(): string {
  return RUN_STATE_KEY;
}

