# Implementation Plan

## Overview

This document outlines the detailed implementation plan for the **Choose Your Own Startup Adventure** game. Each plan item is linked to specific requirements from `docs/requirements.md` and prioritized for development.

**Priority Levels:**
- **Critical**: Core game functionality, blocks other work
- **High**: Essential features for MVP
- **Medium**: Important but not blocking
- **Low**: Nice-to-have, polish, optimization

---

## Phase 1: Foundation & Core Architecture

### 1.1 Project Setup and Configuration
**Priority:** Critical  
**Requirements:** All  
**Description:** Initialize Next.js project, configure TypeScript, set up build pipeline, install dependencies, configure linting and formatting.

**Tasks:**
- Initialize Next.js 14+ with App Router
- Configure TypeScript with strict mode
- Set up Biome for linting/formatting
- Configure Tailwind CSS for styling
- Create project directory structure
- Set up environment variables and configuration files

**Dependencies:** None

---

### 1.2 Type Definitions and Interfaces
**Priority:** Critical  
**Requirements:** 2, 5, 8, 9, 20  
**Description:** Define all TypeScript interfaces for game state, content packs, meter state, deltas, and results.

**Tasks:**
- Create `src/types/game.ts` with all core interfaces
- Define `ContentPack`, `Step`, `Choice`, `Delta` interfaces
- Define `RunState`, `MeterState`, `StepResult` interfaces
- Define `UnluckResult`, `MeterConfig`, `FeatureFlags` interfaces
- Define tier types and enums
- Export all types for reuse across the application

**Dependencies:** 1.1

---

### 1.3 Seeded RNG Implementation
**Priority:** Critical  
**Requirements:** 20  
**Description:** Implement deterministic random number generator for reproducible gameplay.

**Tasks:**
- Create `src/lib/rng.ts` with SeededRNG class
- Implement Mulberry32 algorithm or equivalent
- Provide methods: `next()`, `nextInt()`, `nextFloat()`, `reset()`, `getState()`
- Write unit tests for deterministic behavior
- Document RNG call order for consistency

**Dependencies:** 1.2

---

### 1.4 Configuration System
**Priority:** Critical  
**Requirements:** 5, 8, 9  
**Description:** Create centralized configuration for meter weights, unluck parameters, and feature flags.

**Tasks:**
- Create `src/lib/config.ts` with `DEFAULT_CONFIG`
- Define meter weights (R: 0.30, U: 0.25, S: 0.20, C: 0.15, I: 0.10)
- Define sigmoid parameters (μ: -4, σ: 11)
- Define unluck configuration (probability: 0.10, factorRange: [0.4, 0.7])
- Define Perfect Storm configuration
- Create feature flags system in `src/lib/feature-flags.ts`
- Support URL parameter parsing for flags (`?operator=true`, `?seed=12345`)

**Dependencies:** 1.2

---

## Phase 2: Scaling Meter Engine

### 2.1 Core Meter Calculation
**Priority:** Critical  
**Requirements:** 5  
**Description:** Implement the scaling meter engine with 5-dimensional state, weighted sum, sigmoid normalization.

**Tasks:**
- Create `src/lib/meter-engine.ts`
- Implement `createInitialMeterState()` (returns state with displayValue=0, tier="crash")
- Implement `updateMeterState(state, delta, rng, config)` function
- Apply diminishing returns (R^0.9) to each dimension
- Compute weighted sum: 0.30*R + 0.25*U + 0.20*S + 0.15*C + 0.10*I
- Normalize with sigmoid: 100 / (1 + exp(-(x - μ) / σ))
- Add momentum bonus (+3 if streak ≥ 2)
- Add randomness (±5)
- Clamp to [0, 100] and round to 1 decimal

**Dependencies:** 1.2, 1.3, 1.4

---

### 2.2 Momentum and Streak Tracking
**Priority:** High  
**Requirements:** 5  
**Description:** Track consecutive gains and apply momentum bonuses.

**Tasks:**
- Add `streak` field to `MeterState`
- Increment streak when meter increases
- Reset streak to 0 when meter doesn't increase
- Apply +3 bonus when streak ≥ 2
- Update `MeterState` with new streak value after each step

