# Unluck Design 🎯
•	Trigger frequency: 10% per step (independent roll).
•	Effect: Reduces the positive gain of that step by a factor.
•	Narrative: Always contextual — something in the startup world sabotages your otherwise solid choice.

## Perfect Storm (Step 4 Option B) 💥
•	Trigger condition: Only when regular unluck occurs on Step 4 Option B (AI Support Chatbot).
•	Double roll: If regular unluck triggers, roll again for special unluck (100% chance by default).
•	Perfect Storm penalties: 
  - Additional 50% reduction to scaling gains (on top of regular unluck)
  - 50% reduction to Users (U) parameter
  - 70% reduction to Customers (C) parameter
  - 40% reduction to Investors (I) parameter
•	Narrative: System collapse messages about not investing in system stability ("You thought you could get away with this!? Perfect Storm incoming!")

# Formula Update with Unluck ⚖️

## Existing (simplified)
score_raw = wR*R + wU*U + wS*S + wC*C + wI*I
meter = f(score_raw) + small_noise

## With Unluck
•	When triggered:
•	Apply penalty factor to the step delta only.
•	Don’t erase overall progress — just cut the gain for that step.

if Unluck:
    step_delta = step_delta * luck_factor
    // luck_factor between 0.4 and 0.7

•	So:
	•	You still move forward, but visibly less.
	•	Meter shows “red spark” animation + overlay explanation text.

## Example
•	Step 2B (Onboarding emails): normally ΔC = +8.
•	Unluck event: “Onboarding emails went to spam.”
•	Apply factor 0.5 → ΔC = +4.
•	Narrative: “You set up great onboarding, but Gmail decided your AI Cofounder is a Nigerian Prince. Gains halved.”

# Gameplay Explanation 🎮

When Unluck happens:
•	Show a popup balloon in the agent console with snarky text.
•	Example:
“Oh, brutal! You picked the right feature, but the payment processor froze your account. Gains cut in half.”

Make the Unluck events tightly context-aware, so each one matches the specific option the player picked. This way, the game feels “personal” when bad luck hits.

## Step 1 — Early Maturity

Choice A: Add subscription billing
•	“Stripe pushed a surprise API change — half your subscriptions failed. Gains halved.”
•	“Billing portal worked… until compliance flagged you. Revenue paused until lawyers finish their coffee.”

Choice B: Investor dashboard
•	“Dashboard looked slick… then crashed five minutes before your board call. Investors stared at 404s.”
•	“Charts were perfect — until the data pipeline broke and showed churn at 200%. Panic.”

## Step 2 — First Customers

Choice A: Landing page
•	“Your landing page looked great… until Google Ads flagged it as spam. Zero clicks.”
•	“Competitor bought your domain typo — half your leads are now on ‘aicofounderr.com.’ Brutal.”

Choice B: Onboarding emails
•	“Emails queued nicely… straight into Gmail’s spam folder. New users ghosted.”
•	“AWS SES flagged your emails as ‘suspicious activity.’ Welcome sequence = blocked.”

## Step 3 — Growth Stage

Choice A: Collaboration features
•	“Collaboration worked… until an intern accidentally deleted half the projects.”
•	“Launch was hyped — but Slack went down the same day. Everyone blamed you.”

Choice B: Customer analytics
•	“Analytics dashboard impressed — until investors misread the churn chart. Panic ensued.”
•	“Charts worked — until a timezone bug doubled daily active users. Nobody trusts numbers now.”

## Step 4 — Viral Spike

Choice A: Autoscale infra
•	“Autoscaling kicked in — and wiped half your staging data. Chaos at scale.”
•	“Traffic surge handled — but you forgot rate limits. Bots ate your free tier.”

Choice B: AI support chatbot
•	“Chatbot replied honestly: ‘Have you tried shutting down your company?’ Support tickets exploded.”
•	“Bot answered everything — then went offline mid-surge. Customers angry, humans swamped.”

## Step 5 — Global Expansion

