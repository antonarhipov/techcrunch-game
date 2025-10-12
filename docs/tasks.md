# Development Tasks

This document contains the detailed technical task list for building the **Choose Your Own Startup Adventure** game. Each task links to both the implementation plan (`docs/plan.md`) and related requirements (`docs/requirements.md`).

**Status Key:**
- `[ ]` Not started
- `[x]` Completed
- `[~]` In progress (optional notation)

---

## Phase 1: Foundation & Core Architecture

### 1.1 Project Setup and Configuration
*Plan: 1.1 | Requirements: All*

- [x] **1.1.1** Initialize Next.js 14+ project with App Router using `npx create-next-app@latest`
- [x] **1.1.2** Configure TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitAny: true`
- [x] **1.1.3** Install and configure Biome for linting and formatting (`npm install --save-dev @biomejs/biome`)
- [x] **1.1.4** Install and configure Tailwind CSS v4 (or v3) for styling
- [x] **1.1.5** Create project directory structure: `src/components/`, `src/lib/`, `src/contexts/`, `src/types/`, `src/app/`
- [x] **1.1.6** Set up environment variables: create `.env.local` with placeholders for analytics endpoint, feature flags
- [x] **1.1.7** Configure `next.config.ts` with optimization settings, output config
- [x] **1.1.8** Add `.gitignore` entries for build artifacts, environment files, IDE configs
- [x] **1.1.9** Create `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `test`
- [x] **1.1.10** Initialize Git repository and create initial commit

### 1.2 Type Definitions and Interfaces
*Plan: 1.2 | Requirements: 2, 5, 8, 9, 20*

- [x] **1.2.1** Create `src/types/game.ts` file
- [x] **1.2.2** Define `Delta` interface: `{ R: number; U: number; S: number; C: number; I: number }`
- [x] **1.2.3** Define `Choice` interface: `{ label: string; body: string; delta: Delta }`
- [x] **1.2.4** Define `Step` interface: `{ id: number; title: string; subtitle?: string; scenario: string; optionA: Choice; optionB: Choice; assets?: string[] }`
- [x] **1.2.5** Define `ContentPack` interface: `{ id: string; version: string; title: string; description?: string; author?: string; steps: Step[]; metadata?: {...} }`
- [x] **1.2.6** Define `MeterTier` type: `"crash" | "finding-fit" | "gaining-steam" | "scaling-up" | "breakout"`
- [x] **1.2.7** Define `MeterState` interface: `{ hiddenState: Delta; displayValue: number; tier: MeterTier; lastDelta?: Delta; streak: number }`
- [x] **1.2.8** Define `StepResult` interface: `{ stepId: number; choice: "A" | "B"; appliedDelta: Delta; meterBefore: number; meterAfter: number; tierBefore: MeterTier; tierAfter: MeterTier; insights: string[]; unluckApplied: boolean; luckFactor?: number; perfectStorm: boolean; timestamp: string }`
- [x] **1.2.9** Define `RunState` interface: `{ seed: number; currentStep: number; meterState: MeterState; stepHistory: StepResult[]; startTime: string; endTime?: string; contentPackId: string }`
- [x] **1.2.10** Define `UnluckResult` interface: `{ unluckApplied: boolean; luckFactor: number; message: string | null; perfectStorm: boolean }`
- [x] **1.2.11** Define `MeterConfig` interface with nested configs for weights, sigmoid, momentum, randomness, diminishingReturns, rubberBand, unluck, specialUnluck
- [x] **1.2.12** Define `FeatureFlags` interface: `{ fixedSeed?: number; forceUnluck: boolean; forcePerfectStorm: boolean; unluckFactorOverride?: number; showHiddenState: boolean; enableDebugConsole: boolean; skipAnimations: boolean }`
- [x] **1.2.13** Define `SeededRNG` class interface with methods: `next()`, `nextInt()`, `nextFloat()`, `reset()`, `getState()`
- [x] **1.2.14** Export all types and interfaces from `src/types/game.ts`

### 1.3 Seeded RNG Implementation
*Plan: 1.3 | Requirements: 20*

- [x] **1.3.1** Create `src/lib/rng.ts` file
- [x] **1.3.2** Implement `SeededRNG` class with Mulberry32 algorithm
- [x] **1.3.3** Implement `constructor(seed: number)` to initialize internal state
- [x] **1.3.4** Implement `next(): number` method returning float in [0, 1)
- [x] **1.3.5** Implement `nextInt(min: number, max: number): number` method returning integer in [min, max]
- [x] **1.3.6** Implement `nextFloat(min: number, max: number): number` method returning float in [min, max]
- [x] **1.3.7** Implement `reset(seed: number): void` method to reinitialize with new seed
- [x] **1.3.8** Implement `getState(): number` method returning current internal state
- [x] **1.3.9** Export `createRNG(seed: number): SeededRNG` factory function
- [x] **1.3.10** Write unit tests: verify determinism (same seed → same sequence), verify range bounds, verify state management

### 1.4 Configuration System
*Plan: 1.4 | Requirements: 5, 8, 9*

- [x] **1.4.1** Create `src/lib/config.ts` file
- [x] **1.4.2** Define `DEFAULT_CONFIG: MeterConfig` constant
- [x] **1.4.3** Set meter weights: `{ R: 0.30, U: 0.25, S: 0.20, C: 0.15, I: 0.10 }`
- [x] **1.4.4** Set sigmoid parameters: `{ mu: -4, sigma: 11 }`
- [x] **1.4.5** Set momentum config: `{ enabled: true, bonus: 3, streakThreshold: 2 }`
- [x] **1.4.6** Set randomness config: `{ enabled: true, bounds: [-5, 5] }`
- [x] **1.4.7** Set diminishing returns config: `{ enabled: true, power: 0.9 }`
- [x] **1.4.8** Set rubber-band config: `{ enabled: true, threshold: 30, bump: 2 }`
- [x] **1.4.9** Set unluck config: `{ enabled: true, probability: 0.10, factorRange: [0.4, 0.7] }`
- [x] **1.4.10** Set special unluck (Perfect Storm) config: `{ enabled: true, step: 4, choice: "B", probability: 1.0, scalingGainsReduction: 0.5, usersReduction: 0.5, customersReduction: 0.7, investorsReduction: 0.4 }`
- [x] **1.4.11** Export `DEFAULT_CONFIG` and config utilities
- [x] **1.4.12** Create `src/lib/feature-flags.ts` file
- [x] **1.4.13** Implement `getFeatureFlags(): FeatureFlags` function parsing URL parameters (`?seed=`, `?forceUnluck=`, `?forcePerfectStorm=`, `?operator=`, `?unluckFactor=`)
- [x] **1.4.14** Implement localStorage fallback for feature flags (optional persistence)
- [x] **1.4.15** Write unit tests for URL parameter parsing and default values

---

## Phase 2: Scaling Meter Engine

### 2.1 Core Meter Calculation
*Plan: 2.1 | Requirements: 5*

- [x] **2.1.1** Create `src/lib/meter-engine.ts` file
- [x] **2.1.2** Implement `createInitialMeterState(): MeterState` returning state with all zeros, displayValue=0, tier="crash", streak=0
- [x] **2.1.3** Implement `applyDeltaToHiddenState(state: Delta, delta: Delta): Delta` to add delta to each dimension
- [x] **2.1.4** Implement `applyDiminishingReturns(state: Delta, power: number): Delta` applying `value^power` to each dimension
- [x] **2.1.5** Implement `computeWeightedSum(state: Delta, weights: {...}): number` computing weighted sum of R, U, S, C, I
- [x] **2.1.6** Implement `sigmoid(x: number, mu: number, sigma: number): number` function: `1 / (1 + exp(-(x - mu) / sigma))`
- [x] **2.1.7** Implement `normalizeMeter(rawScore: number, config: MeterConfig): number` applying sigmoid and scaling to [0, 100]
- [x] **2.1.8** Implement `applyRandomness(value: number, rng: SeededRNG, bounds: [number, number]): number` adding random noise
- [x] **2.1.9** Implement `clampMeter(value: number): number` clamping to [0, 100] and rounding to 1 decimal
- [x] **2.1.10** Implement `updateMeterState(state: MeterState, delta: Delta, rng: SeededRNG, config: MeterConfig): MeterState` orchestrating all calculations
- [x] **2.1.11** Store applied delta in `MeterState.lastDelta` for display purposes
- [x] **2.1.12** Write unit tests: verify each calculation step, verify clamping, verify determinism with fixed seed