**Dependencies:** 2.1

---

### 2.3 Rubber-Banding
**Priority:** High  
**Requirements:** 5  
**Description:** Prevent death spirals by boosting System dimension when meter is low.

**Tasks:**
- Check if meter < 30 after calculation
- Apply +2 bump to System (S) dimension for next step
- Store rubber-band state in `MeterState` (optional)
- Ensure rubber-band doesn't break determinism

**Dependencies:** 2.1

---

### 2.4 Tier Calculation and Display
**Priority:** High  
**Requirements:** 5  
**Description:** Map meter values to visual tiers with emojis and labels.

**Tasks:**
- Create tier mapping function: 0-29 → "crash", 30-49 → "finding-fit", etc.
- Define tier display config with emojis and labels
- Implement `getTierConfig(tier)` utility
- Update `MeterState.tier` after each calculation

**Dependencies:** 2.1

---

## Phase 3: Unluck System

### 3.1 Regular Unluck Implementation
**Priority:** High  
**Requirements:** 8  
**Description:** Implement 10% probability unluck that reduces positive gains with contextual messages.

**Tasks:**
- Create `src/lib/unluck.ts`
- Implement `rollUnluck(rng, config, forceUnluck)` function
- Implement `applyUnluckToDeltas(delta, luckFactor)` (only positive values scaled)
- Generate luck factor in range [0.4, 0.7] deterministically
- Implement `getUnluckMessage(stepId, choice, rng)` with 30+ contextual messages
- Return `UnluckResult` with `unluckApplied`, `luckFactor`, `message`

**Dependencies:** 1.2, 1.3, 1.4

---

### 3.2 Perfect Storm Implementation
**Priority:** High  
**Requirements:** 9  
**Description:** Implement special unluck event for Step 4B with dramatic penalties.

**Tasks:**
- Implement `rollPerfectStorm(stepId, choice, unluckOccurred, rng, config, forcePerfectStorm)`
- Check conditions: Step 4, Choice B, regular unluck occurred
- Implement `applyPerfectStormPenalties(delta, config)` with 50%/50%/70%/40% reductions
- Implement `getPerfectStormMessage(rng)` with 8 dramatic messages
- Update `UnluckResult` with `perfectStorm: true` flag

**Dependencies:** 3.1

---

### 3.3 Unluck Integration with Meter
**Priority:** High  
**Requirements:** 8, 9  
**Description:** Integrate unluck processing into meter update flow.

**Tasks:**
- Create `processUnluck(stepId, choice, delta, rng, config, options)` orchestration function
- Implement `updateMeterStateWithUnluck(state, delta, stepId, choice, rng, config, unluckOptions)`
- Ensure RNG call order: unluck → luck factor → message → Perfect Storm → rubber-band → meter randomness
- Return `MeterUpdateResult` with both `meterState` and `unluckResult`
- Write unit tests for unluck determinism

**Dependencies:** 2.1, 3.1, 3.2

---

## Phase 4: Content Pack System

### 4.1 Content Pack Schema and Validation
**Priority:** Critical  
**Requirements:** 2  
**Description:** Define and validate content pack structure.

**Tasks:**
- Create `src/lib/content-validator.ts`
- Implement schema validation for `ContentPack` interface
- Validate: id, version (semantic), title, exactly 5 steps
- Validate: each step has id (1-5), title, scenario, optionA, optionB
- Validate: each choice has label (≤200 chars), body (≤1000 chars), delta
- Validate: delta values in range [-10, +15]
- Implement `validateContentPack(pack)` and `validateContentPackSafe(pack)` (with error details)
- Implement `formatValidationErrors(result)` for user-friendly error messages

**Dependencies:** 1.2

---

### 4.2 Content Pack Loader
**Priority:** Critical  
**Requirements:** 2  
**Description:** Load and parse content packs from JSON/YAML files.

**Tasks:**
- Create `src/lib/content-loader.ts`
- Implement `loadContentPack(packId)` to load from `/public/content/{packId}.json`
- Support YAML parsing (use `js-yaml` or similar)
- Support loading from URL via `?packUrl=https://...`
- Implement fallback to default pack on failure
- Cache loaded packs in memory for performance
- Log detailed errors for debugging

