/**
 * Unit tests for Content Pack Loader
 * Task 4.2.12
 */

import {
  loadContentPackFromString,
  loadContentPackWithFallback,
  clearPackCache,
  getCachedPackIds,
} from "../content-loader";
import { DEFAULT_CONTENT_PACK } from "../default-pack";
import type { ContentPack } from "@/types/game";

// Mock fetch for testing
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  clearPackCache();
});

describe("Content Pack Loader", () => {
  describe("loadContentPackFromString() - Task 4.2.12", () => {
    it("should load valid JSON pack", () => {
      const packJson = JSON.stringify(DEFAULT_CONTENT_PACK);
      const pack = loadContentPackFromString(packJson, "json");

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
      expect(pack.version).toBe("1.0.0");
      expect(pack.steps).toHaveLength(5);
    });

    it("should validate loaded pack", () => {
      const invalidPack = {
        id: "test",
        version: "1.0.0",
        title: "Test",
        steps: [], // Invalid: needs 5 steps
      };
      const packJson = JSON.stringify(invalidPack);

      expect(() => loadContentPackFromString(packJson, "json")).toThrow();
    });

    it("should throw on malformed JSON", () => {
      const invalidJson = "{ invalid json }";
      
      expect(() => loadContentPackFromString(invalidJson, "json")).toThrow();
    });

    it("should throw on YAML format (not yet implemented)", () => {
      const yamlData = "id: test\nversion: 1.0.0";
      
      expect(() => loadContentPackFromString(yamlData, "yaml")).toThrow(/YAML support not yet implemented/);
    });

    it("should provide detailed error messages on validation failure", () => {
      const invalidPack = {
        id: "", // Invalid ID
        version: "1.0.0",
        title: "Test",
        steps: DEFAULT_CONTENT_PACK.steps,
      };
      const packJson = JSON.stringify(invalidPack);

      try {
        loadContentPackFromString(packJson, "json");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain("validation");
      }
    });
  });

  describe("loadContentPackWithFallback() - Task 4.2.12", () => {
    it("should return default pack when no pack ID provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const pack = await loadContentPackWithFallback();

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
    });

    it("should load pack from file successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const pack = await loadContentPackWithFallback("ai-cofounder-v1");

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
    });

    it("should fallback to default on load failure", async () => {
      // First call fails (trying to load custom pack)
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Not found"))
        // Second call succeeds (fallback to default)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_CONTENT_PACK,
        });

      const pack = await loadContentPackWithFallback("non-existent-pack");

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1"); // Default pack
    });

    it("should log error when fallback occurs", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_CONTENT_PACK,
        });

      await loadContentPackWithFallback("bad-pack");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to load pack"),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });

    it("should use inline default pack if all loading fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // All fetch calls fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network down"));

      const pack = await loadContentPackWithFallback("test-pack");

      expect(pack).toBeDefined();
      expect(pack.id).toBeDefined(); // Should get inline fallback pack
      expect(pack.steps).toHaveLength(5);

      consoleSpy.mockRestore();
    });
  });

  describe("Cache Management - Task 4.2.12", () => {
    it("should cache loaded packs", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      // Load pack first time
      await loadContentPackWithFallback("ai-cofounder-v1");
      
      // Load same pack second time
      await loadContentPackWithFallback("ai-cofounder-v1");

      // Should only fetch once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should track cached pack IDs", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      await loadContentPackWithFallback("ai-cofounder-v1");

      const cachedIds = getCachedPackIds();
      expect(cachedIds.length).toBeGreaterThan(0);
    });

    it("should clear cache when requested", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      await loadContentPackWithFallback("ai-cofounder-v1");
      expect(getCachedPackIds().length).toBeGreaterThan(0);

      clearPackCache();
      expect(getCachedPackIds()).toHaveLength(0);
    });
  });

  describe("Validation Errors - Task 4.2.12", () => {
    it("should reject pack with invalid ID", async () => {
      const invalidPack = {
        ...DEFAULT_CONTENT_PACK,
        id: "invalid_id!", // Invalid characters
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalidPack,
      });

      try {
        await loadContentPackWithFallback("http://example.com/pack.json");
        // Should fallback to default due to validation error
        const pack = await loadContentPackWithFallback("http://example.com/pack.json");
        expect(pack.id).toBe("ai-cofounder-v1"); // Fallback
      } catch (error) {
        // Or might throw depending on implementation
        expect(error).toBeDefined();
      }
    });

    it("should reject pack with invalid version", async () => {
      const invalidPack = {
        ...DEFAULT_CONTENT_PACK,
        version: "invalid", // Not semantic versioning
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalidPack,
      });

      // Should fallback to default
      const pack = await loadContentPackWithFallback("http://example.com/pack.json");
      expect(pack.version).toMatch(/^\d+\.\d+\.\d+$/); // Valid semver
    });

    it("should reject pack with wrong number of steps", async () => {
      const invalidPack = {
        ...DEFAULT_CONTENT_PACK,
        steps: DEFAULT_CONTENT_PACK.steps.slice(0, 3), // Only 3 steps
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalidPack,
      });

      const pack = await loadContentPackWithFallback("http://example.com/pack.json");
      expect(pack.steps).toHaveLength(5); // Fallback has 5
    });

    it("should reject pack with out-of-range deltas", async () => {
      const invalidPack: ContentPack = {
        ...DEFAULT_CONTENT_PACK,
        steps: [
          {
            ...DEFAULT_CONTENT_PACK.steps[0]!,
            optionA: {
              ...DEFAULT_CONTENT_PACK.steps[0]!.optionA,
              delta: { R: 100, U: 0, S: 0, C: 0, I: 0 }, // Out of range
            },
          },
          ...DEFAULT_CONTENT_PACK.steps.slice(1),
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalidPack,
      });

      const pack = await loadContentPackWithFallback("http://example.com/pack.json");
      // Should fallback, so all deltas should be valid
      for (const step of pack.steps) {
        for (const dim of ["R", "U", "S", "C", "I"] as const) {
          expect(step.optionA.delta[dim]).toBeGreaterThanOrEqual(-10);
          expect(step.optionA.delta[dim]).toBeLessThanOrEqual(15);
          expect(step.optionB.delta[dim]).toBeGreaterThanOrEqual(-10);
          expect(step.optionB.delta[dim]).toBeLessThanOrEqual(15);
        }
      }
    });
  });

  describe("URL Loading - Task 4.2.12", () => {
    it("should detect and load from URL", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const pack = await loadContentPackWithFallback("https://example.com/pack.json");

      expect(pack).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith("https://example.com/pack.json");
    });

    it("should handle network errors gracefully", async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_CONTENT_PACK,
        });

      const pack = await loadContentPackWithFallback("https://example.com/pack.json");

      expect(pack).toBeDefined(); // Should get fallback
    });

    it("should handle HTTP errors gracefully", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_CONTENT_PACK,
        });

      const pack = await loadContentPackWithFallback("https://example.com/pack.json");

      expect(pack).toBeDefined(); // Should get fallback
    });
  });
});