### 2.2 Momentum and Streak Tracking
*Plan: 2.2 | Requirements: 5*

- [x] **2.2.1** Add `streak` field initialization in `createInitialMeterState()`
- [x] **2.2.2** Implement `updateStreak(oldValue: number, newValue: number, currentStreak: number): number` logic
- [x] **2.2.3** Increment streak by 1 when `newValue > oldValue`
- [x] **2.2.4** Reset streak to 0 when `newValue <= oldValue`
- [x] **2.2.5** Implement `applyMomentumBonus(value: number, streak: number, config: MeterConfig): number` adding bonus if streak ≥ threshold
- [x] **2.2.6** Integrate momentum bonus into `updateMeterState()` before clamping
- [x] **2.2.7** Update `MeterState.streak` with new streak value after each update
- [ ] **2.2.8** Write unit tests: verify streak increments on gains, resets on no gain, bonus applied correctly

### 2.3 Rubber-Banding
*Plan: 2.3 | Requirements: 5*

- [x] **2.3.1** Implement `shouldApplyRubberBand(meterValue: number, config: MeterConfig): boolean` checking if value < threshold
- [x] **2.3.2** Implement `applyRubberBandBump(state: Delta, bump: number): Delta` adding bump to System (S) dimension
- [x] **2.3.3** Integrate rubber-band check into `updateMeterState()` after meter calculation
- [x] **2.3.4** Apply bump to next step's hidden state (not current step's display value)
- [x] **2.3.5** Ensure rubber-band doesn't trigger infinite loops or break determinism
- [x] **2.3.6** Write unit tests: verify bump applied when meter < 30, not applied when meter >= 30

### 2.4 Tier Calculation and Display
*Plan: 2.4 | Requirements: 5*

- [x] **2.4.1** Create `src/lib/tiers.ts` file
- [x] **2.4.2** Define `TierConfig` interface: `{ label: string; emoji: string; description: string; min: number; max: number }`
- [x] **2.4.3** Define tier configurations for: "crash" (0-29, 🚧), "finding-fit" (30-49, 🌱), "gaining-steam" (50-69, ⚡), "scaling-up" (70-84, 🚀), "breakout" (85-100, 🦄)
- [x] **2.4.4** Implement `calculateTier(meterValue: number): MeterTier` mapping value to tier
- [x] **2.4.5** Implement `getTierConfig(tier: MeterTier): TierConfig` returning tier display config
- [x] **2.4.6** Integrate `calculateTier()` into `updateMeterState()` to set `MeterState.tier`
- [x] **2.4.7** Export tier utilities from `src/lib/tiers.ts`
- [x] **2.4.8** Write unit tests: verify tier boundaries, verify correct emoji/label mappings

---

## Phase 3: Unluck System

### 3.1 Regular Unluck Implementation
*Plan: 3.1 | Requirements: 8*

- [x] **3.1.1** Create `src/lib/unluck.ts` file
- [x] **3.1.2** Implement `rollUnluck(rng: SeededRNG, config: MeterConfig, forceUnluck: boolean): boolean` checking probability
- [x] **3.1.3** Return `true` if RNG roll < probability or forceUnluck is true
- [x] **3.1.4** Implement `generateLuckFactor(rng: SeededRNG, factorRange: [number, number]): number` generating factor in range
- [x] **3.1.5** Implement `applyUnluckToDeltas(delta: Delta, luckFactor: number): Delta` scaling only positive values
- [x] **3.1.6** Preserve negative delta values unchanged (tradeoffs maintained)
- [x] **3.1.7** Create unluck message arrays for each step/choice combination (5 steps × 2 choices × 2-3 variants = 30+ messages)
- [x] **3.1.8** Implement `getUnluckMessage(stepId: number, choice: "A" | "B", rng: SeededRNG): string` selecting message deterministically
- [x] **3.1.9** Implement `createUnluckResult(unluckApplied: boolean, luckFactor: number, message: string | null, perfectStorm: boolean): UnluckResult`
- [x] **3.1.10** Write unit tests: verify probability rolls, verify factor in range, verify message determinism, verify only positives scaled

### 3.2 Perfect Storm Implementation
*Plan: 3.2 | Requirements: 9*

- [x] **3.2.1** Implement `shouldCheckPerfectStorm(stepId: number, choice: "A" | "B", unluckOccurred: boolean): boolean` checking preconditions
- [x] **3.2.2** Return `true` only if stepId === 4 AND choice === "B" AND unluckOccurred === true
- [x] **3.2.3** Implement `rollPerfectStorm(rng: SeededRNG, config: MeterConfig, forcePerfectStorm: boolean): boolean` checking probability
- [x] **3.2.4** Implement `applyPerfectStormPenalties(delta: Delta, config: MeterConfig): Delta` applying additional reductions
- [x] **3.2.5** Apply 50% additional reduction to R and S (positive values only)
- [x] **3.2.6** Apply 50% reduction to U (both positive and negative)
- [x] **3.2.7** Apply 70% reduction to C (both positive and negative)
- [x] **3.2.8** Apply 40% reduction to I (both positive and negative)
- [x] **3.2.9** Create 8 dramatic Perfect Storm messages with system-collapse themes
- [x] **3.2.10** Implement `getPerfectStormMessage(rng: SeededRNG): string` selecting message deterministically
- [x] **3.2.11** Write unit tests: verify triggers only on Step 4B with unluck, verify penalty calculations, verify message selection

### 3.3 Unluck Integration with Meter
*Plan: 3.3 | Requirements: 8, 9*

- [x] **3.3.1** Implement `processUnluck(stepId, choice, delta, rng, config, options): { finalDelta: Delta; result: UnluckResult }` orchestration function
- [x] **3.3.2** Establish RNG call order: 1) unluck roll, 2) luck factor, 3) message selection, 4) Perfect Storm roll, 5) Perfect Storm message
- [x] **3.3.3** Apply regular unluck to delta if triggered
- [x] **3.3.4** Check for Perfect Storm conditions and apply additional penalties if triggered
- [x] **3.3.5** Return both modified delta and UnluckResult metadata
- [x] **3.3.6** Implement `updateMeterStateWithUnluck(state, delta, stepId, choice, rng, config, unluckOptions): MeterUpdateResult` combining unluck and meter update
- [x] **3.3.7** Call `processUnluck()` first, then pass finalDelta to `updateMeterState()`
- [x] **3.3.8** Return `{ meterState: MeterState; unluckResult: UnluckResult }`
- [x] **3.3.9** Ensure RNG call order is stable across all code paths (no conditional RNG calls)
- [x] **3.3.10** Write integration tests: verify determinism with fixed seed, verify Perfect Storm only on 4B, verify unluck factor overrides

---

## Phase 4: Content Pack System

### 4.1 Content Pack Schema and Validation
*Plan: 4.1 | Requirements: 2*

- [x] **4.1.1** Create `src/lib/content-validator.ts` file
- [x] **4.1.2** Implement `validateId(id: string): ValidationError[]` checking non-empty string, alphanumeric + hyphens
- [x] **4.1.3** Implement `validateVersion(version: string): ValidationError[]` checking semantic versioning format (X.Y.Z)
- [x] **4.1.4** Implement `validateDelta(delta: Delta): ValidationError[]` checking all values in [-10, +15] range
- [x] **4.1.5** Implement `validateChoice(choice: Choice, stepId: number, optionLabel: string): ValidationError[]` checking label ≤ 200 chars, body ≤ 1000 chars, valid delta
- [x] **4.1.6** Implement `validateStep(step: Step): ValidationError[]` checking id in [1, 5], non-empty title/scenario, valid optionA/optionB
- [x] **4.1.7** Implement `validateContentPack(pack: ContentPack): { valid: boolean; errors: ValidationError[] }` orchestrating all validations
- [x] **4.1.8** Validate exactly 5 steps with sequential IDs 1-5
- [x] **4.1.9** Validate required fields: id, version, title, steps
- [x] **4.1.10** Implement `formatValidationErrors(result: ValidationResult): string` creating user-friendly error messages
- [x] **4.1.11** Write unit tests: valid pack passes, invalid packs fail with correct errors, edge cases (empty strings, null values, etc.)

### 4.2 Content Pack Loader
*Plan: 4.2 | Requirements: 2*