**Dependencies:** 4.1

---

### 4.3 Default Content Pack
**Priority:** Critical  
**Requirements:** 2  
**Description:** Create the default "ai-cofounder-v1" content pack with 5 levels.

**Tasks:**
- Create `public/content/ai-cofounder-v1.json`
- Implement all 5 steps based on `docs/game-levels.md`
- Define deltas based on `docs/scaling-meter.md`
- Add scenario texts, option labels, and bodies
- Validate pack using validation tools
- Test balance by simulating different paths

**Dependencies:** 4.1

---

### 4.4 Content Pack Manager (Hot-Swapping)
**Priority:** Medium  
**Requirements:** 2, 19  
**Description:** Support loading multiple packs and switching between them.

**Tasks:**
- Create `src/lib/pack-manager.ts`
- Implement `getPackManager()` singleton
- Implement `loadPackFromUrl(url)`, `loadPackFromString(data, format)`, `switchToPack(packId)`
- Implement `listLoadedPacks()`, `getLoadHistory()` for debugging
- Support versioned packs: `?pack=ai-cofounder&version=1.2.0`
- Enable dev mode: `?dev=true` for pack switching UI

**Dependencies:** 4.2

---

## Phase 5: Game State Management

### 5.1 Game Context and State
**Priority:** Critical  
**Requirements:** 1, 4, 5  
**Description:** Implement React context for managing global game state.

**Tasks:**
- Create `src/contexts/GameContext.tsx`
- Define `RunState` interface: seed, currentStep, meterState, stepHistory, startTime, endTime
- Implement `useGame()` hook providing: runState, startNewRun(), recordStepResult(), loadSavedRun()
- Implement state persistence to localStorage
- Implement state hydration on app load
- Handle edge cases: no localStorage, corrupted data

**Dependencies:** 1.2, 2.1, 4.2

---

### 5.2 localStorage Persistence
**Priority:** High  
**Requirements:** 1  
**Description:** Persist game state to browser localStorage for session resumption.

**Tasks:**
- Create `src/lib/storage.ts` with localStorage helpers
- Implement `saveRunState(state)`, `loadRunState()`, `clearRunState()`
- Serialize/deserialize `RunState` to/from JSON
- Handle localStorage quota exceeded errors
- Implement fallback to memory-only mode if localStorage unavailable

**Dependencies:** 5.1

---

### 5.3 Session Management (Start, Resume, Reset)
**Priority:** High  
**Requirements:** 1  
**Description:** Implement game session lifecycle management.

**Tasks:**
- Implement "New Run" flow: generate seed, reset meter, set step to 1, clear history
- Implement "Resume" flow: load RunState from localStorage, validate, restore UI
- Implement "Reset Run" flow: clear localStorage, return to start screen
- Display appropriate error messages when resume fails
- Confirm destructive actions (reset) with user

**Dependencies:** 5.1, 5.2

---

## Phase 6: UI Components

### 6.1 Layout and Panels
**Priority:** Critical  
**Requirements:** 14  
**Description:** Create three-panel layout: scenario (left), console (right), meter (bottom).

**Tasks:**
- Create `src/components/GameLayout.tsx`
- Implement responsive grid: 3-panel on desktop, stacked on mobile
- Make each panel independently scrollable
- Ensure no main screen scrolling (fixed viewport)
- Apply modern styling with Tailwind CSS

**Dependencies:** 1.1

---

### 6.2 Scenario Panel Component
**Priority:** Critical  
**Requirements:** 3, 4  
**Description:** Display step title, scenario text, and two choice options.

**Tasks:**
- Create `src/components/ScenarioPanel.tsx`
- Display step title and subtitle (if present)
- Display scenario text with proper formatting
- Display Option A and Option B cards with labels and bodies
- Implement hover states for options
- Handle choice selection and emit events
- Disable options after selection until ready for next step

**Dependencies:** 6.1

---

### 6.3 Junie Console Component
**Priority:** High  
**Requirements:** 6  
**Description:** Simulate AI agent console with streaming logs and code diffs.