Choice A: Multilingual support
•	“Great translations — except Japanese tagline now reads: ‘Hire a Goat as Cofounder.’”
•	“Spanish users thrilled… until accents broke the UI. Half the text boxes overflow.”

Choice B: International payments
•	“Payments launched globally — then processor froze funds for ‘suspicious founder activity.’ Customers paid, you didn’t.”
•	“Currency detection worked — until VAT compliance email landed in spam. Surprise bill incoming.”


# Junie Console Scripts for Unluck Events 🎲

## Step 1 — Early Maturity

Choice A: Subscriptions
[Junie] ✅ Stripe integration deployed... oh wait.
[Junie] ⚠️ Stripe just pushed a surprise API change. Half the payments failed.
[Junie] 😬 Gains cut in half — but hey, at least your error logs are international now.

Choice B: Investor dashboard
[Junie] 📊 Investor dashboard online... slick graphs rendering.
[Junie] 💥 Pipeline crashed 5 min before your board call.
[Junie] 🙈 Investors now think “404 Not Found” is your key metric. Gains reduced.

## Step 2 — First Customers

Choice A: Landing page
[Junie] 🌐 Landing page deployed. Looks gorgeous.
[Junie] ❌ Google Ads flagged it as spam. Zero clicks.
[Junie] 👻 Your customer funnel turned into a ghost town.

Choice B: Onboarding emails
[Junie] 📧 Onboarding emails queued, SendGrid is humming.
[Junie] 🚫 Gmail dropped them straight into spam.
[Junie] 🤷 Gains cut in half — apparently “AI Cofounder” looks like a Nigerian prince.

## Step 3 — Growth Stage

Choice A: Collaboration features
[Junie] 🤝 Multi-user collab launched. Invites sent.
[Junie] 🔥 Intern just deleted half the projects.
[Junie] 🪦 Gains halved. Remember: interns are people too... allegedly.

Choice B: Analytics
[Junie] 📈 Customer analytics live. Charts crisp.
[Junie] 🌀 Timezone bug doubled DAUs. Nobody trusts numbers now.
[Junie] 😑 Gains cut in half. Reality distortion isn’t traction.

## Step 4 — Viral Spike

Choice A: Autoscale infra
[Junie] 🚀 Autoscaling pods online. Load balanced. Smooth.
[Junie] 💥 Side-effect: staging DB wiped clean.
[Junie] 🔍 Gains halved. On the bright side, fewer bugs reported from staging.

Choice B: AI Support Chatbot
[Junie] 🤖 AI support bot trained and deployed.
[Junie] 😅 First reply: “Try shutting down your company.”
[Junie] 📉 Gains cut in half. Customers love honesty... right?

## Step 5 — Global Expansion

Choice A: Multilingual support
[Junie] 🌍 Translations deployed in ES, JP, PT.
[Junie] 🐐 Japanese tagline now reads: “Hire a Goat as Cofounder.”
[Junie] 🤦 Gains reduced. At least farmers are signing up.

Choice B: International payments
[Junie] 💳 Global payments live. EUR, JPY, BRL flowing in.
[Junie] 🚫 Processor froze funds for “suspicious founder activity.”
[Junie] 🥲 Gains cut in half. Congrats — you’re a money laundering suspect now.

---

## Config and API (final names)

This feature is configured via the Scaling Meter engine (see `src/lib/scaling-meter.ts`). Final, stable names:

- DEFAULT_CONFIG.unluck
  - probability: number  // e.g., 0.10 means a 10% chance per step
  - factorRange: [number, number]  // e.g., [0.4, 0.7]
- MeterConfig
  - unluck: { probability: number; factorRange: [number, number] }
- MeterResult (per step)
  - unluckApplied?: boolean  // true when Unluck triggers this step
  - luckFactor?: number | null  // the actual multiplier used (within factorRange)

Behavioral notes:
- Only positive delta components are scaled by the factor; negatives (tradeoffs) remain unchanged.
- RNG call order is stable: Unluck roll first → meter randomness. This preserves determinism by seed.
- UI uses `getUnluckMessage(step, choice, rng)` to pick a contextual message deterministically.