- [x] **4.2.1** Create `src/lib/content-loader.ts` file
- [x] **4.2.2** Implement `loadContentPackFromFile(packId: string): Promise<ContentPack>` loading from `/public/content/{packId}.json`
- [x] **4.2.3** Try loading `.json`, `.yaml`, `.yml` extensions in order
- [x] **4.2.4** Parse JSON files with `JSON.parse()`
- [x] **4.2.5** Parse YAML files with `js-yaml` library (install as dependency)
- [x] **4.2.6** Implement `loadContentPackFromUrl(url: string): Promise<ContentPack>` fetching from external URL
- [x] **4.2.7** Validate loaded pack using `validateContentPack()`
- [x] **4.2.8** Throw detailed error if validation fails
- [x] **4.2.9** Implement in-memory cache to avoid re-loading same pack
- [x] **4.2.10** Implement `loadContentPack(packIdOrUrl: string): Promise<ContentPack>` auto-detecting file vs. URL
- [x] **4.2.11** Implement fallback to default pack on any load failure (log error, don't crash)
- [x] **4.2.12** Write unit tests: load valid pack, validation errors, URL loading, fallback behavior

### 4.3 Default Content Pack
*Plan: 4.3 | Requirements: 2*

- [x] **4.3.1** Create `public/content/ai-cofounder-v1.json` file
- [x] **4.3.2** Set pack metadata: `id: "ai-cofounder-v1"`, `version: "1.0.0"`, `title: "AI Cofounder Startup Adventure"`
- [x] **4.3.3** Implement Step 1 (Early Maturity): scenario, Option A (subscriptions: R+10, U+4, I-2), Option B (investor dashboard: I+10, R-3)
- [x] **4.3.4** Implement Step 2 (First Customers): scenario, Option A (landing page: U+8, C-2), Option B (onboarding: C+8, U-2)
- [x] **4.3.5** Implement Step 3 (Growth Stage): scenario, Option A (collaboration: U+6, R+5, S-3), Option B (analytics: C+6, I+4, U-2)
- [x] **4.3.6** Implement Step 4 (Viral Spike): scenario, Option A (autoscaling: S+10, I+3), Option B (AI support: C+7, I+4, S-5)
- [x] **4.3.7** Implement Step 5 (Global Expansion): scenario, Option A (multilingual: U+6, C+5), Option B (intl payments: R+8, I+3, C-2)
- [x] **4.3.8** Copy scenario texts from `docs/game-levels.md`
- [x] **4.3.9** Write engaging, concise labels and detailed body texts for each option
- [x] **4.3.10** Validate pack using content validator tool
- [x] **4.3.11** Test balance: simulate multiple paths (AAAAA, BBBBB, ABABA, etc.) and verify final meters are reasonable
- [x] **4.3.12** Create `src/lib/default-pack.ts` exporting default pack as TypeScript const (backup if file loading fails)

### 4.4 Content Pack Manager (Hot-Swapping)
*Plan: 4.4 | Requirements: 2, 19*

- [x] **4.4.1** Create `src/lib/pack-manager.ts` file
- [x] **4.4.2** Implement `PackManager` class with singleton pattern
- [x] **4.4.3** Implement `loadPackFromUrl(url: string): Promise<void>` loading and caching pack
- [x] **4.4.4** Implement `loadPackFromString(data: string, format: "json" | "yaml"): void` parsing string content
- [x] **4.4.5** Implement `switchToPack(packId: string): Promise<ContentPack>` changing active pack
- [x] **4.4.6** Implement `listLoadedPacks(): string[]` returning IDs of cached packs
- [x] **4.4.7** Implement `getLoadHistory(): LoadHistoryEntry[]` for debugging
- [x] **4.4.8** Support versioned loading: parse `?pack=ai-cofounder&version=1.2.0` from URL
- [x] **4.4.9** Implement `enableDevMode(enabled: boolean)` toggle for dev UI
- [x] **4.4.10** Export `getPackManager()` singleton accessor
- [x] **4.4.11** Write unit tests: load multiple packs, switch between packs, version handling

---

## Phase 5: Game State Management

### 5.1 Game Context and State
*Plan: 5.1 | Requirements: 1, 4, 5*

- [x] **5.1.1** Create `src/contexts/GameContext.tsx` file
- [x] **5.1.2** Define `GameContextValue` interface with: runState, contentPack, startNewRun(), recordStepResult(), loadSavedRun(), resetRun()
- [x] **5.1.3** Create `GameContext = createContext<GameContextValue | null>(null)`
- [x] **5.1.4** Implement `GameProvider` component wrapping children with context
- [x] **5.1.5** Initialize state with `useState<RunState | null>(null)`
- [x] **5.1.6** Load saved run from localStorage on mount (useEffect)
- [x] **5.1.7** Load content pack on mount based on URL params or default
- [x] **5.1.8** Implement `startNewRun(seed?: number)` creating new RunState with seed, currentStep=1, empty stepHistory, meterState=initial
- [x] **5.1.9** Implement `recordStepResult(result: StepResult, newMeterState: MeterState)` appending to stepHistory, updating meterState, incrementing currentStep
- [x] **5.1.10** Persist runState to localStorage after each update
- [x] **5.1.11** Implement `loadSavedRun()` reading from localStorage and validating
- [x] **5.1.12** Implement `resetRun()` clearing localStorage and resetting state
- [x] **5.1.13** Implement `useGame()` custom hook returning GameContextValue with error if used outside provider
- [x] **5.1.14** Export `GameProvider` and `useGame`
- [x] **5.1.15** Write integration tests: start run, record steps, persist/reload state

### 5.2 localStorage Persistence
*Plan: 5.2 | Requirements: 1*

- [x] **5.2.1** Create `src/lib/storage.ts` file
- [x] **5.2.2** Define storage key constant: `const RUN_STATE_KEY = "startup-game-run-state"`
- [x] **5.2.3** Implement `saveRunState(state: RunState): void` serializing to JSON and saving to localStorage
- [x] **5.2.4** Implement `loadRunState(): RunState | null` reading from localStorage, parsing JSON, returning null on error
- [x] **5.2.5** Implement `clearRunState(): void` removing key from localStorage
- [x] **5.2.6** Handle `QuotaExceededError` gracefully (log warning, continue without persistence)
- [x] **5.2.7** Handle `SecurityError` for disabled localStorage (private browsing mode)
- [x] **5.2.8** Implement `isLocalStorageAvailable(): boolean` utility checking availability
- [x] **5.2.9** Wrap all localStorage access in try-catch blocks
- [x] **5.2.10** Write unit tests: save/load cycle, handle quota exceeded, handle unavailable storage

### 5.3 Session Management (Start, Resume, Reset)
*Plan: 5.3 | Requirements: 1*

- [x] **5.3.1** Implement "New Run" flow in `GameProvider.startNewRun()`
- [x] **5.3.2** Generate seed from Date.now() if not provided
- [x] **5.3.3** Reset meter to initial state (all zeros, displayValue=0, tier="crash")
- [x] **5.3.4** Set currentStep to 1 and clear stepHistory
- [x] **5.3.5** Set startTime to current ISO timestamp
- [x] **5.3.6** Clear any existing localStorage data before starting new run
- [x] **5.3.7** Implement "Resume" flow in `GameProvider.loadSavedRun()`
- [x] **5.3.8** Load RunState from localStorage, validate structure
- [x] **5.3.9** Display error message if no saved state exists
- [x] **5.3.10** Restore meterState, currentStep, stepHistory, seed from saved state
- [x] **5.3.11** Implement "Reset Run" flow in `GameProvider.resetRun()`
- [ ] **5.3.12** Show confirmation dialog before resetting (prevent accidental resets)
- [x] **5.3.13** Clear localStorage and reset state to null
- [ ] **5.3.14** Navigate to start screen after reset
- [x] **5.3.15** Write integration tests: complete start-resume-reset cycle

---

## Phase 6: UI Components

### 6.1 Layout and Panels
*Plan: 6.1 | Requirements: 14*

- [ ] **6.1.1** Create `src/components/GameLayout.tsx` component
- [ ] **6.1.2** Implement three-panel grid layout using CSS Grid or Flexbox
- [ ] **6.1.3** Desktop layout: left panel (40%), right panel (60%), bottom meter (full width)
- [ ] **6.1.4** Make each panel independently scrollable with `overflow-auto`
- [ ] **6.1.5** Set main container to `h-screen overflow-hidden` (no main scrolling)
- [ ] **6.1.6** Implement responsive breakpoints: tablet (stack scenario + console vertically, meter bottom), mobile (full stack)
- [ ] **6.1.7** Apply Tailwind CSS classes for spacing, borders, shadows
- [ ] **6.1.8** Add props for children: `scenarioPanel`, `consolePanel`, `meterPanel`
- [ ] **6.1.9** Test layout on different screen sizes (desktop, tablet, mobile)
- [ ] **6.1.10** Ensure layout doesn't break with overflowing content

### 6.2 Scenario Panel Component
*Plan: 6.2 | Requirements: 3, 4*

- [ ] **6.2.1** Create `src/components/ScenarioPanel.tsx` component
- [ ] **6.2.2** Accept props: `step: Step`, `onChoiceSelect: (choice: "A" | "B") => void`, `disabled: boolean`
- [ ] **6.2.3** Display step title with large, bold typography
- [ ] **6.2.4** Display step subtitle (if present) with smaller, muted text
- [ ] **6.2.5** Display scenario text with good line height and readable font size
- [ ] **6.2.6** Create choice card component for each option (A and B)
- [ ] **6.2.7** Display choice label prominently and body text below
- [ ] **6.2.8** Implement hover state: slight scale, shadow, border highlight
- [ ] **6.2.9** Implement click handler calling `onChoiceSelect(choice)`
- [ ] **6.2.10** Disable cards when `disabled` prop is true (gray out, no hover, no click)
- [ ] **6.2.11** Add keyboard navigation: Tab to focus cards, Enter/Space to select
- [ ] **6.2.12** Add ARIA labels: `role="button"`, `aria-label="Choose option A: {label}"`
- [ ] **6.2.13** Style with Tailwind: cards, spacing, typography, colors
- [ ] **6.2.14** Test with different scenario text lengths (short, long, very long)

### 6.3 Junie Console Component
*Plan: 6.3 | Requirements: 6*

- [ ] **6.3.1** Create `src/components/JunieConsole.tsx` component
- [ ] **6.3.2** Accept props: `logs: LogEntry[]`, `isStreaming: boolean`
- [ ] **6.3.3** Define `LogEntry` interface: `{ type: "info" | "success" | "warning" | "error"; text: string; timestamp?: string; codeDiff?: string }`
- [ ] **6.3.4** Render console header with "Junie Console" title and status indicator
- [ ] **6.3.5** Render log list with scrollable container
- [ ] **6.3.6** Style log entries by type: info (blue), success (green), warning (yellow), error (red)
- [ ] **6.3.7** Render code diffs with syntax highlighting using `react-syntax-highlighter` (lazy-loaded)
- [ ] **6.3.8** Format diffs with +/- line prefixes and appropriate colors
- [ ] **6.3.9** Implement streaming animation: fade-in each log entry with slight delay
- [ ] **6.3.10** Auto-scroll to bottom when new logs appear (useEffect with ref.scrollIntoView)
- [ ] **6.3.11** Add "Clear Console" button (optional, for long sessions)
- [ ] **6.3.12** Style console to look like terminal: monospace font, dark background, light text
- [ ] **6.3.13** Test with rapid log streaming (ensure performance is smooth)
- [ ] **6.3.14** Implement accessibility: screen reader announces new logs (aria-live="polite")

### 6.4 Scaling Meter Component
*Plan: 6.4 | Requirements: 5, 7*

- [ ] **6.4.1** Create `src/components/ScalingMeter.tsx` component
- [ ] **6.4.2** Accept props: `meterState: MeterState`, `previousValue?: number`, `showInsights: boolean`
- [ ] **6.4.3** Display meter bar as horizontal progress bar with gradient fill
- [ ] **6.4.4** Display current meter value as large number: "{displayValue}%"
- [ ] **6.4.5** Display tier badge with emoji and label (e.g., "🚀 Scaling Up")
- [ ] **6.4.6** Calculate and display delta: `newValue - previousValue` (e.g., "+5.2" in green or "-3.1" in red)
- [ ] **6.4.7** Animate meter bar fill change with CSS transition (0.5s ease-out)
- [ ] **6.4.8** Animate tier badge change with fade/scale effect when tier changes
- [ ] **6.4.9** Display 1-2 insights below meter if `showInsights` is true
- [ ] **6.4.10** Style insights as small text with icons (e.g., "💰 Revenue momentum strong")
- [ ] **6.4.11** Implement tier color gradient: crash (red), finding-fit (orange), gaining-steam (yellow), scaling-up (green), breakout (blue/purple)
- [ ] **6.4.12** Add accessible text alternatives for visual-only info (aria-label for meter bar)
- [ ] **6.4.13** Test meter with edge values: 0, 50, 100, tier boundaries (29→30, 49→50, etc.)
- [ ] **6.4.14** Ensure animations respect `skipAnimations` feature flag

### 6.5 Insights Component
*Plan: 6.5 | Requirements: 7*

- [ ] **6.5.1** Create `src/lib/insights.ts` file
- [ ] **6.5.2** Implement `getTopDimension(state: Delta): keyof Delta` returning dimension with highest value
- [ ] **6.5.3** Implement `getBottleneckDimension(state: Delta): keyof Delta` returning dimension with lowest value
- [ ] **6.5.4** Define insight message templates for each dimension (top and bottom)
- [ ] **6.5.5** Revenue (R) messages: top ("Revenue momentum strong", "Monetization working"), bottom ("Revenue lagging", "Need pricing strategy")
- [ ] **6.5.6** Users (U) messages: top ("User growth impressive", "Activation strong"), bottom ("Struggling to acquire users", "Activation needs work")
- [ ] **6.5.7** System (S) messages: top ("Infrastructure solid", "Scaling smoothly"), bottom ("Infra bottleneck", "Consider autoscaling")
- [ ] **6.5.8** Customers (C) messages: top ("Customers love you", "Retention excellent"), bottom ("Churn risk", "Need better support")
- [ ] **6.5.9** Investors (I) messages: top ("Investors confident", "Metrics visibility strong"), bottom ("Story unclear", "Need better reporting")
- [ ] **6.5.10** Implement `generateInsights(meterState: MeterState, delta?: Delta): string[]` returning 1-2 insights
- [ ] **6.5.11** Select top dimension insight and optionally bottleneck insight (if significantly lower)
- [ ] **6.5.12** Ensure insights don't repeat same dimension back-to-back (track last insight)
- [ ] **6.5.13** Keep insights concise (≤100 characters)
- [ ] **6.5.14** Write unit tests: verify correct dimension identification, verify message selection

### 6.6 Start Screen Component
*Plan: 6.6 | Requirements: 1, 15*

- [ ] **6.6.1** Create `src/components/StartScreen.tsx` component
- [ ] **6.6.2** Display game title: "Choose Your Own Startup Adventure"
- [ ] **6.6.3** Display subtitle: "Build an AI Cofounder SaaS"
- [ ] **6.6.4** Display game description (optional): brief overview of gameplay
- [ ] **6.6.5** Create "New Run" button (large, prominent)
- [ ] **6.6.6** Create "Resume" button (secondary style)
- [ ] **6.6.7** Check for saved run on component mount (useEffect with useGame)
- [ ] **6.6.8** Disable "Resume" button if no saved run exists
- [ ] **6.6.9** Show analytics consent checkbox: "Allow anonymous analytics to improve the game"
- [ ] **6.6.10** Store consent in localStorage (key: "startup-game-analytics-consent")
- [ ] **6.6.11** Handle "New Run" click: call `startNewRun()`, navigate to game screen
- [ ] **6.6.12** Handle "Resume" click: call `loadSavedRun()`, navigate to game screen (or show error if load fails)
- [ ] **6.6.13** Add keyboard navigation and accessibility attributes
- [ ] **6.6.14** Style with Tailwind: centered layout, attractive visuals, responsive
- [ ] **6.6.15** Test both flows: new run, resume (with and without saved data)

### 6.7 Ending Screen Component
*Plan: 6.7 | Requirements: 11, 12, 13*

- [ ] **6.7.1** Create `src/components/EndingScreen.tsx` component
- [ ] **6.7.2** Accept props: `runState: RunState`, `ending: EndingData`
- [ ] **6.7.3** Display ending tier emoji and title (e.g., "🦄 Unicorn Ending")
- [ ] **6.7.4** Display final meter value prominently
- [ ] **6.7.5** Display ending description (1-2 paragraphs about the outcome)
- [ ] **6.7.6** Display top 2 positive drivers: "Your strengths: Revenue momentum, User growth"
- [ ] **6.7.7** Display 1 bottleneck: "Your challenge: Infrastructure scalability"
- [ ] **6.7.8** Display "next step" suggestion: contextual advice based on ending
- [ ] **6.7.9** Display path taken: visual representation of choices (e.g., "A → B → A → A → B")
- [ ] **6.7.10** Create shareable results card as styled div or canvas
- [ ] **6.7.11** Implement "Share on Twitter" button opening Twitter intent URL with text and image
- [ ] **6.7.12** Implement "Share on LinkedIn" button (similar flow)
- [ ] **6.7.13** Implement "Copy Link" button copying shareable link to clipboard
- [ ] **6.7.14** Create "Replay" button calling `resetRun()` and navigating to start screen
- [ ] **6.7.15** Display 1-2 alternate path hints: "Curious what happens if you choose Option B at Step 2?"
- [ ] **6.7.16** Style ending screen with celebration visuals (confetti for high scores, etc.)
- [ ] **6.7.17** Test with all ending tiers (0-100 range)

### 6.8 Unluck Popup Component
*Plan: 6.8 | Requirements: 8, 9*

- [ ] **6.8.1** Create `src/components/UnluckPopup.tsx` component
- [ ] **6.8.2** Accept props: `unluckResult: UnluckResult | null`, `onClose: () => void`
- [ ] **6.8.3** Display modal overlay (semi-transparent backdrop)
- [ ] **6.8.4** Display popup card with message and icon
- [ ] **6.8.5** For regular unluck: pink background, warning icon (⚠️), "Unluck!" title
- [ ] **6.8.6** For Perfect Storm: red background, explosion icon (💥), "PERFECT STORM!" title
- [ ] **6.8.7** Display contextual message from `unluckResult.message`
- [ ] **6.8.8** Display luck factor: "Gains reduced to {factor}%"
- [ ] **6.8.9** Implement auto-dismiss after 5 seconds (setTimeout)
- [ ] **6.8.10** Implement manual close button (X in corner)
- [ ] **6.8.11** Animate entrance: slide-in from top or fade-in with scale
- [ ] **6.8.12** Animate exit: fade-out
- [ ] **6.8.13** Ensure popup doesn't block game progression (can be dismissed immediately)
- [ ] **6.8.14** Make popup accessible: trap focus inside popup, Escape key to close, aria-modal
- [ ] **6.8.15** Test with different message lengths (short, long)

### 6.9 Operator Panel Component
*Plan: 6.9 | Requirements: 10*

- [ ] **6.9.1** Create `src/components/OperatorPanel.tsx` component
- [ ] **6.9.2** Accept props: `currentMeterState?: MeterState`
- [ ] **6.9.3** Only render panel if `?operator=true` URL parameter is present
- [ ] **6.9.4** Display panel as slide-out sidebar (right edge) or collapsible overlay
- [ ] **6.9.5** Create toggle button to show/hide panel
- [ ] **6.9.6** Add toggle: "Force Unluck" (checkbox synced with feature flags)
- [ ] **6.9.7** Add toggle: "Force Perfect Storm" (checkbox)
- [ ] **6.9.8** Add toggle: "Show Hidden State" (checkbox)
- [ ] **6.9.9** Add toggle: "Enable Debug Console" (checkbox)
- [ ] **6.9.10** Add toggle: "Skip Animations" (checkbox)
- [ ] **6.9.11** Add input: "Fixed Seed" (number input)
- [ ] **6.9.12** Add slider: "Unluck Factor Override" (range 0.4-0.7)
- [ ] **6.9.13** Display current hidden state when "Show Hidden State" is enabled: R, U, S, C, I values
- [ ] **6.9.14** Update feature flags in real-time when toggles change (use useEffect to update URL params or localStorage)
- [ ] **6.9.15** Style panel with Tailwind: dark background, compact layout, clear labels
- [ ] **6.9.16** Add "Copy Current State" button (for debugging)
- [ ] **6.9.17** Test all toggles and inputs, verify they affect game behavior

### 6.10 Video Modal Component
*Plan: 6.10 | Requirements: 21*

- [ ] **6.10.1** Create `src/components/VideoModal.tsx` component
- [ ] **6.10.2** Accept props: `isOpen: boolean`, `videoSrc: string`, `onClose: () => void`, `onComplete: () => void`
- [ ] **6.10.3** Display modal overlay with semi-transparent backdrop when `isOpen` is true
- [ ] **6.10.4** Center video player in viewport using flexbox or grid
- [ ] **6.10.5** Implement video element with `autoPlay` and `controls` attributes
- [ ] **6.10.6** Load video from `videoSrc` prop (default: `video/clip1.mp4`)
- [ ] **6.10.7** Create "Close" or "Skip" button positioned in top-right corner of modal
- [ ] **6.10.8** Handle video `onEnded` event to call `onComplete()` and auto-close modal
- [ ] **6.10.9** Handle button click to call `onClose()` immediately
- [ ] **6.10.10** Prevent modal close on backdrop click (only button or Escape key)
- [ ] **6.10.11** Implement keyboard handler: Escape key calls `onClose()`, Space/Enter toggles play/pause
- [ ] **6.10.12** Handle video load error: display error message "Video unavailable" and show "Continue" button
- [ ] **6.10.13** Dim background game UI when modal is open (backdrop with opacity 0.8)
- [ ] **6.10.14** Disable pointer events on background content while modal is open
- [ ] **6.10.15** Add ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-label="Video player"`
- [ ] **6.10.16** Trap focus within modal when open (prevent tabbing to background)
- [ ] **6.10.17** Style modal with Tailwind: centered, max-width for video, rounded corners, shadow
- [ ] **6.10.18** Test video playback on different browsers (Chrome, Firefox, Safari)
- [ ] **6.10.19** Test video controls: play, pause, seek, volume
- [ ] **6.10.20** Test error handling: invalid video path, network failure

---

## Phase 7: Game Flow Integration

### 7.1 Step Progression Logic
*Plan: 7.1 | Requirements: 4, 5*

- [ ] **7.1.1** Create `src/lib/game-flow.ts` file
- [ ] **7.1.2** Implement `processStepChoice(runState, choice, contentPack, featureFlags): StepProgressionResult` orchestration function
- [ ] **7.1.3** Extract current step and choice delta from content pack
- [ ] **7.1.4** Create RNG instance from runState.seed
- [ ] **7.1.5** Call `updateMeterStateWithUnluck()` to process unluck and update meter
- [ ] **7.1.6** Generate insights using `generateInsights()` based on new meter state
- [ ] **7.1.7** Create `StepResult` object with all metadata: stepId, choice, deltas, meter before/after, tier before/after, insights, unluck data, timestamp
- [ ] **7.1.8** Return `StepProgressionResult` containing: newMeterState, stepResult, isGameComplete
- [ ] **7.1.9** Set `isGameComplete = true` if currentStep === 5
- [ ] **7.1.10** Implement `prepareNextStep(runState): number` returning next step ID (or ending indicator)
- [ ] **7.1.11** Integrate into game component: on choice click → processStepChoice → recordStepResult → update UI → show unluck popup if needed → proceed to next step or ending
- [ ] **7.1.12** Write integration tests: complete 5-step flow, verify state updates, verify stepHistory

### 7.2 Video Playback Integration
*Plan: 7.2 | Requirements: 21*

- [ ] **7.2.1** Update choice selection handler in game component to show video modal before processing choice
- [ ] **7.2.2** Add state management for video modal: `const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)`
- [ ] **7.2.3** On choice click: set `isVideoModalOpen = true` and pass video source (`video/clip1.mp4`)
- [ ] **7.2.4** Implement `handleVideoComplete()` callback: close modal, proceed with game flow (process choice, update meter, show insights)
- [ ] **7.2.5** Implement `handleVideoClose()` callback: close modal, proceed with game flow (same as complete)
- [ ] **7.2.6** Check `skipAnimations` feature flag: if true, skip video modal entirely and proceed directly
- [ ] **7.2.7** Handle async video modal flow: ensure game state doesn't update until video modal closes
- [ ] **7.2.8** Disable choice buttons while video modal is open (prevent double-clicking)
- [ ] **7.2.9** Re-enable choice buttons after video modal closes and feedback is displayed
- [ ] **7.2.10** Test video playback on Chrome (desktop and mobile)
- [ ] **7.2.11** Test video playback on Firefox
- [ ] **7.2.12** Test video playback on Safari (desktop and iOS)
- [ ] **7.2.13** Test video skip functionality (Close button and Escape key)
- [ ] **7.2.14** Test with `skipAnimations` enabled: verify video is skipped
- [ ] **7.2.15** Write integration test: choice click → video modal → complete → game proceeds

### 7.3 Junie Console Script Execution
*Plan: 7.3 | Requirements: 6*

- [ ] **7.3.1** Create `src/lib/console-scripts.ts` file
- [ ] **7.3.2** Define `ConsoleScript` interface: `{ logs: LogEntry[]; totalDuration: number }`
- [ ] **7.3.3** Create script for Step 1 Option A (subscriptions): starting logs, Stripe integration logs, billing tiers, completion
- [ ] **7.3.4** Create script for Step 1 Option B (investor dashboard): starting logs, dashboard setup, charts rendering, completion
- [ ] **7.3.5** Create script for Step 2 Option A (landing page): starting logs, HTML generation, styling, deployment logs
- [ ] **7.3.6** Create script for Step 2 Option B (onboarding emails): starting logs, email template creation, SendGrid setup, completion
- [ ] **7.3.7** Create script for Step 3 Option A (collaboration): starting logs, multi-user features, permissions, completion
- [ ] **7.3.8** Create script for Step 3 Option B (analytics): starting logs, metrics dashboard, charts, completion
- [ ] **7.3.9** Create script for Step 4 Option A (autoscaling): starting logs, Kubernetes setup, monitoring, completion
- [ ] **7.3.10** Create script for Step 4 Option B (AI support): starting logs, chatbot training, integration, completion
- [ ] **7.3.11** Create script for Step 5 Option A (multilingual): starting logs, i18n setup, translations, completion
- [ ] **7.3.12** Create script for Step 5 Option B (intl payments): starting logs, payment providers, currency support, completion
- [ ] **7.3.13** Add optional code diffs to 2-3 scripts (e.g., Step 1A shows Stripe code, Step 2A shows HTML)
- [ ] **7.3.14** Implement `getConsoleScript(stepId: number, choice: "A" | "B"): ConsoleScript` lookup function
- [ ] **7.3.15** Integrate with JunieConsole component: stream logs with timing (100-300ms between entries)

### 7.4 Asset Loading and Fallbacks
*Plan: 7.4 | Requirements: 16*

- [ ] **7.4.1** Create `src/lib/asset-loader.ts` file
- [ ] **7.4.2** Define `AssetContext` interface: `{ stepId: number; choice: "A" | "B" }`
- [ ] **7.4.3** Implement `loadAsset(url: string, context: AssetContext): Promise<AssetData>` fetching asset with timeout (5s)
- [ ] **7.4.4** Detect asset type from URL extension (jpg, png, mp4, etc.)
- [ ] **7.4.5** Implement retry logic: retry once on failure with exponential backoff
- [ ] **7.4.6** Return fallback placeholder on final failure (generic image or simulated text)
- [ ] **7.4.7** Create `src/components/AssetPreview.tsx` component
- [ ] **7.4.8** Accept props: `url: string`, `context: AssetContext`, `showRetry: boolean`
- [ ] **7.4.9** Display loading spinner while asset loads
- [ ] **7.4.10** Display asset when loaded (image: <img>, video: <video>)
- [ ] **7.4.11** Display fallback placeholder on error
- [ ] **7.4.12** Show "Retry" button if `showRetry` is true
- [ ] **7.4.13** Lazy-load assets: only load assets for current step (don't preload all 5 steps)
- [ ] **7.4.14** Optionally preload next step's assets while current step is active (background fetch)
- [ ] **7.4.15** Write unit tests: successful load, retry on failure, fallback behavior

### 7.5 Ending Calculation Logic
*Plan: 7.5 | Requirements: 11*

- [ ] **7.5.1** Create `src/lib/endings.ts` file
- [ ] **7.5.2** Define `EndingData` interface: `{ tier: string; emoji: string; title: string; description: string; topDrivers: string[]; bottleneck: string; nextStepSuggestion: string }`
- [ ] **7.5.3** Define ending tiers: Unicorn (85-100), Scaling Up (70-84), Gaining Steam (50-69), Finding Fit (30-49), Scrappy/Zombie (15-29), Crash & Burn (0-14)
- [ ] **7.5.4** Implement `calculateEndingTier(finalMeter: number): string` mapping meter to tier
- [ ] **7.5.5** Implement `identifyTopDrivers(hiddenState: Delta): string[]` returning top 2 dimensions (highest values)
- [ ] **7.5.6** Implement `identifyBottleneck(hiddenState: Delta): string` returning lowest dimension
- [ ] **7.5.7** Implement dimension name mapping: R → "Revenue", U → "Users", S → "System", C → "Customers", I → "Investors"
- [ ] **7.5.8** Create ending descriptions for each tier (personalized text templates)
- [ ] **7.5.9** Create "next step" suggestions based on bottleneck dimension
- [ ] **7.5.10** Implement `calculateEnding(finalMeter: number, hiddenState: Delta): EndingData` orchestrating all logic
- [ ] **7.5.11** Write unit tests: verify tier mapping, verify driver/bottleneck identification, verify ending data structure

### 7.6 Replay and Alternate Path Hints
*Plan: 7.6 | Requirements: 13*

- [ ] **7.6.1** Create `src/lib/replay.ts` file
- [ ] **7.6.2** Implement `analyzePathTaken(stepHistory: StepResult[]): string` converting history to path string (e.g., "ABABA")
- [ ] **7.6.3** Implement `generateAlternatePathHints(stepHistory: StepResult[], contentPack: ContentPack): string[]` suggesting 1-2 alternate choices
- [ ] **7.6.4** Identify steps where alternate choice would significantly change outcome (different delta direction or magnitude)
- [ ] **7.6.5** Generate hint text: "What if you chose Option B at Step 2 (Onboarding)?"
- [ ] **7.6.6** Prioritize hints for high-impact decisions (larger delta differences)
- [ ] **7.6.7** Integrate hints into EndingScreen component display
- [ ] **7.6.8** Implement "Replay" button handler: call `resetRun()`, navigate to start screen
- [ ] **7.6.9** Optionally store previous run history for comparison (in separate localStorage key)
- [ ] **7.6.10** Write unit tests: verify path analysis, verify hint generation

---

## Phase 8: Polish and Optimization

### 8.1 Animations and Transitions
*Plan: 8.1 | Requirements: 17*

- [ ] **8.1.1** Implement meter bar fill animation in ScalingMeter component using CSS transitions (0.5s ease-out)
- [ ] **8.1.2** Implement meter delta number animation (fade-in + slide-up effect)
- [ ] **8.1.3** Implement tier badge transition when crossing boundaries (fade-out old, fade-in new with scale)
- [ ] **8.1.4** Implement choice card hover animation (scale 1.02, shadow, border glow, 0.2s ease)
- [ ] **8.1.5** Implement choice card click animation (scale 0.98, brief flash)
- [ ] **8.1.6** Implement step transition fade-in/out (0.3s fade)
- [ ] **8.1.7** Implement unluck popup entrance animation (slide-in from top with bounce)
- [ ] **8.1.8** Implement unluck popup exit animation (fade-out with scale-down)
- [ ] **8.1.9** Add confetti animation for high-score endings (use canvas or CSS particles)
- [ ] **8.1.10** Ensure all animations respect `skipAnimations` feature flag (set transition duration to 0ms when enabled)
- [ ] **8.1.11** Test animations on 60Hz and 120Hz displays (ensure smooth performance)
- [ ] **8.1.12** Use `prefers-reduced-motion` CSS media query to respect user preferences
- [ ] **8.1.13** Optionally use Framer Motion library for complex animations (install if needed)

### 8.2 Accessibility Improvements
*Plan: 8.2 | Requirements: 18*

- [ ] **8.2.1** Add `tabIndex={0}` to all interactive elements (choice cards, buttons)
- [ ] **8.2.2** Implement visible focus indicators using Tailwind `focus:ring-2 focus:ring-blue-500`
- [ ] **8.2.3** Add `role="button"` to clickable cards
- [ ] **8.2.4** Add descriptive `aria-label` to all buttons and cards (e.g., "Choose Option A: Add subscription billing")
- [ ] **8.2.5** Add `aria-live="polite"` to JunieConsole for screen reader announcements
- [ ] **8.2.6** Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to meter progress bar
- [ ] **8.2.7** Add text alternatives for tier emojis (e.g., `<span aria-label="Unicorn">🦄</span>`)
- [ ] **8.2.8** Implement keyboard navigation for modals (Escape to close, Tab to cycle focus)
- [ ] **8.2.9** Ensure color is not the only way to convey information (add +/- icons to meter delta)
- [ ] **8.2.10** Test with screen reader (NVDA on Windows or VoiceOver on Mac)
- [ ] **8.2.11** Test keyboard-only navigation (Tab, Enter, Space, Escape)
- [ ] **8.2.12** Run automated accessibility audit (Lighthouse, axe DevTools)
- [ ] **8.2.13** Fix any critical accessibility issues found in audit

### 8.3 Performance Optimization
*Plan: 8.3 | Requirements: 17*

- [ ] **8.3.1** Implement code-splitting for heavy dependencies: `const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'))`
- [ ] **8.3.2** Lazy-load YAML parser only when YAML pack is detected
- [ ] **8.3.3** Implement route-based code-splitting (start screen, game, ending screen as separate chunks)
- [ ] **8.3.4** Optimize images: compress, convert to WebP, use responsive sizes
- [ ] **8.3.5** Minimize initial JS bundle: analyze with `npm run build` and bundle analyzer
- [ ] **8.3.6** Target <500KB initial JS bundle (gzipped)
- [ ] **8.3.7** Implement asset preloading for next step while current step is active (use `<link rel="prefetch">`)
- [ ] **8.3.8** Use `React.memo()` for expensive components (JunieConsole, ScalingMeter)
- [ ] **8.3.9** Use `useMemo()` for expensive calculations (insights generation, ending calculation)
- [ ] **8.3.10** Use `useCallback()` for event handlers passed to child components
- [ ] **8.3.11** Avoid unnecessary re-renders: verify with React DevTools Profiler
- [ ] **8.3.12** Test load time on slow 3G connection (Chrome DevTools throttling)
- [ ] **8.3.13** Run Lighthouse performance audit, target score >90
- [ ] **8.3.14** Fix any critical performance issues identified

