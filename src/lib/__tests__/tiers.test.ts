/**
 * Unit tests for Tier System
 * Task 2.4.8
 */

import {
  calculateTier,
  getTierConfig,
  getTierConfigByValue,
  didTierChange,
  getAllTierConfigs,
  getTierColorClass,
  getTierGradientClass,
} from "../tiers";
import type { MeterTier } from "@/types/game";

describe("Tier System", () => {
  describe("calculateTier()", () => {
    describe("Tier Boundaries", () => {
      it("should return crash for values 0-29", () => {
        expect(calculateTier(0)).toBe("crash");
        expect(calculateTier(15)).toBe("crash");
        expect(calculateTier(29)).toBe("crash");
        expect(calculateTier(29.9)).toBe("crash");
      });

      it("should return finding-fit for values 30-49", () => {
        expect(calculateTier(30)).toBe("finding-fit");
        expect(calculateTier(40)).toBe("finding-fit");
        expect(calculateTier(49)).toBe("finding-fit");
        expect(calculateTier(49.9)).toBe("finding-fit");
      });

      it("should return gaining-steam for values 50-69", () => {
        expect(calculateTier(50)).toBe("gaining-steam");
        expect(calculateTier(60)).toBe("gaining-steam");
        expect(calculateTier(69)).toBe("gaining-steam");
        expect(calculateTier(69.9)).toBe("gaining-steam");
      });

      it("should return scaling-up for values 70-84", () => {
        expect(calculateTier(70)).toBe("scaling-up");
        expect(calculateTier(77)).toBe("scaling-up");
        expect(calculateTier(84)).toBe("scaling-up");
        expect(calculateTier(84.9)).toBe("scaling-up");
      });

      it("should return breakout for values 85-100", () => {
        expect(calculateTier(85)).toBe("breakout");
        expect(calculateTier(90)).toBe("breakout");
        expect(calculateTier(100)).toBe("breakout");
      });

      it("should handle exact boundary values correctly", () => {
        expect(calculateTier(29.99)).toBe("crash");
        expect(calculateTier(30.0)).toBe("finding-fit");
        expect(calculateTier(49.99)).toBe("finding-fit");
        expect(calculateTier(50.0)).toBe("gaining-steam");
        expect(calculateTier(69.99)).toBe("gaining-steam");
        expect(calculateTier(70.0)).toBe("scaling-up");
        expect(calculateTier(84.99)).toBe("scaling-up");
        expect(calculateTier(85.0)).toBe("breakout");
      });
    });

    describe("Edge Cases", () => {
      it("should clamp values below 0 to crash tier", () => {
        expect(calculateTier(-10)).toBe("crash");
        expect(calculateTier(-0.1)).toBe("crash");
      });

      it("should clamp values above 100 to breakout tier", () => {
        expect(calculateTier(101)).toBe("breakout");
        expect(calculateTier(1000)).toBe("breakout");
      });
    });
  });

  describe("getTierConfig()", () => {
    it("should return correct config for crash tier", () => {
      const config = getTierConfig("crash");

      expect(config.label).toBe("Crash");
      expect(config.emoji).toBe("🚧");
      expect(config.min).toBe(0);
      expect(config.max).toBe(29);
      expect(config.description).toBeTruthy();
    });

    it("should return correct config for finding-fit tier", () => {
      const config = getTierConfig("finding-fit");

      expect(config.label).toBe("Finding Fit");
      expect(config.emoji).toBe("🌱");
      expect(config.min).toBe(30);
      expect(config.max).toBe(49);
    });

    it("should return correct config for gaining-steam tier", () => {
      const config = getTierConfig("gaining-steam");

      expect(config.label).toBe("Gaining Steam");
      expect(config.emoji).toBe("⚡");
      expect(config.min).toBe(50);
      expect(config.max).toBe(69);
    });

    it("should return correct config for scaling-up tier", () => {
      const config = getTierConfig("scaling-up");

      expect(config.label).toBe("Scaling Up");
      expect(config.emoji).toBe("🚀");
      expect(config.min).toBe(70);
      expect(config.max).toBe(84);
    });

    it("should return correct config for breakout tier", () => {
      const config = getTierConfig("breakout");

      expect(config.label).toBe("Breakout");
      expect(config.emoji).toBe("🦄");
      expect(config.min).toBe(85);
      expect(config.max).toBe(100);
    });
  });

  describe("Emoji and Label Mappings", () => {
    it("should have correct emoji for each tier", () => {
      expect(getTierConfig("crash").emoji).toBe("🚧");
      expect(getTierConfig("finding-fit").emoji).toBe("🌱");
      expect(getTierConfig("gaining-steam").emoji).toBe("⚡");
      expect(getTierConfig("scaling-up").emoji).toBe("🚀");
      expect(getTierConfig("breakout").emoji).toBe("🦄");
    });

    it("should have correct labels for each tier", () => {
      expect(getTierConfig("crash").label).toBe("Crash");
      expect(getTierConfig("finding-fit").label).toBe("Finding Fit");
      expect(getTierConfig("gaining-steam").label).toBe("Gaining Steam");
      expect(getTierConfig("scaling-up").label).toBe("Scaling Up");
      expect(getTierConfig("breakout").label).toBe("Breakout");
    });

    it("should have descriptions for all tiers", () => {
      const tiers: MeterTier[] = [
        "crash",
        "finding-fit",
        "gaining-steam",
        "scaling-up",
        "breakout",
      ];

      for (const tier of tiers) {
        const config = getTierConfig(tier);
        expect(config.description).toBeTruthy();
        expect(config.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getTierConfigByValue()", () => {
    it("should return correct tier config based on meter value", () => {
      expect(getTierConfigByValue(0).label).toBe("Crash");
      expect(getTierConfigByValue(35).label).toBe("Finding Fit");
      expect(getTierConfigByValue(55).label).toBe("Gaining Steam");
      expect(getTierConfigByValue(75).label).toBe("Scaling Up");
      expect(getTierConfigByValue(90).label).toBe("Breakout");
    });
  });

  describe("didTierChange()", () => {
    it("should return false when tier stays the same", () => {
      expect(didTierChange(10, 20)).toBe(false); // Both crash
      expect(didTierChange(35, 40)).toBe(false); // Both finding-fit
      expect(didTierChange(55, 60)).toBe(false); // Both gaining-steam
    });

    it("should return true when tier changes upward", () => {
      expect(didTierChange(25, 35)).toBe(true); // crash → finding-fit
      expect(didTierChange(45, 55)).toBe(true); // finding-fit → gaining-steam
      expect(didTierChange(65, 75)).toBe(true); // gaining-steam → scaling-up
      expect(didTierChange(80, 90)).toBe(true); // scaling-up → breakout
    });

    it("should return true when tier changes downward", () => {
      expect(didTierChange(90, 80)).toBe(true); // breakout → scaling-up
      expect(didTierChange(75, 65)).toBe(true); // scaling-up → gaining-steam
      expect(didTierChange(55, 45)).toBe(true); // gaining-steam → finding-fit
      expect(didTierChange(35, 25)).toBe(true); // finding-fit → crash
    });

    it("should detect tier change at exact boundaries", () => {
      expect(didTierChange(29, 30)).toBe(true);
      expect(didTierChange(49, 50)).toBe(true);
      expect(didTierChange(69, 70)).toBe(true);
      expect(didTierChange(84, 85)).toBe(true);
    });
  });

  describe("getAllTierConfigs()", () => {
    it("should return all 5 tier configs", () => {
      const configs = getAllTierConfigs();
      expect(configs.length).toBe(5);
    });

    it("should return tiers in ascending order", () => {
      const configs = getAllTierConfigs();

      expect(configs[0].label).toBe("Crash");
      expect(configs[1].label).toBe("Finding Fit");
      expect(configs[2].label).toBe("Gaining Steam");
      expect(configs[3].label).toBe("Scaling Up");
      expect(configs[4].label).toBe("Breakout");
    });

    it("should have continuous tier ranges", () => {
      const configs = getAllTierConfigs();

      for (let i = 0; i < configs.length - 1; i++) {
        const current = configs[i];
        const next = configs[i + 1];

        // Next tier should start one unit after current tier ends
        expect(next.min).toBe(current.max + 1);
      }
    });
  });

  describe("getTierColorClass()", () => {
    it("should return color classes for all tiers", () => {
      expect(getTierColorClass("crash")).toContain("red");
      expect(getTierColorClass("finding-fit")).toContain("orange");
      expect(getTierColorClass("gaining-steam")).toContain("yellow");
      expect(getTierColorClass("scaling-up")).toContain("green");
      expect(getTierColorClass("breakout")).toContain("purple");
    });

    it("should return Tailwind-compatible classes", () => {
      const tiers: MeterTier[] = [
        "crash",
        "finding-fit",
        "gaining-steam",
        "scaling-up",
        "breakout",
      ];

      for (const tier of tiers) {
        const colorClass = getTierColorClass(tier);
        expect(colorClass).toMatch(/^text-/);
      }
    });
  });

  describe("getTierGradientClass()", () => {
    it("should return gradient classes for all tiers", () => {
      expect(getTierGradientClass("crash")).toContain("red");
      expect(getTierGradientClass("finding-fit")).toContain("orange");
      expect(getTierGradientClass("gaining-steam")).toContain("yellow");
      expect(getTierGradientClass("scaling-up")).toContain("purple");
      expect(getTierGradientClass("breakout")).toContain("purple");
    });

    it("should return Tailwind-compatible gradient classes", () => {
      const tiers: MeterTier[] = [
        "crash",
        "finding-fit",
        "gaining-steam",
        "scaling-up",
        "breakout",
      ];

      for (const tier of tiers) {
        const gradientClass = getTierGradientClass(tier);
        expect(gradientClass).toMatch(/^from-/);
        expect(gradientClass).toContain("to-");
      }
    });
  });
});