**Tasks:**
- Create `src/components/JunieConsole.tsx`
- Implement streaming text animation (line-by-line with timing)
- Support multiple log types: info, success, warning, error
- Display code diffs with syntax highlighting (use `react-syntax-highlighter` or similar)
- Format diffs with +/- line indicators
- Auto-scroll to latest output
- Clear console on new step

**Dependencies:** 6.1

---

### 6.4 Scaling Meter Component
**Priority:** Critical  
**Requirements:** 5, 7  
**Description:** Visual progress bar with tier display and delta animation.

**Tasks:**
- Create `src/components/ScalingMeter.tsx`
- Display horizontal bar (0-100) with current value
- Show tier badge with emoji and label
- Animate meter changes (green for increase, red for decrease)
- Display meter delta (+5.2 or -3.1)
- Show 1-2 insights below meter
- Update tier display when crossing boundaries

**Dependencies:** 6.1, 2.4

---

### 6.5 Insights Component
**Priority:** High  
**Requirements:** 7  
**Description:** Generate and display short insights based on dominant dimensions.

**Tasks:**
- Create `src/lib/insights.ts` with insight generation logic
- Identify top dimension (highest value in R, U, S, C, I)
- Identify bottleneck dimension (lowest value)
- Map dimensions to insight templates (e.g., "Revenue momentum strong", "Infrastructure needs attention")
- Display 1-2 insights in Scaling Meter component
- Ensure insights are contextual and non-repetitive

**Dependencies:** 2.1

---

### 6.6 Start Screen Component
**Priority:** High  
**Requirements:** 1, 15  
**Description:** Initial screen with New Run, Resume, and analytics consent.

**Tasks:**
- Create `src/components/StartScreen.tsx`
- Display game title and subtitle
- Show "New Run" and "Resume" buttons
- Request analytics consent with checkbox
- Disable "Resume" if no saved state exists
- Navigate to game screen on button click

**Dependencies:** 5.3

---

### 6.7 Ending Screen Component
**Priority:** High  
**Requirements:** 11, 12, 13  
**Description:** Final screen with ending tier, summary, and replay options.

**Tasks:**
- Create `src/components/EndingScreen.tsx`
- Calculate ending tier based on final meter value
- Display ending emoji, title, and description
- Show top 2 positive drivers and 1 bottleneck
- Provide "next step" suggestion
- Display shareable results card
- Show "Replay" button with alternate path hints
- Implement share functionality (Twitter, LinkedIn, copy link)

**Dependencies:** 5.1, 6.4

---

### 6.8 Unluck Popup Component
**Priority:** High  
**Requirements:** 8, 9  
**Description:** Display unluck and Perfect Storm events with contextual messages.

**Tasks:**
- Create `src/components/UnluckPopup.tsx`
- Show popup overlay when unluck triggers
- Display warning icon (⚠️) for regular unluck, explosion (💥) for Perfect Storm
- Show contextual message from unluck system
- Apply pink background for regular unluck, red for Perfect Storm
- Auto-dismiss after 4-5 seconds or allow manual close
- Animate entrance/exit

**Dependencies:** 3.3

---

### 6.9 Operator Panel Component
**Priority:** Medium  
**Requirements:** 10  
**Description:** Debug controls for demo operators and developers.

**Tasks:**
- Create `src/components/OperatorPanel.tsx`
- Display panel only when `?operator=true` is present
- Provide toggles: force unluck, force Perfect Storm, show hidden state, enable debug console, skip animations
- Provide input for fixed seed
- Provide slider for unluck factor override (0.4-0.7)
- Display current hidden state (R, U, S, C, I) when enabled
- Position panel as overlay or sidebar (not intrusive)

**Dependencies:** 1.4

---

### 6.10 Video Modal Component
**Priority:** High  
**Requirements:** 21  
**Description:** Modal dialog that plays video clip after choice selection.

**Tasks:**
- Create `src/components/VideoModal.tsx`
- Display modal overlay with video player centered on screen
- Auto-play video (`video/clip1.mp4`) when modal opens
- Provide "Close" or "Skip" button in corner
- Auto-close modal when video completes
- Prevent closing on backdrop click (only button or Escape key)
- Show error message and "Continue" button if video fails to load
- Dim background and disable interaction while modal is open
- Support keyboard controls: Escape to close, Space/Enter to pause/play
- Respect `skipAnimations` feature flag (skip video entirely if enabled)
- Add accessible attributes for screen readers