### 8.4 Error Boundaries and Handling
*Plan: 8.4 | Requirements: 16*

- [ ] **8.4.1** Create `src/components/ErrorBoundary.tsx` component
- [ ] **8.4.2** Implement `componentDidCatch(error, errorInfo)` logging error to console
- [ ] **8.4.3** Implement fallback UI: display friendly error message, "Something went wrong" heading
- [ ] **8.4.4** Add "Restart Game" button calling `resetRun()` and reloading page
- [ ] **8.4.5** Add "Report Issue" button (optional) opening GitHub issue or email
- [ ] **8.4.6** Wrap main App component with ErrorBoundary
- [ ] **8.4.7** Implement error fallbacks for specific components (AssetPreview, JunieConsole)
- [ ] **8.4.8** Handle localStorage errors gracefully: catch exceptions, log warning, continue without persistence
- [ ] **8.4.9** Display toast notification when localStorage is unavailable: "Note: Progress won't be saved (localStorage unavailable)"
- [ ] **8.4.10** Handle content pack load failures: fall back to default pack, display warning
- [ ] **8.4.11** Handle content pack validation failures: show detailed errors, offer to load default pack
- [ ] **8.4.12** Test error scenarios: throw error in component, corrupt localStorage data, invalid content pack
- [ ] **8.4.13** Verify error boundary catches errors and displays fallback UI

