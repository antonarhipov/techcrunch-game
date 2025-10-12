/**
 * Tier system for the scaling meter
 * Maps meter values to tier levels with display configuration
 */

import type { MeterTier, TierConfig } from "@/types/game";

/**
 * Tier configurations with display information
 */
const TIER_CONFIGS: Record<MeterTier, TierConfig> = {
  crash: {
    label: "Crash",
    emoji: "🚧",
    description: "Struggling to survive",
    min: 0,
    max: 29,
  },
  "finding-fit": {
    label: "Finding Fit",
    emoji: "🌱",
    description: "Early progress",
    min: 30,
    max: 49,
  },
  "gaining-steam": {
    label: "Gaining Steam",
    emoji: "⚡",
    description: "Momentum building",
    min: 50,
    max: 69,
  },
  "scaling-up": {
    label: "Scaling Up",
    emoji: "🚀",
    description: "Rapid growth",
    min: 70,
    max: 84,
  },
  breakout: {
    label: "Breakout",
    emoji: "🦄",
    description: "Unicorn trajectory",
    min: 85,
    max: 100,
  },
};

/**
 * Calculate tier based on meter value
 * @param meterValue - Current meter value (0-100)
 * @returns Corresponding tier
 */
export function calculateTier(meterValue: number): MeterTier {
  // Clamp value to valid range
  const value = Math.max(0, Math.min(100, meterValue));

  // Map to tier based on thresholds
  if (value >= 85) return "breakout";
  if (value >= 70) return "scaling-up";
  if (value >= 50) return "gaining-steam";
  if (value >= 30) return "finding-fit";
  return "crash";
}

/**
 * Get tier configuration for a given tier
 * @param tier - The tier to get config for
 * @returns Tier configuration
 */
export function getTierConfig(tier: MeterTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Get tier configuration for a given meter value
 * @param meterValue - Current meter value (0-100)
 * @returns Tier configuration
 */
export function getTierConfigByValue(meterValue: number): TierConfig {
  const tier = calculateTier(meterValue);
  return getTierConfig(tier);
}

/**
 * Check if meter value crossed a tier boundary
 * @param oldValue - Previous meter value
 * @param newValue - New meter value
 * @returns True if tier changed
 */
export function didTierChange(oldValue: number, newValue: number): boolean {
  const oldTier = calculateTier(oldValue);
  const newTier = calculateTier(newValue);
  return oldTier !== newTier;
}

/**
 * Get all tier configurations ordered from lowest to highest
 * @returns Array of tier configs
 */
export function getAllTierConfigs(): TierConfig[] {
  return [
    TIER_CONFIGS.crash,
    TIER_CONFIGS["finding-fit"],
    TIER_CONFIGS["gaining-steam"],
    TIER_CONFIGS["scaling-up"],
    TIER_CONFIGS.breakout,
  ];
}

/**
 * Get color class for tier (for UI styling)
 * @param tier - The tier
 * @returns Tailwind color class
 */
export function getTierColorClass(tier: MeterTier): string {
  switch (tier) {
    case "crash":
      return "text-red-500";
    case "finding-fit":
      return "text-orange-500";
    case "gaining-steam":
      return "text-yellow-500";
    case "scaling-up":
      return "text-green-500";
    case "breakout":
      return "text-purple-500";
  }
}

/**
 * Get background gradient class for tier (for UI styling)
 * @param tier - The tier
 * @returns Tailwind gradient class
 */
export function getTierGradientClass(tier: MeterTier): string {
  switch (tier) {
    case "crash":
      return "from-red-500 to-red-700";
    case "finding-fit":
      return "from-orange-500 to-orange-700";
    case "gaining-steam":
      return "from-orange-500 to-yellow-500";
    case "scaling-up":
      return "from-purple-500 to-purple-700";
    case "breakout":
      return "from-purple-600 to-orange-500";
  }
}