**Dependencies:** 6.1

---

## Phase 7: Game Flow Integration

### 7.1 Step Progression Logic
**Priority:** Critical  
**Requirements:** 4, 5  
**Description:** Orchestrate game flow from choice selection through meter update to next step.

**Tasks:**
- Create `src/lib/game-flow.ts` with step progression orchestration
- On choice selection: apply delta, process unluck, update meter, generate insights
- Record `StepResult` with all metadata: choice, deltas, meter before/after, tier before/after, unluck data
- Update `RunState` with new meterState and append to stepHistory
- Persist updated RunState to localStorage
- Determine if game is complete (step 5 finished)
- Navigate to ending screen if complete, otherwise prepare next step

**Dependencies:** 2.1, 3.3, 5.1

---

### 7.2 Video Playback Integration
**Priority:** High  
**Requirements:** 21  
**Description:** Integrate video modal into choice selection flow.

**Tasks:**
- Update choice selection handler to show video modal before processing choice
- Implement video modal state management (open/closed)
- Handle video completion event → close modal → proceed with game flow
- Handle manual close (button or Escape) → close modal → proceed with game flow
- Handle video load error → show error → allow continue
- Skip video modal when `skipAnimations` feature flag is enabled
- Ensure video doesn't block game state updates (async handling)
- Test video playback on different browsers and devices

**Dependencies:** 6.10, 7.1

---

### 7.3 Junie Console Script Execution
**Priority:** High  
**Requirements:** 6  
**Description:** Generate and display simulated console logs for each choice.

**Tasks:**
- Create `src/lib/console-scripts.ts` with log generation logic
- Define log templates for each step/choice combination (10 scripts total: 5 steps × 2 choices)
- Include: starting log, progress logs, code diff snippets (optional), completion log
- Support markdown-like formatting for code blocks
- Integrate with `JunieConsole` component for streaming display
- Add realistic timing delays between log lines (100-300ms)

**Dependencies:** 6.3

---

### 7.4 Asset Loading and Fallbacks
**Priority:** Medium  
**Requirements:** 16  
**Description:** Load step assets (images, videos) with fallback to simulated output.