---

## Phase 9: Analytics and Monitoring

### 9.1 Analytics Integration
*Plan: 9.1 | Requirements: 15*

- [ ] **9.1.1** Create `src/lib/analytics.ts` file
- [ ] **9.1.2** Implement `getAnalyticsConsent(): boolean` reading consent from localStorage
- [ ] **9.1.3** Implement `setAnalyticsConsent(consent: boolean): void` storing consent in localStorage
- [ ] **9.1.4** Implement `trackEvent(eventName: string, properties?: Record<string, any>): void` function
- [ ] **9.1.5** Check consent before sending any data; if declined, return early (no-op)
- [ ] **9.1.6** Define event types: "game_start", "step_complete", "choice_select", "ending_reach", "unluck_trigger", "perfect_storm_trigger"
- [ ] **9.1.7** Track "game_start" event with: seed, contentPackId, timestamp
- [ ] **9.1.8** Track "step_complete" event with: stepId, choice, meterBefore, meterAfter, unluckApplied
- [ ] **9.1.9** Track "ending_reach" event with: finalMeter, endingTier, pathTaken, sessionDuration
- [ ] **9.1.10** Implement `sendAnalyticsPayload(events: Event[]): Promise<void>` posting to analytics endpoint (if configured)
- [ ] **9.1.11** Use Beacon API or fetch() to send data
- [ ] **9.1.12** Ensure no PII is collected: no emails, names, IP addresses
- [ ] **9.1.13** Integrate analytics calls into game flow: startNewRun, recordStepResult, ending screen
- [ ] **9.1.14** Add analytics endpoint to .env.local (optional, can be no-op URL)
- [ ] **9.1.15** Test analytics with and without consent

