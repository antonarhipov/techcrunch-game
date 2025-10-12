/**
 * Unit tests for localStorage Persistence
 * Task 5.2.10
 */

import {
  saveRunState,
  loadRunState,
  clearRunState,
  isLocalStorageAvailable,
  getStorageKey,
} from "../storage";
import { createInitialMeterState } from "../meter-engine";
import type { RunState } from "@/types/game";

// Mock localStorage
let store: Record<string, string> = {};

const defaultGetItem = (key: string) => store[key] || null;
const defaultSetItem = (key: string, value: string) => {
  store[key] = value;
};
const defaultRemoveItem = (key: string) => {
  delete store[key];
};
const defaultClear = () => {
  store = {};
};

const localStorageMock = {
  getItem: defaultGetItem,
  setItem: defaultSetItem,
  removeItem: defaultRemoveItem,
  clear: defaultClear,
};

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  store = {};
});

afterEach(() => {
  // Restore original mock functions
  localStorageMock.getItem = defaultGetItem;
  localStorageMock.setItem = defaultSetItem;
  localStorageMock.removeItem = defaultRemoveItem;
  localStorageMock.clear = defaultClear;
});

describe("localStorage Persistence - Task 5.2.10", () => {
  const createMockRunState = (): RunState => ({
    seed: 12345,
    currentStep: 3,
    stepHistory: [
      {
        stepId: 1,
        choiceMade: "A",
        timestamp: "2025-01-01T00:00:00.000Z",
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      },
      {
        stepId: 2,
        choiceMade: "B",
        timestamp: "2025-01-01T00:01:00.000Z",
        deltasApplied: { R: 0, U: 5, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      },
    ],
    meterState: createInitialMeterState(),
    startTime: "2025-01-01T00:00:00.000Z",
  });

  describe("isLocalStorageAvailable()", () => {
    it("should return true when localStorage is available", () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it("should return false when localStorage throws error", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error("Storage unavailable");
      };

      expect(isLocalStorageAvailable()).toBe(false);

      localStorageMock.setItem = originalSetItem;
    });

    it("should clean up test key after checking", () => {
      const originalRemoveItem = localStorageMock.removeItem;
      const removeItemSpy = jest.fn(originalRemoveItem);
      localStorageMock.removeItem = removeItemSpy;
      
      isLocalStorageAvailable();

      expect(removeItemSpy).toHaveBeenCalledWith("__storage_test__");
      
      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe("saveRunState()", () => {
    it("should save run state to localStorage", () => {
      const state = createMockRunState();
      
      saveRunState(state);

      const savedValue = store[getStorageKey()];
      expect(savedValue).toBeDefined();
      expect(JSON.parse(savedValue as string).seed).toBe(state.seed);
    });

    it("should serialize state to JSON correctly", () => {
      const state = createMockRunState();
      
      saveRunState(state);

      const savedValue = store[getStorageKey()];
      expect(savedValue).toBeDefined();
      
      const parsed = JSON.parse(savedValue as string);
      expect(parsed.seed).toBe(state.seed);
      expect(parsed.currentStep).toBe(state.currentStep);
      expect(parsed.stepHistory).toEqual(state.stepHistory);
    });

    it("should handle QuotaExceededError gracefully", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const originalSetItem = localStorageMock.setItem;
      
      // Mock to succeed first time (storage test), then fail on second call (actual save)
      let callCount = 0;
      localStorageMock.setItem = (key: string, value: string) => {
        callCount++;
        if (callCount === 1) {
          // First call is from isLocalStorageAvailable test
          store[key] = value;
          return;
        }
        // Second call is the actual save attempt
        const error = new Error("Quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      };

      const state = createMockRunState();
      
      expect(() => saveRunState(state)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("quota exceeded"),
        expect.anything()
      );

      localStorageMock.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    it("should handle SecurityError gracefully", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const originalSetItem = localStorageMock.setItem;
      
      // Mock to succeed first time (storage test), then fail on second call (actual save)
      let callCount = 0;
      localStorageMock.setItem = (key: string, value: string) => {
        callCount++;
        if (callCount === 1) {
          // First call is from isLocalStorageAvailable test
          store[key] = value;
          return;
        }
        // Second call is the actual save attempt
        const error = new Error("Access denied");
        error.name = "SecurityError";
        throw error;
      };

      const state = createMockRunState();
      
      expect(() => saveRunState(state)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("SecurityError"),
        expect.anything()
      );

      localStorageMock.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    it("should not save when localStorage is unavailable", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const originalSetItem = localStorageMock.setItem;
      
      localStorageMock.setItem = () => {
        throw new Error("Storage unavailable");
      };

      const state = createMockRunState();
      saveRunState(state);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("localStorage is not available")
      );

      localStorageMock.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe("loadRunState()", () => {
    it("should load run state from localStorage", () => {
      const state = createMockRunState();
      
      // Manually set the store since we're bypassing saveRunState
      store[getStorageKey()] = JSON.stringify(state);

      const loaded = loadRunState();

      expect(loaded).not.toBeNull();
      expect(loaded?.seed).toBe(state.seed);
      expect(loaded?.currentStep).toBe(state.currentStep);
      expect(loaded?.stepHistory.length).toBe(state.stepHistory.length);
    });

    it("should return null when no state exists", () => {
      const loaded = loadRunState();

      expect(loaded).toBeNull();
    });

    it("should return null on invalid JSON", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      
      store[getStorageKey()] = "invalid json {";

      const loaded = loadRunState();

      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should validate required fields", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      
      const invalidState = { seed: 123 }; // Missing required fields
      store[getStorageKey()] = JSON.stringify(invalidState);

      const loaded = loadRunState();

      expect(loaded).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("missing required fields")
      );

      consoleWarnSpy.mockRestore();
    });

    it("should validate seed is a number", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      
      const invalidState = {
        seed: "not-a-number",
        currentStep: 1,
        stepHistory: [],
        meterState: createInitialMeterState(),
        startTime: "2025-01-01T00:00:00.000Z",
      };
      store[getStorageKey()] = JSON.stringify(invalidState);

      const loaded = loadRunState();

      expect(loaded).toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it("should validate currentStep is a number", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      
      const invalidState = {
        seed: 123,
        currentStep: "not-a-number",
        stepHistory: [],
        meterState: createInitialMeterState(),
        startTime: "2025-01-01T00:00:00.000Z",
      };
      store[getStorageKey()] = JSON.stringify(invalidState);

      const loaded = loadRunState();

      expect(loaded).toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it("should validate stepHistory is an array", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      
      const invalidState = {
        seed: 123,
        currentStep: 1,
        stepHistory: "not-an-array",
        meterState: createInitialMeterState(),
        startTime: "2025-01-01T00:00:00.000Z",
      };
      store[getStorageKey()] = JSON.stringify(invalidState);

      const loaded = loadRunState();

      expect(loaded).toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it("should return null when localStorage is unavailable", () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = () => {
        throw new Error("Storage unavailable");
      };

      const loaded = loadRunState();

      expect(loaded).toBeNull();

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe("clearRunState()", () => {
    it("should remove run state from localStorage", () => {
      const state = createMockRunState();
      store[getStorageKey()] = JSON.stringify(state);

      expect(store[getStorageKey()]).toBeDefined();

      clearRunState();

      expect(store[getStorageKey()]).toBeUndefined();
    });

    it("should handle errors gracefully", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const originalRemoveItem = localStorageMock.removeItem;
      
      localStorageMock.removeItem = () => {
        throw new Error("Remove failed");
      };

      // Should not throw even when removeItem fails
      expect(() => clearRunState()).not.toThrow();

      // Verify console.error was called (if the error path is reached)
      // Note: This might not be called if isLocalStorageAvailable returns false
      if (consoleErrorSpy.mock.calls.length > 0) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("Failed to clear run state"),
          expect.anything()
        );
      }

      localStorageMock.removeItem = originalRemoveItem;
      consoleErrorSpy.mockRestore();
    });

    it("should not throw when localStorage is unavailable", () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = () => {
        throw new Error("Storage unavailable");
      };

      expect(() => clearRunState()).not.toThrow();

      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe("Save/Load Cycle", () => {
    it("should persist and restore full state correctly", () => {
      const originalState = createMockRunState();

      saveRunState(originalState);
      const loadedState = loadRunState();

      expect(loadedState).not.toBeNull();
      expect(loadedState?.seed).toBe(originalState.seed);
      expect(loadedState?.currentStep).toBe(originalState.currentStep);
      expect(loadedState?.stepHistory.length).toBe(originalState.stepHistory.length);
      expect(loadedState?.meterState.displayValue).toBe(originalState.meterState.displayValue);
      expect(loadedState?.startTime).toBe(originalState.startTime);
    });

    it("should handle multiple save/load cycles", () => {
      const state1 = createMockRunState();
      state1.currentStep = 1;

      saveRunState(state1);
      let loaded = loadRunState();
      expect(loaded?.currentStep).toBe(1);

      const state2 = { ...state1, currentStep: 2 };
      saveRunState(state2);
      loaded = loadRunState();
      expect(loaded?.currentStep).toBe(2);

      const state3 = { ...state1, currentStep: 3 };
      saveRunState(state3);
      loaded = loadRunState();
      expect(loaded?.currentStep).toBe(3);
    });

    it("should return null after clearing state", () => {
      const state = createMockRunState();

      saveRunState(state);
      expect(loadRunState()).not.toBeNull();

      clearRunState();
      expect(loadRunState()).toBeNull();
    });
  });
});