**Tasks:**
- Create `src/lib/asset-loader.ts`
- Implement `loadAsset(url, context)` with retry logic
- Detect asset type from URL (image, video, etc.)
- Implement fallback to placeholder on failure
- Create `src/components/AssetPreview.tsx` for displaying assets
- Support retry button for failed assets
- Lazy-load assets per step (don't preload all)

**Dependencies:** 4.2

---

### 7.5 Ending Calculation Logic
**Priority:** High  
**Requirements:** 11  
**Description:** Calculate final ending tier and generate personalized summary.

**Tasks:**
- Create `src/lib/endings.ts`
- Define ending tiers: Unicorn (85-100), Scaling Up (70-84), Gaining Steam (50-69), Finding Fit (30-49), Scrappy/Zombie (15-29), Crash & Burn (0-14)
- Implement `calculateEnding(finalMeter, hiddenState)` function
- Identify top 2 dimensions (positive drivers)
- Identify lowest dimension (bottleneck)
- Generate contextual "next step" suggestion based on dimensions
- Return ending data structure for display

**Dependencies:** 2.1

---

### 7.6 Replay and Alternate Path Hints
**Priority:** Medium  
**Requirements:** 13  
**Description:** Analyze player's path and suggest alternate choices for replay.

**Tasks:**
- Create `src/lib/replay.ts`
- Analyze stepHistory to identify choices made
- Suggest 1-2 alternate choices that lead to different outcomes
- Implement hinting logic: "What if you chose Option B at Step 2?"
- Display hints on ending screen
- Implement "Replay" flow: reset game with new seed

**Dependencies:** 7.5

---

## Phase 8: Polish and Optimization

### 8.1 Animations and Transitions
**Priority:** Medium  
**Requirements:** 17  
**Description:** Add smooth animations for meter changes, choice selection, and transitions.

**Tasks:**
- Implement meter bar animation (slide effect for value changes)
- Implement tier badge transition (fade/scale when crossing boundary)
- Implement choice card hover/click animations
- Implement step transition fade-in/out
- Ensure animations are 60fps and can be disabled via operator panel
- Use CSS transitions or Framer Motion for smooth animations

**Dependencies:** 6.2, 6.4

---

### 8.2 Accessibility Improvements
**Priority:** Medium  
**Requirements:** 18  
**Description:** Ensure keyboard navigation and screen reader support.

**Tasks:**
- Add tab index to all interactive elements
- Implement visible focus indicators (outline or ring)
- Add ARIA labels to all buttons and UI elements
- Add `role` attributes where appropriate (button, dialog, alert)
- Provide text alternatives for visual-only elements (meter animations, emojis)
- Test with screen reader (NVDA, VoiceOver)

**Dependencies:** 6.1, 6.2, 6.3, 6.4

---

### 8.3 Performance Optimization
**Priority:** Medium  
**Requirements:** 17  
**Description:** Optimize bundle size, lazy-load assets, improve loading speed.

**Tasks:**
- Code-split by route (start screen, game, ending)
- Lazy-load heavy dependencies (syntax highlighter, yaml parser)
- Optimize images and assets (compress, use WebP)
- Minimize initial JS bundle (target <500KB gzipped)
- Implement asset preloading for next step (while current step is active)
- Use React.memo and useMemo to prevent unnecessary re-renders

**Dependencies:** All Phase 6 components

---

### 8.4 Error Boundaries and Handling
**Priority:** High  
**Requirements:** 16  
**Description:** Implement error boundaries and graceful degradation.

**Tasks:**
- Create `src/components/ErrorBoundary.tsx`
- Catch React errors and display user-friendly error screen
- Provide "Restart" button to recover from errors
- Log errors to console for debugging
- Implement fallback UI for failed components (e.g., AssetPreview)
- Handle localStorage errors gracefully (fallback to memory-only mode)

**Dependencies:** 5.1

---

## Phase 9: Analytics and Monitoring

### 9.1 Analytics Integration
**Priority:** Low  
**Requirements:** 15  
**Description:** Collect anonymized gameplay data with user consent.

**Tasks:**
- Create `src/lib/analytics.ts`
- Implement consent management (store consent in localStorage)
- Track events: game start, step completion, choice selection, ending reached
- Track metrics: session duration, final meter, path taken, unluck occurrences
- Send analytics payload to configured endpoint (optional, can be no-op for MVP)
- Ensure no PII is collected

**Dependencies:** 5.1

---

### 9.2 Monitoring and Logging
**Priority:** Low  
**Requirements:** 16  
**Description:** Implement client-side error logging and performance monitoring.

**Tasks:**
- Create `src/lib/logger.ts` with log levels (info, warn, error)
- Log critical errors to console (always)
- Log debug information when dev mode enabled
- Integrate with error tracking service (Sentry, optional)
- Track performance metrics: load time, step transition time, animation FPS
- Display performance stats in operator panel

**Dependencies:** 6.9

---

## Phase 10: Testing and QA

### 10.1 Unit Tests
**Priority:** Medium  
**Requirements:** All  
**Description:** Write unit tests for core logic modules.

**Tasks:**
- Test meter engine: delta application, diminishing returns, sigmoid, clamping
- Test unluck system: probability, factor generation, message selection, determinism
- Test RNG: determinism, range validation, state management
- Test content validation: schema validation, error messages
- Test insights generation: dimension identification, message selection
- Achieve >80% code coverage for core modules

**Dependencies:** 2.1, 3.3, 1.3, 4.1, 6.5

---

### 10.2 Integration Tests
**Priority:** Medium  
**Requirements:** 7.1, 7.2  
**Description:** Test end-to-end game flow scenarios.

**Tasks:**
- Test complete game flow: start → 5 steps → ending
- Test unluck triggering and UI display
- Test Perfect Storm on Step 4B
- Test replay functionality
- Test localStorage persistence and recovery
- Test content pack loading and validation errors

**Dependencies:** 7.1, 7.2

---

### 10.3 Visual Regression Testing
**Priority:** Low  
**Requirements:** 14  
**Description:** Ensure UI consistency across updates.

**Tasks:**
- Set up Playwright or similar for visual regression
- Capture screenshots of key states: start screen, each step, ending screen, unluck popup
- Compare screenshots on each build
- Fix visual regressions before merging

**Dependencies:** All Phase 6 components

---

### 10.4 Manual QA Checklist
**Priority:** High  
**Requirements:** All  
**Description:** Comprehensive manual testing before release.

**Tasks:**
- Test all 32 possible paths (2^5 = 32 combinations of choices)
- Test unluck triggering (use `?forceUnluck=true`)
- Test Perfect Storm triggering (use `?forcePerfectStorm=true`)
- Test with different seeds (verify determinism)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices and tablets
- Test keyboard navigation and screen reader
- Test with bad content packs (verify error handling)
- Test with no localStorage (verify fallback)
- Test with slow network (verify asset loading fallbacks)

**Dependencies:** All phases

---

## Phase 11: Documentation and Deployment

### 11.1 User-Facing Documentation
**Priority:** Low  
**Requirements:** 2, 19  
**Description:** Write guides for players and content creators.

**Tasks:**
- Update README.md with game overview, setup instructions
- Document how to play the game
- Document how to create custom content packs (refer to existing `docs/content-packs.md`)
- Provide example content packs
- Document URL parameters and feature flags

**Dependencies:** All phases

---

### 11.2 Developer Documentation
**Priority:** Low  
**Requirements:** All  
**Description:** Write technical documentation for developers.

**Tasks:**
- Document architecture and design decisions
- Update quick reference guides (`docs/meter-engine-quick-reference.md`, `docs/content-pack-quick-reference.md`)
- Document RNG call order for determinism
- Document operator panel usage
- Provide code examples for key scenarios

**Dependencies:** All phases

---

### 11.3 Deployment Configuration
**Priority:** High  
**Requirements:** 1, 2  
**Description:** Configure deployment to production environment.

**Tasks:**
- Configure Next.js for static export (if needed) or server deployment
- Set up environment variables for production
- Configure CDN for assets
- Set up CI/CD pipeline (GitHub Actions, Vercel, etc.)
- Configure analytics endpoint (if using)
- Test production build locally

**Dependencies:** All phases

---

## Implementation Dependencies Graph

```
Phase 1 (Foundation)
  └─> Phase 2 (Meter Engine)
  └─> Phase 3 (Unluck System)
  └─> Phase 4 (Content Packs)
  └─> Phase 5 (State Management)
        └─> Phase 6 (UI Components)
              └─> Phase 7 (Game Flow)
                    └─> Phase 8 (Polish)
                    └─> Phase 9 (Analytics)
                    └─> Phase 10 (Testing)
                          └─> Phase 11 (Deployment)
```

**Critical Path:** 1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 4.1 → 4.2 → 4.3 → 5.1 → 6.1 → 6.2 → 6.4 → 7.1 → 10.4 → 11.3

**Estimated Timeline:**
- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 2 days
- Phase 4: 2-3 days
- Phase 5: 2 days
- Phase 6: 4-5 days
- Phase 7: 3-4 days
- Phase 8: 2-3 days
- Phase 9: 1-2 days
- Phase 10: 3-4 days
- Phase 11: 1-2 days

**Total: ~25-35 days** (single developer, full-time)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Content pack validation fails in production | High | Comprehensive validation tests, fallback to default pack |
| Meter balancing requires tuning | Medium | Simulation tools in operator panel, easy config updates |
| Performance issues on mobile | Medium | Lazy loading, code splitting, performance testing early |
| Unluck feels too punishing | Medium | Operator controls for tuning, user testing, config adjustments |
| localStorage unavailable | Low | Memory-only fallback, clear user warning |
| Asset loading failures | Low | Fallback placeholders, retry mechanism |

---

## Next Steps

1. Review and approve this plan
2. Create detailed task list in `docs/tasks.md`
3. Set up project tracking (GitHub Projects, Jira, etc.)
4. Begin Phase 1 implementation
5. Iterate on plan as needed based on learnings

