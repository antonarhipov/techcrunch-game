/**
 * Unluck System - Regular Unluck and Perfect Storm
 * Adds unpredictable setbacks to the game for drama and realism
 */

import type { Delta, MeterConfig, SeededRNG, UnluckResult } from "@/types/game";

// ============================================================================
// Unluck Message Banks
// ============================================================================

/**
 * Unluck messages for each step/choice combination
 * Format: [stepId][choice] = array of messages
 */
const UNLUCK_MESSAGES: Record<number, Record<"A" | "B", string[]>> = {
  1: {
    A: [
      "Your payment processor rejected half your test transactions. Debugging payment flows is harder than expected.",
      "Stripe's webhook suddenly started failing intermittently. Customer complaints are piling up.",
      "A critical security flaw in your billing code forced you to pause subscriptions for a week.",
    ],
    B: [
      "Your investor dashboard had a major data leak. Had to spend weeks rebuilding trust and security.",
      "The analytics integration broke right before your investor demo. They're questioning your technical competence.",
      "Your metrics tracking service went down, leaving you blind to key investor KPIs for days.",
    ],
  },
  2: {
    A: [
      "Your landing page got flagged as spam by Google. Organic traffic dropped to zero overnight.",
      "A competitor launched an identical landing page and outbid you on all your keywords.",
      "Your CDN provider had an outage. The landing page was unreachable during your ProductHunt launch.",
    ],
    B: [
      "Your onboarding emails are landing in spam folders. Activation rates plummeted.",
      "SendGrid suspended your account for suspicious activity. Lost all your onboarding sequences.",
      "A typo in the welcome email sent users to a 404 page. Most never came back.",
    ],
  },
  3: {
    A: [
      "Collaboration features introduced a race condition bug. Users are experiencing data corruption.",
      "Real-time sync is causing database locks. Performance degraded for all users.",
      "A permissions bug exposed some users' data to their collaborators. Major trust breach.",
    ],
    B: [
      "Your analytics dashboard is showing wrong numbers. Users lost confidence in your product.",
      "The charting library has a memory leak. Dashboards crash browsers on large datasets.",
      "Analytics data got corrupted during a migration. Historical reports are unusable.",
    ],
  },
  4: {
    A: [
      "Auto-scaling kicked in too aggressively. Your AWS bill tripled overnight.",
      "Kubernetes cluster had a cascading failure. Services were down for hours.",
      "A misconfigured load balancer sent all traffic to one server, causing a complete outage.",
    ],
    B: [
      "AI support bot started giving wrong answers. Customer satisfaction dropped sharply.",
      "The ML model needs retraining with your specific data. It's worse than human support right now.",
      "AI chatbot got stuck in loops with frustrated users. PR nightmare on social media.",
    ],
  },
  5: {
    A: [
      "Translation quality is terrible. International users are complaining loudly.",
      "Right-to-left language support broke your entire UI. Middle East launch postponed.",
      "Localization introduced XSS vulnerabilities. Security audit failed.",
    ],
    B: [
      "International payment processor has surprise 3% fees. Margins destroyed.",
      "Currency conversion rates are updating with a 2-hour delay. Users getting incorrect pricing.",
      "Payment fraud from certain countries forced you to block entire regions. Revenue hit.",
    ],
  },
};

/**
 * Perfect Storm messages (dramatic system-collapse scenarios)
 */
const PERFECT_STORM_MESSAGES: string[] = [
  "💥 PERFECT STORM: AI support overloaded → database meltdown → cascading failures across all services!",
  "💥 PERFECT STORM: Critical bug in AI response logic corrupted customer data → emergency rollback → lost 48 hours of growth!",
  "💥 PERFECT STORM: Chatbot went rogue and started cancelling subscriptions → manual recovery took days!",
  "💥 PERFECT STORM: AI training data leaked PII → regulatory investigation → all resources diverted to compliance!",
  "💥 PERFECT STORM: ML model became racist → viral Twitter backlash → major customers churned!",
  "💥 PERFECT STORM: Chatbot outage during Black Friday → angry mob of customers → refunds wiped out revenue!",
  "💥 PERFECT STORM: AI hallucinations gave legal advice → lawsuit incoming → investor panic!",
  "💥 PERFECT STORM: Support bot costs spiraling out of control → OpenAI bill exceeded revenue → emergency shutdown!",
];

