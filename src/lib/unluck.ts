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
      "Stripe rolled a silent API version at 3 a.m. Subscriptions ‘renewed’ into a black hole. It’s not you, it’s webhooks.",
      "Card network hiccup: global 3‑D Secure timeouts. Customers tried, the bank said ‘nah.’ Revenue took a power nap.",
      "Risk team flagged your account for ‘suspicious growth.’ Congrats on being too good. Funds: temporarily on museum display.",
      "Apple Pay domain verification expired because calendars are human. Checkouts looked fine, payments went sightseeing.",
      "FX provider sneezed. EUR↔USD rates stalled mid‑swipe. Payments queued politely like British people.",
    ],
    B: [
      "BigQuery quota got ‘optimistically’ auto‑reduced. The only metric up is ‘queries denied.’ Board saw a minimalist dashboard.",
      "Analytics vendor status page turned ‘chartreuse’ (worse than orange). Graphs rendered as performance art.",
      "Chrome auto‑updated; your canvas charts discovered modern fragility. Investors enjoyed a slideshow of error toasts.",
      "SOC 2 auditors: ‘No screenshots in decks.’ Redacted dashboards now look extremely compliant.",
      "Background job backfilled to the wrong month. MRR time‑traveled to last August. Investors love sci‑fi, right?",
    ],
  },
  2: {
    A: [
      "Google’s Core Update decided you’re actually a bakery. Rankings proofed, then fell flat. Croissants, anyone?",
      "Cloudflare’s bot fight mistook your visitors for extremely polite bots. Bounce rate speed‑ran a world record.",
      "EU cookie banner overlapped the CTA on mobile. Conversion rate hid under ‘Manage Preferences.’",
      "Competitor bought the one vowel your domain needs. Half your traffic visits ‘aicofounderr.com’ (two r’s, zero mercy).",
      "A/B test shipped 100% variant ‘C’ by accident. It was the one without a signup button. Bold choice.",
    ],
    B: [
      "Gmail politely filed you under ‘Promotions and chill.’ Welcome sequence performed to an empty room.",
      "DMARC alignment drifted by one character. ISPs collectively said ‘who dis?’ and parked your emails in the void.",
      "Link shortener domain got blocklisted mid‑send. Every ‘Get Started’ became ‘Get Suspicious.’",
      "Daylight Saving flipped the scheduler. ‘Welcome aboard’ arrived yesterday. Time is a flat circle.",
      "Apple Mail privacy filtered opens into oblivion. Your cohort ‘loves’ every email. Sadly, they do not exist.",
    ],
  },
  3: {
    A: [
      "Slack took a wellness day. Team mentions vanished; adoption looked like a ghost town with great lighting.",
      "Permissions calc overflowed in one enterprise workspace. Everyone became ‘viewer.’ Collaboration, but make it museum.",
      "WebSocket provider had a brief identity crisis. Presence showed 0 users and 37 ghosts.",
      "EU data residency toggled itself helpful. Cross‑region sharing became cross‑stitching: pretty, not useful.",
      "Calendar invites rendered as ICS hieroglyphs. Meetings existed in theory, like unicorns and bug‑free Fridays.",
    ],
    B: [
      "A botnet discovered your signup form captivating. DAU doubled. Sadly, all named ‘asdf.’",
      "Apple’s ITP put cookies on a keto diet. Retention graphs lost 20% water weight overnight.",
      "Timezone math counted tomorrow twice. Churn appears negative (investors briefly celebrated a perpetual motion machine).",
      "GDPR deletion job got zealous and deleted the cohort too. Privacy: impeccable. Data: also gone.",
      "ETL ran in ‘creative join’ mode. Trials joined with payments, then divorced assets amicably.",
    ],
  },
  4: {
    A: [
      "us‑east‑1 sneezed. Your pods practiced musical chairs; the database didn’t get a seat.",
      "Rate limits were theoretical. The internet conducted a practical exam. 10/10 would throttle again.",
      "Cache warmed perfectly… with yesterday’s keys. Hot path took the scenic route through the origin.",
      "Noisy neighbor on the shared cluster benchmarked Bitcoin on your node. Latency cosplayed as suspense.",
      "Autoscaling did great and your AWS bill discovered exponential functions. Finance discovered deep breathing.",
    ],
    B: [
      "Model provider silently swapped versions. Your bot now answers like a philosophy TA on espresso.",
      "Moderation false‑positived ‘I forgot my password’ as ‘international intrigue.’ Tickets escalated to Interpol.",
      "Embeddings index started a rebuild mid‑surge. The bot ‘remembers’ everything except answers.",
      "Vendor rate limit hit the exact minute Tech Twitter found you. The bot learned to type ‘…’ thoughtfully.",
      "Knowledge base cached pre‑launch docs. Bot insists pricing is ‘$0 forever (beta).’ The internet took notes.",
    ],
  },
  5: {
    A: [
      "Right‑to‑left layout flipped your UI like a pancake. Buttons migrated west for the winter.",
      "Pluralization rules in Polish unlocked ‘7 forms of ‘founder.’’ You implemented 6. Linguists applauded the attempt.",
      "CJK glyphs rendered as tofu. Your witty copy became a Michelin‑starred rectangle tasting menu.",
      "Decimal commas made prices look 10× larger in Europe. Users very impressed, slightly terrified.",
      "Machine translation lovingly turned ‘Sign Up’ into ‘Give Up.’ Conversion rates complied.",
    ],
    B: [
      "Acquirer triggered enhanced due diligence. Money took a study abroad semester.",
      "PSD2 step‑up auth popped mid‑checkout and half of Italy went for espresso instead.",
      "Brazil’s PIX wanted one more document. And then 46 more. Funds doing a samba in place.",
      "IN RBI guidelines shifted on a Friday. UPI tests passed; production asked for your birth chart.",
      "Bank holiday in three countries you charge in. Settlements took a long weekend.",
    ],
  },
};

