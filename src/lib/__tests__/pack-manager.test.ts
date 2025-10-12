/**
 * Unit tests for Pack Manager
 * Task 4.4.11
 */

import { getPackManager, loadAndActivatePack } from "../pack-manager";
import { DEFAULT_CONTENT_PACK } from "../default-pack";
import { clearPackCache } from "../content-loader";
import type { ContentPack } from "@/types/game";

// Mock fetch for testing
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  getPackManager().reset();
  clearPackCache(); // Also clear the content-loader cache
});

describe("Pack Manager - Task 4.4.11", () => {
  describe("Singleton Pattern", () => {
    it("should return same instance on multiple calls", () => {
      const manager1 = getPackManager();
      const manager2 = getPackManager();

      expect(manager1).toBe(manager2);
    });

    it("should maintain state across getInstance calls", () => {
      const manager1 = getPackManager();
      manager1.enableDevMode(true);

      const manager2 = getPackManager();
      expect(manager2.isDevMode()).toBe(true);
    });
  });

  describe("Load Multiple Packs - Task 4.4.11", () => {
    it("should load and cache first pack", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      const pack = await manager.loadPackFromUrl("https://example.com/pack1.json");

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
      expect(manager.listLoadedPacks()).toContain("ai-cofounder-v1");
    });

    it("should load and cache multiple different packs", async () => {
      const pack1 = { ...DEFAULT_CONTENT_PACK, id: "pack1" };
      const pack2 = { ...DEFAULT_CONTENT_PACK, id: "pack2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack2,
        });

      const manager = getPackManager();
      
      await manager.loadPackFromUrl("https://example.com/pack1.json");
      await manager.loadPackFromUrl("https://example.com/pack2.json");

      const loadedPacks = manager.listLoadedPacks();
      expect(loadedPacks).toContain("pack1");
      expect(loadedPacks).toContain("pack2");
      expect(loadedPacks.length).toBe(2);
    });

    it("should load pack from string data", () => {
      const manager = getPackManager();
      const packJson = JSON.stringify(DEFAULT_CONTENT_PACK);

      const pack = manager.loadPackFromString(packJson, "json");

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
      expect(manager.listLoadedPacks()).toContain("ai-cofounder-v1");
    });

    it("should handle load errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const manager = getPackManager();

      await expect(
        manager.loadPackFromUrl("https://example.com/bad.json")
      ).rejects.toThrow();
    });
  });

  describe("Switch Between Packs - Task 4.4.11", () => {
    it("should switch to already-loaded pack", async () => {
      const pack1 = { ...DEFAULT_CONTENT_PACK, id: "pack1" };
      const pack2 = { ...DEFAULT_CONTENT_PACK, id: "pack2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack2,
        });

      const manager = getPackManager();

      await manager.loadPackFromUrl("https://example.com/pack1.json");
      await manager.loadPackFromUrl("https://example.com/pack2.json");

      // Switch back to pack1
      const switched = await manager.switchToPack("pack1");

      expect(switched.id).toBe("pack1");
      expect(manager.getActivePack()?.id).toBe("pack1");
    });

    it("should load pack if not already loaded when switching", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();

      const pack = await manager.switchToPack("ai-cofounder-v1");

      expect(pack.id).toBe("ai-cofounder-v1");
      expect(manager.getActivePack()?.id).toBe("ai-cofounder-v1");
    });

    it("should update active pack when switching", async () => {
      const pack1 = { ...DEFAULT_CONTENT_PACK, id: "pack1" };
      const pack2 = { ...DEFAULT_CONTENT_PACK, id: "pack2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack2,
        });

      const manager = getPackManager();

      await manager.switchToPack("pack1");
      expect(manager.getActivePack()?.id).toBe("pack1");

      await manager.switchToPack("pack2");
      expect(manager.getActivePack()?.id).toBe("pack2");
    });

    it("should throw error when switching to non-existent pack fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Not found"));

      const manager = getPackManager();

      await expect(manager.switchToPack("non-existent")).rejects.toThrow();
    });
  });

  describe("Version Handling - Task 4.4.11", () => {
    it("should parse pack and version from URL params", () => {
      const manager = getPackManager();
      const params = new URLSearchParams("?pack=ai-cofounder&version=1.2.0");

      const { packId, version } = manager.parsePackParams(params);

      expect(packId).toBe("ai-cofounder");
      expect(version).toBe("1.2.0");
    });

    it("should handle missing version param", () => {
      const manager = getPackManager();
      const params = new URLSearchParams("?pack=ai-cofounder");

      const { packId, version } = manager.parsePackParams(params);

      expect(packId).toBe("ai-cofounder");
      expect(version).toBeUndefined();
    });

    it("should handle missing pack param", () => {
      const manager = getPackManager();
      const params = new URLSearchParams("?other=value");

      const { packId, version } = manager.parsePackParams(params);

      expect(packId).toBeUndefined();
      expect(version).toBeUndefined();
    });

    it("should load pack with version", async () => {
      const versionedPack = { 
        ...DEFAULT_CONTENT_PACK, 
        id: "ai-cofounder-v1-2-0",
        version: "1.2.0"
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => versionedPack,
      });

      const manager = getPackManager();
      const pack = await manager.loadPackWithVersion("ai-cofounder", "1.2.0");

      expect(pack.version).toBe("1.2.0");
      expect(pack.id).toContain("ai-cofounder");
    });

    it("should load pack without version when version not specified", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      const pack = await manager.loadPackWithVersion("ai-cofounder-v1");

      expect(pack.id).toBe("ai-cofounder-v1");
    });
  });

  describe("Load History - Task 4.4.11", () => {
    it("should track successful loads", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      await manager.loadPackFromUrl("https://example.com/pack.json");

      const history = manager.getLoadHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1]?.success).toBe(true);
    });

    it("should track failed loads", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Load failed"));

      const manager = getPackManager();
      
      try {
        await manager.loadPackFromUrl("https://example.com/bad.json");
      } catch (error) {
        // Expected
      }

      const history = manager.getLoadHistory();
      const failedEntry = history.find(h => !h.success);
      
      expect(failedEntry).toBeDefined();
      expect(failedEntry?.error).toContain("Load failed");
    });

    it("should include timestamps in load history", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      await manager.loadPackFromUrl("https://example.com/pack.json");

      const history = manager.getLoadHistory();
      const entry = history[history.length - 1];

      expect(entry?.timestamp).toBeDefined();
      expect(typeof entry?.timestamp).toBe("string");
    });

    it("should track pack IDs in load history", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      await manager.loadPackFromUrl("https://example.com/pack.json");

      const history = manager.getLoadHistory();
      const entry = history[history.length - 1];

      expect(entry?.packId).toBe("ai-cofounder-v1");
    });
  });

  describe("Dev Mode - Task 4.4.11", () => {
    it("should enable dev mode", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const manager = getPackManager();
      manager.enableDevMode(true);

      expect(manager.isDevMode()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Dev mode enabled")
      );

      consoleSpy.mockRestore();
    });

    it("should disable dev mode", () => {
      const manager = getPackManager();
      manager.enableDevMode(true);
      manager.enableDevMode(false);

      expect(manager.isDevMode()).toBe(false);
    });

    it("should log pack info when dev mode enabled", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const manager = getPackManager();
      manager.enableDevMode(true);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Loaded packs"),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Cache Management - Task 4.4.11", () => {
    it("should clear cache while preserving active pack", async () => {
      const pack1 = { ...DEFAULT_CONTENT_PACK, id: "pack1" };
      const pack2 = { ...DEFAULT_CONTENT_PACK, id: "pack2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack2,
        });

      const manager = getPackManager();

      await manager.switchToPack("pack1");
      await manager.loadPackFromUrl("https://example.com/pack2.json");

      expect(manager.listLoadedPacks().length).toBe(2);

      manager.clearCache();

      // Active pack should still be present (pack2 is the last loaded)
      expect(manager.getActivePack()?.id).toBe("pack2");
      expect(manager.listLoadedPacks()).toContain("pack2");
    });

    it("should reset manager to initial state", () => {
      const manager = getPackManager();
      manager.enableDevMode(true);

      manager.reset();

      expect(manager.isDevMode()).toBe(false);
      expect(manager.getActivePack()).toBeNull();
      expect(manager.listLoadedPacks()).toHaveLength(0);
      expect(manager.getLoadHistory()).toHaveLength(0);
    });
  });

  describe("Active Pack Management - Task 4.4.11", () => {
    it("should return null when no pack is active", () => {
      const manager = getPackManager();
      expect(manager.getActivePack()).toBeNull();
    });

    it("should return active pack after loading", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      await manager.loadPackFromUrl("https://example.com/pack.json");

      const activePack = manager.getActivePack();
      expect(activePack).not.toBeNull();
      expect(activePack?.id).toBe("ai-cofounder-v1");
    });

    it("should get active pack or default", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const manager = getPackManager();
      const pack = await manager.getActivePackOrDefault();

      expect(pack).toBeDefined();
      expect(pack.id).toBe("ai-cofounder-v1");
    });
  });

  describe("Convenience Functions - Task 4.4.11", () => {
    it("should load and activate pack from URL", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const pack = await loadAndActivatePack("https://example.com/pack.json");

      expect(pack.id).toBe("ai-cofounder-v1");
      expect(getPackManager().getActivePack()?.id).toBe("ai-cofounder-v1");
    });

    it("should load and activate pack from ID", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => DEFAULT_CONTENT_PACK,
      });

      const pack = await loadAndActivatePack("ai-cofounder-v1");

      expect(pack.id).toBe("ai-cofounder-v1");
      expect(getPackManager().getActivePack()?.id).toBe("ai-cofounder-v1");
    });
  });

  describe("Get Loaded Pack - Task 4.4.11", () => {
    it("should retrieve specific loaded pack", async () => {
      const pack1 = { ...DEFAULT_CONTENT_PACK, id: "pack1" };
      const pack2 = { ...DEFAULT_CONTENT_PACK, id: "pack2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => pack2,
        });

      const manager = getPackManager();
      
      await manager.switchToPack("pack1");
      await manager.switchToPack("pack2");

      const retrieved = manager.getLoadedPack("pack1");
      expect(retrieved?.id).toBe("pack1");
    });

    it("should return undefined for non-loaded pack", () => {
      const manager = getPackManager();
      const retrieved = manager.getLoadedPack("non-existent");

      expect(retrieved).toBeUndefined();
    });
  });
});