### 9.2 Monitoring and Logging
*Plan: 9.2 | Requirements: 16*

- [ ] **9.2.1** Create `src/lib/logger.ts` file
- [ ] **9.2.2** Define log levels: "info", "warn", "error", "debug"
- [ ] **9.2.3** Implement `log(level: string, message: string, data?: any): void` function
- [ ] **9.2.4** Log "info" and "warn" to console in development mode only
- [ ] **9.2.5** Always log "error" to console (production and dev)
- [ ] **9.2.6** Log "debug" only when debug console is enabled (feature flag)
- [ ] **9.2.7** Integrate logging into critical paths: content pack loading, state persistence, meter updates, unluck processing
- [ ] **9.2.8** Log errors with stack traces for debugging
- [ ] **9.2.9** Optionally integrate with error tracking service (Sentry, LogRocket) via environment variable
- [ ] **9.2.10** Implement `trackPerformance(metric: string, value: number): void` recording performance metrics
- [ ] **9.2.11** Track metrics: load time (Time to Interactive), step transition time, animation FPS
- [ ] **9.2.12** Display performance stats in operator panel (average step transition time, etc.)
- [ ] **9.2.13** Test logging in dev and production modes

---

## Phase 10: Testing and QA

### 10.1 Unit Tests
*Plan: 10.1 | Requirements: All*