/**
 * Perfect Storm messages (dramatic system-collapse scenarios)
 */
const PERFECT_STORM_MESSAGES: string[] = [
  "💥 PERFECT STORM: Viral spike + model limits + stale cache. Users sprinted in; answers jogged out.",
  "💥 PERFECT STORM: Everything, everywhere, all at once—throttles, timeouts, and a chatbot having an existential crisis.",
  "💥 PERFECT STORM: Systems melting, support drowning, investors live‑tweeting. You did nothing wrong except get popular.",
  "💥 PERFECT STORM: The LLM unionized and demanded better infrastructure. Negotiations ongoing; outcomes pending.",
  "💥 PERFECT STORM: Cache stampede met thread pool famine. The only thing scaling is your incident channel.",
  "💥 PERFECT STORM: Observability worked perfectly; it observed the downfall in 4K.",
  "💥 PERFECT STORM: Vendor status: ‘Investigating.’ Customer status: ‘Investigative journalists.’",
  "💥 PERFECT STORM: The chatbot answered ‘42’ to everything. Sadly, that wasn’t anyone’s order number.",
  "💥 PERFECT STORM: Partial internet brownout plus DNS gremlins. Your domain played peek‑a‑boo with the world.",
  "💥 PERFECT STORM: Triage complete: nothing you pushed, everything they broke. Gains sent on an all‑inclusive retreat.",
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

// Helper: compute weighted impact sign for deciding unluck mode
function computeWeightedImpact(delta: Delta, weights: MeterConfig["weights"]): number {
  return (
    delta.R * weights.R +
    delta.U * weights.U +
    delta.S * weights.S +
    delta.C * weights.C +
    delta.I * weights.I
  );
}

// Helper: amplify only negative components by a factor (>1 makes losses worse)
function amplifyNegatives(delta: Delta, factor: number): Delta {
  return {
    R: delta.R < 0 ? delta.R * factor : delta.R,
    U: delta.U < 0 ? delta.U * factor : delta.U,
    S: delta.S < 0 ? delta.S * factor : delta.S,
    C: delta.C < 0 ? delta.C * factor : delta.C,
    I: delta.I < 0 ? delta.I * factor : delta.I,
  };
}

// Helper: scale down only positive components by a factor in [0,1]
function scalePositives(delta: Delta, factor: number): Delta {
  return {
    R: delta.R > 0 ? delta.R * factor : delta.R,
    U: delta.U > 0 ? delta.U * factor : delta.U,
    S: delta.S > 0 ? delta.S * factor : delta.S,
    C: delta.C > 0 ? delta.C * factor : delta.C,
    I: delta.I > 0 ? delta.I * factor : delta.I,
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

  // Symmetric scaling per dimension: positives reduced, negatives amplified
  const sym = (value: number, reduction: number) =>
    value >= 0 ? value * (1 - reduction) : value * (1 + reduction);

  return {
    // R (Revenue) and S (System): Use scalingGainsReduction symmetrically
    R: sym(delta.R, scalingGainsReduction),
    S: sym(delta.S, scalingGainsReduction),

    // U (Users): Use usersReduction symmetrically
    U: sym(delta.U, usersReduction),

    // C (Customers): Use customersReduction symmetrically
    C: sym(delta.C, customersReduction),

    // I (Investors): Use investorsReduction symmetrically
    I: sym(delta.I, investorsReduction),
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

  // Step 4: Apply regular unluck (respect sign of weighted impact)
  const weightedImpact = computeWeightedImpact(delta, config.weights);

  let modifiedDelta = weightedImpact >= 0
    ? scalePositives(delta, luckFactor)                      // reduce gains
    : amplifyNegatives(delta, 2 - luckFactor);               // amplify losses

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