See also:
- docs/scaling-meter.md (parameters, tuning, SR notes)
- docs/spec.md (high-level system overview)

## Troubleshooting & Forcing Unluck (dev/operator)

When you need to demo or test Unluck deterministically:

1) Force via operator/dev config (recommended for demos)
- Set `DEFAULT_CONFIG.unluck.probability = 1.0`  // triggers every step
- Optionally pin a deterministic factor: `DEFAULT_CONFIG.unluck.factorRange = [0.5, 0.5]`
  - SR tip: announce with exact factor, e.g., “Unluck: gains cut to 50% this step.”

2) Narrow the window instead of pinning
- Keep randomness but predictable presentation: `factorRange = [0.6, 0.65]` ⇒ small variance, same feel.

3) Seed-based reproducibility
- With a fixed seed, the Unluck roll order and message selection are stable.
- To verify: run two identical sessions with the same seed; Unluck steps and factors should match.

4) Narrative mapping sanity check
- Ensure each step/choice has at least 2 messages that match the specific context (see lists above).
- Message selection is deterministic with seed → no jarring repeats on quick replays.

5) Why your popup didn’t appear
- Probability too low for a short demo (e.g., 10% across 5 steps often yields 0–1 hits). For demos, use 100%.
- Factor too high (close to 0.7), causing small visual difference on a weak delta. Try a mid factor (0.5–0.6).
- Popup dismissed/timeout overlapped with navigation; verify component test covers visibility for ≥4s.

6) QA checklist
- ~10% hit rate across many trials at probability=0.10.
- Factor is always within `factorRange`.
- Only positive components are scaled.
- Meter animation/overlay and SR announcement fire when `unluckApplied` is true.

# Perfect Storm Implementation 🔧

## Configuration (MeterConfig)
```typescript
specialUnluck: {
  enabled: boolean;           // Enable/disable Perfect Storm feature
  step: number;              // Step number (4 for step 4)
  choice: 'A' | 'B';         // Choice that triggers Perfect Storm ('B' for AI chatbot)
  probability: number;       // Probability after regular unluck (1.0 = 100%)
  scalingGainsReduction: number;  // Additional reduction factor (0.5 = 50%)
  usersReduction: number;    // Users parameter reduction (0.5 = 50%)
  customersReduction: number; // Customers parameter reduction (0.7 = 70%)
  investorsReduction: number; // Investors parameter reduction (0.4 = 40%)
}
```

## Implementation Details
1. **Trigger Condition**: Only activates when regular unluck occurs on Step 4 Option B
2. **Double Roll**: After regular unluck applies, roll again for Perfect Storm
3. **Perfect Storm Penalties Applied**:
   - Scaling gains: Regular unluck factor × Special unluck factor (e.g., 0.6 × 0.5 = 0.3)
   - Users parameter: Reduced by 50% of final value after delta application
   - Customers parameter: Reduced by 70% of final value after delta application
   - Investors parameter: Reduced by 40% of final value after delta application
4. **UI Indicators**:
   - Red styling instead of pink for Perfect Storm
   - Explosion emoji (💥) instead of warning (⚠️)
   - "PERFECT STORM" messaging
   - Enhanced visual effects in scaling meter

## Perfect Storm Messages
Snarky messages stored in `getSpecialUnluckMessage()`:
- "You thought you could get away with this!? Now you have to pay twice!"
- "Oh, you didn't invest in stability? Time to learn the hard way — PERFECT STORM!"
- "Surprise! Your system just collapsed under load. Should've chosen option A!"
- "Plot twist: Your AI chatbot became sentient and quit. Users are fleeing!"
- And more...

## Testing
Perfect Storm tests are included in `tests/unit/scaling-meter.test.ts`:
- Triggers only on Step 4 Option B with regular unluck
- Applies correct penalties (50% scaling gains + 50% users + 70% customers + 40% investors)
- Respects probability configuration
- Does not trigger on other steps or choices