- [ ] **10.1.1** Set up testing framework: install Jest and React Testing Library
- [ ] **10.1.2** Configure Jest for TypeScript and Next.js (jest.config.js)
- [ ] **10.1.3** Write tests for RNG: determinism (same seed → same sequence), range validation
- [ ] **10.1.4** Write tests for meter engine: delta application, diminishing returns, sigmoid normalization, clamping
- [ ] **10.1.5** Write tests for momentum: streak increments, resets, bonus application
- [ ] **10.1.6** Write tests for rubber-banding: bump applied when meter < 30, not applied otherwise
- [ ] **10.1.7** Write tests for tier calculation: verify all tier boundaries
- [ ] **10.1.8** Write tests for unluck: probability rolls, factor generation in range, message selection determinism
- [ ] **10.1.9** Write tests for Perfect Storm: triggers only on Step 4B with unluck, correct penalties
- [ ] **10.1.10** Write tests for unluck integration: RNG call order stability, determinism with seed
- [ ] **10.1.11** Write tests for content validation: valid pack passes, invalid packs fail with correct errors
- [ ] **10.1.12** Write tests for content loader: file loading, URL loading, validation, fallback
- [ ] **10.1.13** Write tests for insights generation: dimension identification, message selection
- [ ] **10.1.14** Write tests for ending calculation: tier mapping, drivers/bottleneck identification
- [ ] **10.1.15** Run tests with `npm test`, aim for >80% code coverage on core modules

### 10.2 Integration Tests
*Plan: 10.2 | Requirements: 7.1, 7.2*

- [ ] **10.2.1** Write integration test: complete game flow from start to ending (5 steps, all A choices)
- [ ] **10.2.2** Verify state updates after each step: meterState, stepHistory, currentStep
- [ ] **10.2.3** Verify ending calculation is triggered after Step 5
- [ ] **10.2.4** Write integration test: unluck triggering (use forceUnluck flag)
- [ ] **10.2.5** Verify unluck popup appears, message is displayed, meter is reduced
- [ ] **10.2.6** Write integration test: Perfect Storm (use forcePerfectStorm on Step 4B)
- [ ] **10.2.7** Verify Perfect Storm popup, penalties applied, meter significantly reduced
- [ ] **10.2.8** Write integration test: localStorage persistence (complete step, reload page, verify state restored)
- [ ] **10.2.9** Write integration test: content pack loading (load valid pack, load invalid pack, verify fallback)
- [ ] **10.2.10** Write integration test: replay flow (complete game, click replay, verify state reset)
- [ ] **10.2.11** Run integration tests with Playwright or Cypress (choose one)
- [ ] **10.2.12** Verify all integration tests pass consistently

