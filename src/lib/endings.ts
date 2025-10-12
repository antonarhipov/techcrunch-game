/**
 * Endings System - Calculate final outcomes and generate personalized endings
 */

import type { Delta, EndingData } from "@/types/game";

/**
 * Ending tier thresholds and metadata
 */
const ENDING_TIERS = [
  {
    tier: "unicorn",
    emoji: "🦄",
    title: "Unicorn Success",
    min: 85,
    max: 100,
    description: "Against all odds, you built something truly extraordinary. Your AI cofounder SaaS is now valued at over $1B, with thousands of happy customers and a waitlist that keeps growing. Investors are fighting to get in on your next funding round.",
  },
  {
    tier: "scaling-up",
    emoji: "🚀",
    title: "Scaling Up Fast",
    min: 70,
    max: 84,
    description: "You've found product-market fit and growth is accelerating. Revenue is strong, customers love you, and you're hiring rapidly. The path to unicorn status is clear—you just need to execute.",
  },
  {
    tier: "gaining-steam",
    emoji: "⚡",
    title: "Gaining Momentum",
    min: 50,
    max: 69,
    description: "You're making solid progress with decent traction. Customers see value, revenue is growing steadily, and you've learned what works. You're not a rocket ship yet, but you're on the right trajectory.",
  },
  {
    tier: "finding-fit",
    emoji: "🌱",
    title: "Finding Product-Market Fit",
    min: 30,
    max: 49,
    description: "You've got something people want, but it's still early days. Some customers are paying, but growth is slow and challenges keep popping up. With persistence and iteration, you might break through.",
  },
  {
    tier: "scrappy",
    emoji: "🔧",
    title: "Scrappy Survival",
    min: 15,
    max: 29,
    description: "You're still alive, which counts for something. Revenue barely covers costs, technical debt is mounting, and you're firefighting daily. It's not pretty, but hey—some of the best startups started here.",
  },
  {
    tier: "crash",
    emoji: "💥",
    title: "Crash and Burn",
    min: 0,
    max: 14,
    description: "Despite your best efforts, things fell apart. The combination of technical challenges, market timing, and unfortunate setbacks proved too much. But every failed startup teaches lessons that fuel the next success.",
  },
];

/**
 * Dimension labels for player-facing text
 */
const DIMENSION_LABELS: Record<keyof Delta, string> = {
  R: "Revenue",
  U: "Users",
  S: "System",
  C: "Customers",
  I: "Investors",
};

/**
 * Calculate ending tier based on final meter value
 * @param finalMeter - Final meter value (0-100)
 * @returns Tier identifier
 */
export function calculateEndingTier(finalMeter: number): string {
  for (const tier of ENDING_TIERS) {
    if (finalMeter >= tier.min && finalMeter <= tier.max) {
      return tier.tier;
    }
  }
  // Fallback to crash if somehow out of range
  return "crash";
}

/**
 * Identify top 2 drivers (highest positive dimensions)
 * @param hiddenState - Final hidden state
 * @returns Array of dimension names (up to 2)
 */
export function identifyTopDrivers(hiddenState: Delta): string[] {
  // Convert to array of [dimension, value] pairs
  const entries = Object.entries(hiddenState) as [keyof Delta, number][];
  
  // Sort by value descending
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  
  // Take top 2 positive values
  const topTwo = sorted
    .filter(([_, value]) => value > 0)
    .slice(0, 2)
    .map(([dim]) => DIMENSION_LABELS[dim]);
  
  return topTwo.length > 0 ? topTwo : ["Persistence"]; // Fallback if no positives
}

/**
 * Identify main bottleneck (lowest dimension)
 * @param hiddenState - Final hidden state
 * @returns Dimension name
 */
export function identifyBottleneck(hiddenState: Delta): string {
  // Find dimension with lowest value
  const entries = Object.entries(hiddenState) as [keyof Delta, number][];
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  
  const lowestDim = sorted[0]?.[0];
  return lowestDim ? DIMENSION_LABELS[lowestDim] : "Everything";
}

/**
 * Generate next step suggestion based on bottleneck
 * @param bottleneck - The main bottleneck dimension
 * @param tier - The ending tier
 * @returns Actionable next step advice
 */
function generateNextStepSuggestion(bottleneck: string, tier: string): string {
  // High-tier endings: growth advice
  if (tier === "unicorn" || tier === "scaling-up") {
    const suggestions: Record<string, string> = {
      Revenue: "Focus on upselling and expanding to enterprise customers.",
      Users: "Launch referral program and viral features to accelerate growth.",
      System: "Invest in infrastructure to handle 10x scale before you need it.",
      Customers: "Build a world-class customer success team to reduce churn.",
      Investors: "Prepare for Series B—tell your story better and show the vision.",
      Everything: "Keep doing what you're doing, but prepare for the challenges of scale.",
    };
    return suggestions[bottleneck] ?? suggestions.Everything ?? "";
  }
  
  // Mid-tier endings: optimization advice
  if (tier === "gaining-steam" || tier === "finding-fit") {
    const suggestions: Record<string, string> = {
      Revenue: "Experiment with pricing—you might be leaving money on the table.",
      Users: "Double down on your best acquisition channel and optimize onboarding.",
      System: "Pay down technical debt before it slows you down further.",
      Customers: "Talk to churned customers to understand what went wrong.",
      Investors: "Get better at communicating your traction and momentum.",
      Everything: "Focus on one metric that matters most and improve it 2x.",
    };
    return suggestions[bottleneck] ?? suggestions.Everything ?? "";
  }
  
  // Low-tier endings: survival/pivot advice
  const suggestions: Record<string, string> = {
    Revenue: "Find one customer willing to pay 10x and solve their exact problem.",
    Users: "Start over with user research—you might be building the wrong thing.",
    System: "Stop adding features and fix what's broken first.",
    Customers: "Personally call every remaining customer. Save them before they churn.",
    Investors: "Cut burn rate immediately. Get to ramen profitability.",
    Everything: "Consider a pivot or acqui-hire. It's okay to move on to the next thing.",
  };
  return suggestions[bottleneck] ?? suggestions.Everything ?? "";
}

/**
 * Generate complete ending data based on final game state
 * @param finalMeter - Final meter value (0-100)
 * @param hiddenState - Final hidden state (R, U, S, C, I)
 * @returns Complete ending data with personalized text
 */
export function calculateEnding(finalMeter: number, hiddenState: Delta): EndingData {
  // Calculate tier
  const tierName = calculateEndingTier(finalMeter);
  const tierData = ENDING_TIERS.find(t => t.tier === tierName) ?? ENDING_TIERS[ENDING_TIERS.length - 1]!;
  
  // Identify strengths and weaknesses
  const topDrivers = identifyTopDrivers(hiddenState);
  const bottleneck = identifyBottleneck(hiddenState);
  
  // Generate personalized advice
  const nextStepSuggestion = generateNextStepSuggestion(bottleneck, tierName);
  
  return {
    tier: tierData.tier,
    emoji: tierData.emoji,
    title: tierData.title,
    description: tierData.description,
    topDrivers,
    bottleneck,
    nextStepSuggestion,
  };
}

/**
 * Get ending tier configuration by name
 * @param tierName - Tier identifier
 * @returns Tier configuration
 */
export function getEndingTierConfig(tierName: string) {
  return ENDING_TIERS.find(t => t.tier === tierName) || ENDING_TIERS[ENDING_TIERS.length - 1];
}