// ============================================================================
// Regular Unluck Functions
// ============================================================================

/**
 * Roll for unluck occurrence
 * @param rng - Seeded random number generator
 * @param config - Meter configuration with unluck probability
 * @param forceUnluck - Force unluck to trigger (for testing)
 * @returns True if unluck triggers
 */
export function rollUnluck(
  rng: SeededRNG,
  config: MeterConfig,
  forceUnluck: boolean
): boolean {
  if (forceUnluck) {
    return true;
  }

  if (!config.unluck.enabled) {
    return false;
  }

  const roll = rng.next();
  return roll < config.unluck.probability;
}

/**
 * Generate luck factor within configured range
 * @param rng - Seeded random number generator
 * @param factorRange - Min and max factor range
 * @param override - Optional override value (for operator mode)
 * @returns Luck factor (e.g., 0.5 = reduce gains to 50%)
 */
export function generateLuckFactor(
  rng: SeededRNG,
  factorRange: [number, number],
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }

  const [min, max] = factorRange;
  return rng.nextFloat(min, max);
}

/**
 * Apply unluck to deltas by scaling positive values only
 * Negative values (tradeoffs) are preserved
 * @param delta - Original delta
 * @param luckFactor - Factor to scale positive values (0.0-1.0)
 * @returns Modified delta
 */
export function applyUnluckToDeltas(delta: Delta, luckFactor: number): Delta {
  return {
    R: delta.R > 0 ? delta.R * luckFactor : delta.R,
    U: delta.U > 0 ? delta.U * luckFactor : delta.U,
    S: delta.S > 0 ? delta.S * luckFactor : delta.S,
    C: delta.C > 0 ? delta.C * luckFactor : delta.C,
    I: delta.I > 0 ? delta.I * luckFactor : delta.I,
  };
}

/**
 * Get unluck message for a specific step/choice
 * @param stepId - Step ID (1-5)
 * @param choice - Choice made ("A" or "B")
 * @param rng - Seeded random number generator
 * @returns Contextual unluck message
 */
export function getUnluckMessage(
  stepId: number,
  choice: "A" | "B",
  rng: SeededRNG
): string {
  const messages = UNLUCK_MESSAGES[stepId]?.[choice];
  
  if (!messages || messages.length === 0) {
    return "Something unexpected went wrong, but you'll recover.";
  }

  const index = rng.nextInt(0, messages.length - 1);
  return messages[index] ?? messages[0] ?? "Something unexpected went wrong, but you'll recover.";
}

// ============================================================================
// Perfect Storm Functions
// ============================================================================

/**
 * Check if Perfect Storm conditions are met
 * @param stepId - Current step ID
 * @param choice - Choice made
 * @param unluckOccurred - Whether regular unluck was triggered
 * @returns True if Perfect Storm should be checked
 */
export function shouldCheckPerfectStorm(
  stepId: number,
  choice: "A" | "B",
  unluckOccurred: boolean
): boolean {
  return stepId === 4 && choice === "B" && unluckOccurred === true;
}

/**
 * Roll for Perfect Storm occurrence
 * @param rng - Seeded random number generator
 * @param config - Meter configuration
 * @param forcePerfectStorm - Force Perfect Storm (for testing)
 * @returns True if Perfect Storm triggers
 */
export function rollPerfectStorm(
  rng: SeededRNG,
  config: MeterConfig,
  forcePerfectStorm: boolean
): boolean {
  if (forcePerfectStorm) {
    return true;
  }

  if (!config.specialUnluck.enabled) {
    return false;
  }

  const roll = rng.next();
  return roll < config.specialUnluck.probability;
}

/**
 * Apply Perfect Storm penalties on top of regular unluck
 * These are MORE SEVERE than regular unluck
 * @param delta - Delta after regular unluck
 * @param config - Meter configuration with penalty factors
 * @returns Delta with Perfect Storm penalties applied
 */