### 10.3 Visual Regression Testing
*Plan: 10.3 | Requirements: 14*

- [ ] **10.3.1** Set up Playwright for visual regression (install @playwright/test)
- [ ] **10.3.2** Write visual test: capture start screen
- [ ] **10.3.3** Write visual test: capture game screen at Step 1 (before choice)
- [ ] **10.3.4** Write visual test: capture meter at different values (0, 30, 50, 70, 85, 100)
- [ ] **10.3.5** Write visual test: capture unluck popup (regular)
- [ ] **10.3.6** Write visual test: capture Perfect Storm popup
- [ ] **10.3.7** Write visual test: capture ending screen (high score)
- [ ] **10.3.8** Write visual test: capture ending screen (low score)
- [ ] **10.3.9** Generate baseline screenshots on first run
- [ ] **10.3.10** Compare screenshots on subsequent runs, flag differences
- [ ] **10.3.11** Integrate visual tests into CI pipeline (optional)
- [ ] **10.3.12** Review and approve visual changes before merging

### 10.4 Manual QA Checklist
*Plan: 10.4 | Requirements: All*

- [ ] **10.4.1** Test "New Run" flow: verify new game starts, meter resets, step 1 loads
- [ ] **10.4.2** Test "Resume" flow: complete step 1, refresh page, verify state restored, continue game
- [ ] **10.4.3** Test "Reset Run" flow: complete game, click reset, verify localStorage cleared, return to start screen
- [ ] **10.4.4** Test all 5 steps with A choices (AAAAA path): verify each step loads, choices work, meter updates
- [ ] **10.4.5** Test all 5 steps with B choices (BBBBB path): verify each step loads, choices work, meter updates
- [ ] **10.4.6** Test mixed paths: ABABA, BABAB, AABBA, etc. (sample 5-10 different paths)
- [ ] **10.4.7** Test video modal: verify appears after choice, plays automatically, can be closed, auto-closes on completion
- [ ] **10.4.8** Test video modal skip: click Close button, press Escape key, verify game proceeds
- [ ] **10.4.9** Test video with `skipAnimations` enabled: verify video is skipped, game proceeds directly
- [ ] **10.4.10** Test video error handling: rename video file to trigger error, verify error message and Continue button work
- [ ] **10.4.11** Test unluck triggering: enable `?forceUnluck=true`, verify popup appears on each step, meter reduced
- [ ] **10.4.12** Test Perfect Storm: complete Step 4B with `?forceUnluck=true&forcePerfectStorm=true`, verify red popup, severe penalties
- [ ] **10.4.13** Test with different seeds: use `?seed=12345`, complete game, repeat with same seed, verify identical results
- [ ] **10.4.14** Test operator panel: enable `?operator=true`, verify all toggles and inputs work, affect game
- [ ] **10.4.15** Test on Chrome (latest version)
- [ ] **10.4.16** Test on Firefox (latest version)
- [ ] **10.4.17** Test on Safari (latest version)
- [ ] **10.4.18** Test on mobile device (iOS Safari)
- [ ] **10.4.19** Test on mobile device (Android Chrome)
- [ ] **10.4.20** Test on tablet (iPad Safari or Android Chrome)
- [ ] **10.4.21** Test keyboard navigation: Tab through all elements, Enter/Space to activate, Escape to close modals
- [ ] **10.4.22** Test screen reader (NVDA or VoiceOver): verify all content is announced, buttons are labeled
- [ ] **10.4.23** Test with invalid content pack: load pack with errors, verify validation error message, fallback to default
- [ ] **10.4.24** Test with no localStorage: disable in browser settings, verify game works in memory-only mode, shows warning
- [ ] **10.4.25** Test with slow network: throttle to 3G, verify assets load or fallback, game remains playable
- [ ] **10.4.26** Test ending screen: verify all ending tiers (0-100 range), verify sharing buttons work
- [ ] **10.4.27** Test replay flow: complete game, click replay, verify new game starts
- [ ] **10.4.28** Test analytics: enable consent, verify events are tracked (check network tab or logs)
- [ ] **10.4.29** Test analytics: decline consent, verify no events are sent
- [ ] **10.4.30** Document all issues found and create bug tickets

---

## Phase 11: Documentation and Deployment

### 11.1 User-Facing Documentation
*Plan: 11.1 | Requirements: 2, 19*

- [ ] **11.1.1** Update `README.md` with game overview and description
- [ ] **11.1.2** Add "How to Play" section: explain game concept, choices, meter, endings
- [ ] **11.1.3** Add "Getting Started" section: clone repo, install dependencies, run dev server
- [ ] **11.1.4** Add "Custom Content Packs" section: link to `docs/content-packs.md`, provide quick example
- [ ] **11.1.5** Add "URL Parameters" section: document `?pack=`, `?seed=`, `?operator=`, `?forceUnluck=`, etc.
- [ ] **11.1.6** Add "Analytics" section: explain consent, what data is collected (if any)
- [ ] **11.1.7** Add "License" section (choose appropriate license, e.g., MIT)
- [ ] **11.1.8** Add screenshots or GIF demo to README
- [ ] **11.1.9** Review and improve existing docs: `docs/content-packs.md`, `docs/scaling-meter.md`, `docs/unluck.md`
- [ ] **11.1.10** Ensure all docs are up-to-date with implementation

### 11.2 Developer Documentation
*Plan: 11.2 | Requirements: All*

- [ ] **11.2.1** Update `docs/meter-engine-quick-reference.md` with final API and examples
- [ ] **11.2.2** Update `docs/content-pack-quick-reference.md` with final schema and examples
- [ ] **11.2.3** Update `docs/unluck-api.md` with final API and examples
- [ ] **11.2.4** Create `docs/architecture.md` documenting high-level architecture, component tree, data flow
- [ ] **11.2.5** Document RNG call order for determinism (critical for debugging)
- [ ] **11.2.6** Document operator panel usage and all feature flags
- [ ] **11.2.7** Provide code examples for common scenarios: adding a new step, modifying deltas, changing meter tuning
- [ ] **11.2.8** Document testing strategy and how to run tests
- [ ] **11.2.9** Document deployment process
- [ ] **11.2.10** Add inline code comments for complex logic (meter engine, unluck, endings)

### 11.3 Deployment Configuration
*Plan: 11.3 | Requirements: 1, 2*

- [ ] **11.3.1** Configure Next.js for deployment target (Vercel, Netlify, static export, or Node.js server)
- [ ] **11.3.2** Set up environment variables for production (analytics endpoint, feature flags, etc.)
- [ ] **11.3.3** Configure CDN for static assets (images, videos, content packs) if using external assets
- [ ] **11.3.4** Set up CI/CD pipeline: GitHub Actions, Vercel CI, or similar
- [ ] **11.3.5** Configure CI to run: lint, type-check, unit tests, build
- [ ] **11.3.6** Configure automatic deployment on merge to main branch
- [ ] **11.3.7** Set up staging environment for testing before production deploy
- [ ] **11.3.8** Configure analytics endpoint in production environment (if using)
- [ ] **11.3.9** Test production build locally: `npm run build && npm start`
- [ ] **11.3.10** Verify build output is optimized (check bundle size, lighthouse score)
- [ ] **11.3.11** Deploy to staging environment and run full QA pass
- [ ] **11.3.12** Deploy to production environment
- [ ] **11.3.13** Verify production deployment: test game flow, verify assets load, check analytics
- [ ] **11.3.14** Set up monitoring and error tracking in production (Sentry, LogRocket, etc.)
- [ ] **11.3.15** Document deployment process for future updates

---

## Completion Checklist

Once all tasks are marked `[x]`, verify the following before considering the project complete:

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass (Playwright/Cypress)
- [ ] Manual QA checklist completed with no critical issues
- [ ] Lighthouse performance score >90
- [ ] Lighthouse accessibility score >90
- [ ] All documentation is complete and accurate
- [ ] Production deployment is successful
- [ ] Post-deployment smoke test passes
- [ ] Stakeholders have reviewed and approved the final product

---

**Total Tasks:** 344  
**Estimated Effort:** 27-37 developer-days (full-time, single developer)

This task list provides a comprehensive, actionable roadmap for building the game from scratch. Each task is linked to the implementation plan and requirements for full traceability.

**New in this version:** Added video modal playback feature (Requirement 21) with 39 additional tasks across component creation, integration, and testing.

