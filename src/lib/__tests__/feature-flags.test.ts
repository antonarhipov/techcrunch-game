/**
 * Unit tests for Feature Flags System
 * Task 1.4.15
 * @jest-environment node
 */

import {
  getFeatureFlags,
  saveFeatureFlags,
  clearFeatureFlags,
  isOperatorMode,
} from "../feature-flags";
import type { FeatureFlags } from "@/types/game";

// Mock window and localStorage for Node.js testing environment
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Helper to set location search
function setLocationSearch(search: string) {
  delete (window as any).location;
  (window as any).location = {
    search: search,
  };
}

// Setup global mocks
beforeAll(() => {
  // In Node environment, we need to define window and localStorage
  Object.defineProperty(global, "window", {
    value: {
      location: { search: "" },
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  mockLocalStorage.clear();
  // Reset the search string
  setLocationSearch("");
});

describe("getFeatureFlags()", () => {
  describe("Default Values", () => {
    it("should return default flags when no URL params or localStorage", () => {
      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBeUndefined();
      expect(flags.forceUnluck).toBe(false);
      expect(flags.forcePerfectStorm).toBe(false);
      expect(flags.unluckFactorOverride).toBeUndefined();
      expect(flags.showHiddenState).toBe(false);
      expect(flags.enableDebugConsole).toBe(false);
      expect(flags.skipAnimations).toBe(false);
    });
  });

  describe("URL Parameter Parsing", () => {
    it("should parse seed parameter", () => {
      setLocationSearch("?seed=12345");
      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBe(12345);
    });

    it("should ignore invalid seed parameter", () => {
      setLocationSearch("?seed=invalid");
      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBeUndefined();
    });

    it("should parse forceUnluck parameter (true)", () => {
      setLocationSearch("?forceUnluck=true");
      const flags = getFeatureFlags();

      expect(flags.forceUnluck).toBe(true);
    });

    it("should parse forceUnluck parameter (1)", () => {
      setLocationSearch("?forceUnluck=1");
      const flags = getFeatureFlags();

      expect(flags.forceUnluck).toBe(true);
    });

    it("should parse forcePerfectStorm parameter", () => {
      setLocationSearch("?forcePerfectStorm=true");
      const flags = getFeatureFlags();

      expect(flags.forcePerfectStorm).toBe(true);
    });

    it("should parse unluckFactor parameter", () => {
      setLocationSearch("?unluckFactor=0.5");
      const flags = getFeatureFlags();

      expect(flags.unluckFactorOverride).toBe(0.5);
    });

    it("should ignore unluckFactor outside valid range (too low)", () => {
      setLocationSearch("?unluckFactor=0.3");
      const flags = getFeatureFlags();

      expect(flags.unluckFactorOverride).toBeUndefined();
    });

    it("should ignore unluckFactor outside valid range (too high)", () => {
      setLocationSearch("?unluckFactor=0.8");
      const flags = getFeatureFlags();

      expect(flags.unluckFactorOverride).toBeUndefined();
    });

    it("should parse showHiddenState parameter", () => {
      setLocationSearch("?showHiddenState=true");
      const flags = getFeatureFlags();

      expect(flags.showHiddenState).toBe(true);
    });

    it("should parse debugConsole parameter", () => {
      setLocationSearch("?debugConsole=true");
      const flags = getFeatureFlags();

      expect(flags.enableDebugConsole).toBe(true);
    });

    it("should parse skipAnimations parameter", () => {
      setLocationSearch("?skipAnimations=true");
      const flags = getFeatureFlags();

      expect(flags.skipAnimations).toBe(true);
    });

    it("should enable showHiddenState and debugConsole when operator=true", () => {
      setLocationSearch("?operator=true");
      const flags = getFeatureFlags();

      expect(flags.showHiddenState).toBe(true);
      expect(flags.enableDebugConsole).toBe(true);
    });

    it("should parse multiple parameters", () => {
      setLocationSearch(
        "?seed=99999&forceUnluck=true&unluckFactor=0.6&operator=true"
      );
      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBe(99999);
      expect(flags.forceUnluck).toBe(true);
      expect(flags.unluckFactorOverride).toBe(0.6);
      expect(flags.showHiddenState).toBe(true);
      expect(flags.enableDebugConsole).toBe(true);
    });
  });

  describe("localStorage Fallback", () => {
    it("should load flags from localStorage when no URL params", () => {
      const storedFlags: FeatureFlags = {
        fixedSeed: 54321,
        forceUnluck: true,
        forcePerfectStorm: false,
        unluckFactorOverride: 0.5,
        showHiddenState: true,
        enableDebugConsole: false,
        skipAnimations: true,
      };

      mockLocalStorage.setItem(
        "startup-game-feature-flags",
        JSON.stringify(storedFlags)
      );

      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBe(54321);
      expect(flags.forceUnluck).toBe(true);
      expect(flags.unluckFactorOverride).toBe(0.5);
      expect(flags.showHiddenState).toBe(true);
      expect(flags.skipAnimations).toBe(true);
    });

    it("should prioritize URL params over localStorage", () => {
      const storedFlags: FeatureFlags = {
        fixedSeed: 11111,
        forceUnluck: false,
        forcePerfectStorm: false,
        showHiddenState: false,
        enableDebugConsole: false,
        skipAnimations: false,
      };

      mockLocalStorage.setItem(
        "startup-game-feature-flags",
        JSON.stringify(storedFlags)
      );

      setLocationSearch("?seed=22222&forceUnluck=true");
      const flags = getFeatureFlags();

      expect(flags.fixedSeed).toBe(22222); // URL wins
      expect(flags.forceUnluck).toBe(true); // URL wins
    });

    it("should handle corrupted localStorage gracefully", () => {
      mockLocalStorage.setItem(
        "startup-game-feature-flags",
        "invalid json {"
      );

      expect(() => getFeatureFlags()).not.toThrow();
      const flags = getFeatureFlags();
      expect(flags.forceUnluck).toBe(false); // Default value
    });
  });
});

describe("saveFeatureFlags()", () => {
  it("should save flags to localStorage", () => {
    const flags: FeatureFlags = {
      fixedSeed: 12345,
      forceUnluck: true,
      forcePerfectStorm: false,
      unluckFactorOverride: 0.6,
      showHiddenState: true,
      enableDebugConsole: false,
      skipAnimations: true,
    };

    saveFeatureFlags(flags);

    const stored = mockLocalStorage.getItem("startup-game-feature-flags");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.fixedSeed).toBe(12345);
    expect(parsed.forceUnluck).toBe(true);
    expect(parsed.unluckFactorOverride).toBe(0.6);
  });
});

describe("clearFeatureFlags()", () => {
  it("should remove flags from localStorage", () => {
    const flags: FeatureFlags = {
      fixedSeed: 12345,
      forceUnluck: true,
      forcePerfectStorm: false,
      showHiddenState: false,
      enableDebugConsole: false,
      skipAnimations: false,
    };

    saveFeatureFlags(flags);
    expect(
      mockLocalStorage.getItem("startup-game-feature-flags")
    ).toBeTruthy();

    clearFeatureFlags();
    expect(mockLocalStorage.getItem("startup-game-feature-flags")).toBeNull();
  });
});

describe("isOperatorMode()", () => {
  it("should return true when operator=true", () => {
    (window as any).location.search = "?operator=true";
    expect(isOperatorMode()).toBe(true);
  });

  it("should return true when operator=1", () => {
    (window as any).location.search = "?operator=1";
    expect(isOperatorMode()).toBe(true);
  });

  it("should return false when operator is not set", () => {
    (window as any).location.search = "";
    expect(isOperatorMode()).toBe(false);
  });

  it("should return false when operator=false", () => {
    (window as any).location.search = "?operator=false";
    expect(isOperatorMode()).toBe(false);
  });
});