export function applyPerfectStormPenalties(
  delta: Delta,
  config: MeterConfig
): Delta {
  const { scalingGainsReduction, usersReduction, customersReduction, investorsReduction } =
    config.specialUnluck;

  return {
    // R (Revenue) and S (System): Additional reduction to positive values only
    R: delta.R > 0 ? delta.R * (1 - scalingGainsReduction) : delta.R,
    S: delta.S > 0 ? delta.S * (1 - scalingGainsReduction) : delta.S,
    
    // U (Users): Reduce both positive and negative
    U: delta.U * (1 - usersReduction),
    
    // C (Customers): Reduce both positive and negative
    C: delta.C * (1 - customersReduction),
    
    // I (Investors): Reduce both positive and negative
    I: delta.I * (1 - investorsReduction),
  };
}

/**
 * Get Perfect Storm message
 * @param rng - Seeded random number generator
 * @returns Dramatic Perfect Storm message
 */
export function getPerfectStormMessage(rng: SeededRNG): string {
  const index = rng.nextInt(0, PERFECT_STORM_MESSAGES.length - 1);
  return PERFECT_STORM_MESSAGES[index] ?? PERFECT_STORM_MESSAGES[0] ?? "💥 PERFECT STORM: Everything collapsed at once!";
}

// ============================================================================
// Unluck Result Creation
// ============================================================================

/**
 * Create UnluckResult object
 * @param unluckApplied - Whether any unluck was applied
 * @param luckFactor - Luck factor used (1.0 if no unluck)
 * @param message - Message to show user (null if no unluck)
 * @param perfectStorm - Whether Perfect Storm occurred
 * @returns UnluckResult object
 */
export function createUnluckResult(
  unluckApplied: boolean,
  luckFactor: number,
  message: string | null,
  perfectStorm: boolean
): UnluckResult {
  return {
    unluckApplied,
    luckFactor,
    message,
    perfectStorm,
  };
}

// ============================================================================
// Unluck Processing Orchestration
// ============================================================================

/**
 * Process unluck for a step choice
 * CRITICAL: Maintains strict RNG call order for determinism
 * 
 * RNG Call Order (MUST BE CONSISTENT):
 * 1. Roll for regular unluck
 * 2. Generate luck factor (if unluck triggered)
 * 3. Select unluck message (if unluck triggered)
 * 4. Roll for Perfect Storm (if conditions met)
 * 5. Select Perfect Storm message (if Perfect Storm triggered)
 * 
 * @param stepId - Step ID (1-5)
 * @param choice - Choice made ("A" or "B")
 * @param delta - Original delta
 * @param rng - Seeded random number generator
 * @param config - Meter configuration
 * @param options - Unluck options (force flags, overrides)
 * @returns Modified delta and unluck result
 */
export function processUnluck(
  stepId: number,
  choice: "A" | "B",
  delta: Delta,
  rng: SeededRNG,
  config: MeterConfig,
  options: {
    forceUnluck?: boolean;
    forcePerfectStorm?: boolean;
    unluckFactorOverride?: number;
  } = {}
): { finalDelta: Delta; result: UnluckResult } {
  // Step 1: Roll for regular unluck
  const unluckTriggered = rollUnluck(rng, config, options.forceUnluck || false);

  if (!unluckTriggered) {
    // No unluck - return original delta
    return {
      finalDelta: delta,
      result: createUnluckResult(false, 1.0, null, false),
    };
  }

  // Step 2: Generate luck factor
  const luckFactor = generateLuckFactor(
    rng,
    config.unluck.factorRange,
    options.unluckFactorOverride
  );

  // Step 3: Get unluck message
  const unluckMessage = getUnluckMessage(stepId, choice, rng);

  // Step 4: Apply regular unluck
  let modifiedDelta = applyUnluckToDeltas(delta, luckFactor);

  // Step 5: Check for Perfect Storm
  const shouldCheckPS = shouldCheckPerfectStorm(stepId, choice, unluckTriggered);
  let perfectStormTriggered = false;
  let finalMessage = unluckMessage;

  if (shouldCheckPS) {
    perfectStormTriggered = rollPerfectStorm(
      rng,
      config,
      options.forcePerfectStorm || false
    );

    if (perfectStormTriggered) {
      // Step 6: Apply Perfect Storm penalties
      modifiedDelta = applyPerfectStormPenalties(modifiedDelta, config);
      
      // Step 7: Get Perfect Storm message
      finalMessage = getPerfectStormMessage(rng);
    }
  }

  return {
    finalDelta: modifiedDelta,
    result: createUnluckResult(true, luckFactor, finalMessage, perfectStormTriggered),
  };
}

