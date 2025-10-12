# Requirements Document

## Introduction

This document defines the requirements for **Choose Your Own Startup Adventure**, an interactive simulation game where players act as startup founders building an AI Cofounder SaaS product. The game presents players with strategic business decisions across 5 levels, visualizes an AI agent executing those decisions, and tracks progress through a dynamic scaling meter that determines the final outcome.

The game is designed for:
- **Expo/demo environments** (kiosks, conferences)
- **Educational purposes** (startup strategy, decision-making)
- **Content creators** (hot-swappable content packs)

---

## Requirements

### 1. Game Initialization and Session Management

**User Story:**
> As a user, I want to start a new game or resume my previous progress so that I can experience the game at my own pace without losing my progress.

**Acceptance Criteria:**
- WHEN the user first visits the application THEN the system SHALL display a start screen with "New Run" and "Resume" options
- WHEN the user clicks "New Run" THEN the system SHALL initialize a new game session with a unique seed, reset scaling meter (0), and set current step to 1
- WHEN the user clicks "Resume" THEN the system SHALL load the most recent RunState from browser localStorage if available
- WHEN no saved state exists and user clicks "Resume" THEN the system SHALL display an error message and redirect to "New Run"
- WHEN a game session is active THEN the system SHALL persist RunState to localStorage after each step completion
- WHEN the user chooses "Reset Run" THEN the system SHALL clear all localStorage data and reinitialize to step 1

### 2. Content Pack Loading and Management

**User Story:**
> As a content creator, I want to load custom content packs via JSON/YAML so that I can create and test new game scenarios without code changes.

**Acceptance Criteria:**
- WHEN the application initializes THEN the system SHALL attempt to load a content pack from the URL parameter `?pack={packId}` or `?packUrl={url}`
- WHEN no URL parameter is provided THEN the system SHALL load the default "ai-cofounder-v1" content pack
- WHEN a content pack is loaded THEN the system SHALL validate it against the ContentPack schema
- WHEN validation fails THEN the system SHALL display detailed error messages indicating which fields are invalid
- WHEN validation succeeds THEN the system SHALL make the content pack available to all game components
- WHEN a content pack contains exactly 5 steps with 2 choices each THEN validation SHALL pass
- WHEN delta values are outside the range [-10, +15] THEN validation SHALL fail with a clear error message
- WHEN the content pack version does not follow semantic versioning (X.Y.Z) THEN validation SHALL fail

### 3. Game Level Presentation

**User Story:**
> As a player, I want to see engaging scenario descriptions and two clear choice options at each level so that I can make informed strategic decisions.

**Acceptance Criteria:**
- WHEN a game level loads THEN the system SHALL display the step title, subtitle (if present), and scenario text in the left panel
- WHEN options are displayed THEN the system SHALL show both Option A and Option B with labels and detailed body text
- WHEN the player hovers over an option THEN the system SHALL provide visual feedback (hover state)
- WHEN options exceed 200 characters for label or 1000 characters for body THEN the system SHALL truncate or validate during content pack loading
- WHEN a step has associated assets THEN the system SHALL attempt to load and display them with fallback to simulated output if unavailable

### 4. Choice Selection and Feedback

**User Story:**
> As a player, I want to select a choice and see immediate feedback on how it affects my startup so that I understand the consequences of my decisions.

**Acceptance Criteria:**
- WHEN the player clicks an option THEN the system SHALL record the choice (A or B) and apply the associated delta to the scaling meter
- WHEN a choice is applied THEN the system SHALL calculate the new meter state using the meter engine
- WHEN the meter updates THEN the system SHALL display a visual animation showing the meter change
- WHEN the meter change is positive THEN the system SHALL show an upward animation with green color
- WHEN the meter change is negative THEN the system SHALL show a downward animation with red color
- WHEN the meter crosses a tier boundary THEN the system SHALL display the new tier badge prominently
- WHEN feedback is complete THEN the system SHALL enable the "Next Step" button

### 5. Scaling Meter Calculation and Display

**User Story:**
> As a player, I want to see a visual representation of my startup's scaling progress so that I can track how my decisions affect overall success.

**Acceptance Criteria:**
- WHEN the game initializes THEN the scaling meter SHALL start at 0 with the "🚧 Scrappy Mode" tier (0-29)
- WHEN a choice delta is applied THEN the system SHALL update the 5-dimensional hidden state (R, U, S, C, I) with diminishing returns (power 0.9)
- WHEN the hidden state is updated THEN the system SHALL compute a weighted sum: 0.30*R + 0.25*U + 0.20*S + 0.15*C + 0.10*I
- WHEN the weighted sum is computed THEN the system SHALL normalize it using sigmoid function with μ=-4 and σ=11
- WHEN normalization is complete THEN the system SHALL add momentum bonus (+3 if streak ≥ 2) and randomness (±5)
- WHEN the final value is calculated THEN the system SHALL clamp it to [0, 100] and round to one decimal place
- WHEN the meter is below 30 THEN the system SHALL apply a +2 rubber-band bonus to the System dimension on the next step
- WHEN the meter is displayed THEN the system SHALL show the appropriate tier: 0-29 (Scrappy), 30-49 (Finding Fit), 50-69 (Gaining Steam), 70-84 (Scaling Up), 85-100 (Breakout)

### 6. Junie Console Visualization

**User Story:**
> As a player, I want to see a simulated AI agent (Junie) working on my chosen task so that the game feels immersive and demonstrates AI capabilities.

**Acceptance Criteria:**
- WHEN a choice is selected THEN the system SHALL display streaming console logs in the right panel simulating Junie's work
- WHEN console logs stream THEN the system SHALL animate text appearing line-by-line with realistic timing
- WHEN appropriate for the task THEN the system SHALL display code diffs showing changes Junie is making
- WHEN code diffs are shown THEN the system SHALL use syntax highlighting and diff formatting (+/- lines)
- WHEN logs complete THEN the system SHALL show a completion message with a success or warning indicator
- WHEN the console is scrollable THEN the system SHALL auto-scroll to show the latest output

### 7. Insight Generation

**User Story:**
> As a player, I want to receive 1-2 short insights after each decision so that I understand what aspects of my startup are thriving or struggling.

**Acceptance Criteria:**
- WHEN a step completes THEN the system SHALL generate 1-2 micro-insights based on the dominant dimensions of the hidden state
- WHEN insights are generated THEN the system SHALL identify the highest and lowest dimensions (R, U, S, C, I)
- WHEN the highest dimension is Revenue THEN an insight SHALL mention revenue momentum or monetization
- WHEN the lowest dimension is System THEN an insight SHALL suggest infrastructure or scalability concerns
- WHEN insights are displayed THEN they SHALL be concise (≤100 characters) and contextual to the player's choices
- WHEN multiple insights are shown THEN they SHALL not repeat the same dimension

### 8. Unluck System (Regular)

**User Story:**
> As a player, I want occasional bad luck events that feel realistic so that the game reflects the unpredictability of startup life.

**Acceptance Criteria:**
- WHEN a choice is applied THEN the system SHALL roll for unluck with a 10% probability
- WHEN unluck triggers THEN the system SHALL reduce only positive delta components by a factor between 0.4 and 0.7
- WHEN unluck triggers THEN the system SHALL preserve negative delta components (tradeoffs unchanged)
- WHEN unluck applies THEN the system SHALL select a contextual message matching the specific step and choice
- WHEN an unluck message is displayed THEN it SHALL appear in a popup/overlay with a warning icon (⚠️) and snarky tone
- WHEN unluck is applied THEN the system SHALL record `unluckApplied: true` and the actual `luckFactor` in the StepResult
- WHEN the same seed is used THEN unluck rolls SHALL be deterministic and reproducible

### 9. Perfect Storm Special Unluck

**User Story:**
> As a player, I want a dramatic special event when I make risky decisions without proper infrastructure so that strategic mistakes have memorable consequences.

**Acceptance Criteria:**
- WHEN the player chooses Step 4 Option B (AI Support Chatbot) AND regular unluck triggers THEN the system SHALL roll for Perfect Storm with 100% probability
- WHEN Perfect Storm triggers THEN the system SHALL apply additional penalties: 50% scaling gains reduction, 50% Users reduction, 70% Customers reduction, 40% Investors reduction
- WHEN Perfect Storm triggers THEN the system SHALL display a red popup (instead of pink) with explosion emoji (💥) and "PERFECT STORM" messaging
- WHEN Perfect Storm messaging is shown THEN it SHALL emphasize the consequence of skipping infrastructure investment
- WHEN Perfect Storm is recorded THEN the system SHALL set `perfectStorm: true` in the StepResult
- WHEN Perfect Storm does NOT occur (Step 4A chosen or no unluck on 4B) THEN it SHALL NOT trigger

### 10. Operator Controls and Dev Mode

**User Story:**
> As a demo operator or developer, I want debug controls to force specific game states so that I can demonstrate features reliably or test edge cases.

**Acceptance Criteria:**
- WHEN the URL parameter `?operator=true` is present THEN the system SHALL display an operator panel with debug controls
- WHEN the operator panel is open THEN it SHALL provide toggles for: force unluck, force Perfect Storm, show hidden state, enable debug console
- WHEN the operator sets a fixed seed THEN the system SHALL use that seed for all RNG operations
- WHEN the operator sets `unluckFactorOverride` THEN the system SHALL use that specific factor (0.4-0.7) instead of rolling
- WHEN force unluck is enabled THEN every step SHALL trigger unluck regardless of probability
- WHEN force Perfect Storm is enabled THEN Step 4B SHALL always trigger Perfect Storm if unluck occurs
- WHEN "show hidden state" is enabled THEN the system SHALL display the raw R, U, S, C, I values alongside the meter

### 11. Final Ending Calculation

**User Story:**
> As a player, I want to see a personalized ending based on my journey so that I understand the overall outcome of my strategic decisions.

**Acceptance Criteria:**
- WHEN the player completes Step 5 THEN the system SHALL calculate the final ending tier based on the final meter value and dominant dimensions
- WHEN the final meter is 85-100 THEN the system SHALL show the "🦄 Unicorn" ending
- WHEN the final meter is 70-84 THEN the system SHALL show the "🚀 Scaling Up" ending
- WHEN the final meter is 50-69 THEN the system SHALL show the "⚡ Gaining Steam" ending
- WHEN the final meter is 30-49 THEN the system SHALL show the "🌱 Finding Fit" ending
- WHEN the final meter is 0-29 THEN the system SHALL show the "🚧 Scrappy/Zombie" or "🔥 Crash & Burn" ending
- WHEN the ending is displayed THEN the system SHALL show: top 2 positive drivers, 1 bottleneck dimension, and a "next step" suggestion
- WHEN the ending summary is complete THEN the system SHALL provide a "Replay" button and hint at alternate paths

### 12. Shareable Results Card

**User Story:**
> As a player, I want to share my game results on social media so that I can showcase my strategic decisions and outcomes.

**Acceptance Criteria:**
- WHEN the final ending is displayed THEN the system SHALL generate a shareable card with the ending title, final meter, path taken (choices), and top insight
- WHEN the player clicks "Share" THEN the system SHALL provide options to share on Twitter, LinkedIn, or copy link
- WHEN the share card is generated THEN it SHALL include visually appealing graphics and branding
- WHEN a share link is clicked externally THEN the system SHALL display a static view of the shared result (no need to replay the game)

### 13. Replay and Alternate Paths

**User Story:**
> As a player, I want hints about alternate paths after finishing so that I'm encouraged to replay and explore different strategies.

**Acceptance Criteria:**
- WHEN the ending screen is shown THEN the system SHALL analyze the player's path and suggest 1-2 alternate choices that would lead to different outcomes
- WHEN a replay button is clicked THEN the system SHALL reset the game to Step 1 with a new seed
- WHEN replaying THEN the system SHALL preserve the previous run's history for comparison (optional analytics)

### 14. UI Layout and Responsiveness

**User Story:**
> As a user, I want a clean, intuitive interface that works well on different screen sizes so that I can play comfortably on kiosks, desktops, and tablets.

**Acceptance Criteria:**
- WHEN the game loads THEN the UI SHALL display a three-panel layout: left (scenario/options), right (Junie console), bottom (scaling meter)
- WHEN content overflows THEN each panel SHALL scroll independently without affecting the main screen
- WHEN viewed on tablets or smaller screens THEN the layout SHALL stack vertically: scenario, console, meter
- WHEN buttons are displayed THEN they SHALL have adequate touch targets (min 44x44px) for kiosk use
- WHEN the UI is rendered THEN it SHALL follow modern design principles: clear typography, consistent spacing, and accessible color contrast

### 15. Analytics and Consent

**User Story:**
> As a product owner, I want to collect anonymized analytics on player choices so that I can understand which paths are popular and optimize the game experience.

**Acceptance Criteria:**
- WHEN the game starts THEN the system SHALL request consent for analytics collection
- WHEN the user consents THEN the system SHALL track: choices made, meter progression, final ending, session duration, unluck occurrences
- WHEN the user declines THEN the system SHALL NOT send any analytics data but still allow full gameplay
- WHEN analytics are collected THEN data SHALL be anonymized (no PII collected)
- WHEN a session ends THEN the system SHALL send a summary payload to the analytics endpoint (if configured)

### 16. Error Handling and Fallbacks

**User Story:**
> As a user, I want the game to handle errors gracefully so that I can continue playing even if some assets fail to load.

**Acceptance Criteria:**
- WHEN an asset URL fails to load THEN the system SHALL display a fallback placeholder or simulated output
- WHEN a content pack fails validation THEN the system SHALL fall back to the default content pack and log the error
- WHEN localStorage is unavailable THEN the system SHALL operate in memory-only mode with a warning that progress won't persist
- WHEN network errors occur during asset loading THEN the system SHALL retry once, then show fallback
- WHEN critical errors occur THEN the system SHALL display a user-friendly error message with a "Restart" option

### 17. Performance and Loading

**User Story:**
> As a user, I want the game to load quickly and run smoothly so that I can start playing immediately without frustrating delays.

**Acceptance Criteria:**
- WHEN the application loads THEN the initial bundle size SHALL be optimized for fast loading (target <500KB initial JS)
- WHEN assets are loaded THEN they SHALL be lazy-loaded on-demand per step
- WHEN animations run THEN they SHALL maintain 60fps performance on modern devices
- WHEN the game transitions between steps THEN the transition SHALL complete within 200ms (perceived instant)
- WHEN content packs are loaded THEN parsing SHALL complete within 100ms for typical pack sizes (~50KB JSON)

### 18. Accessibility

**User Story:**
> As a user with accessibility needs, I want the game to be keyboard-navigable and screen-reader friendly so that I can play independently.

**Acceptance Criteria:**
- WHEN the user navigates via keyboard THEN all interactive elements SHALL be reachable via Tab key
- WHEN an element receives focus THEN it SHALL display a visible focus indicator
- WHEN a screen reader is active THEN all UI elements SHALL have appropriate ARIA labels and roles
- WHEN visual-only information is presented (e.g., meter animation) THEN equivalent text alternatives SHALL be provided
- WHEN color is used to convey information THEN it SHALL be supplemented with text or icons (e.g., red/green meter changes also show +/- icons)

### 19. Hot-Swappable Content Packs (A/B Testing)

**User Story:**
> As a content strategist, I want to version content packs and A/B test different scenario texts or delta values so that I can optimize engagement without code deploys.

**Acceptance Criteria:**
- WHEN multiple content pack versions exist THEN the system SHALL support loading by version: `?pack=ai-cofounder&version=1.2.0`
- WHEN A/B testing is enabled THEN the system SHALL randomly assign users to pack variants and track which variant was used
- WHEN a new pack version is published THEN existing players SHALL continue with their current version until they start a new run
- WHEN delta values change between versions THEN the system SHALL validate that new values are still balanced (optional validation warnings)

### 20. Seeded RNG and Reproducibility

**User Story:**
> As a developer or QA tester, I want to reproduce exact game runs using seeds so that I can debug issues and verify fixes.

**Acceptance Criteria:**
- WHEN a new game starts THEN the system SHALL generate a random seed from the current timestamp
- WHEN a seed is provided via URL (`?seed=12345`) THEN the system SHALL use that seed for all RNG operations
- WHEN the same seed is used with the same choices THEN all randomness (meter noise, unluck rolls, message selection) SHALL produce identical results
- WHEN the seed is displayed in dev mode THEN it SHALL be copyable for sharing bug reports
- WHEN RNG is called THEN the call order SHALL remain stable across updates (unluck → rubber-band → meter randomness)

### 21. Video Clip Playback

**User Story:**
> As a player, I want to see a video clip after making a choice so that I get visual feedback and an engaging transition between game steps.

**Acceptance Criteria:**
- WHEN the player selects a choice (A or B) THEN the system SHALL immediately display a video modal overlay
- WHEN the video modal appears THEN it SHALL display the video file (`video/clip1.mp4`) in a centered player with playback controls
- WHEN the video starts playing THEN it SHALL auto-play without requiring user interaction
- WHEN the video completes THEN the modal SHALL auto-close and the game SHALL proceed to show feedback (meter update, insights)
- WHEN the user clicks a "Close" or "Skip" button THEN the modal SHALL close immediately and the game SHALL proceed
- WHEN the user clicks outside the video modal THEN the modal SHALL remain open (prevent accidental closes)
- WHEN the video fails to load THEN the system SHALL display an error message and provide a "Continue" button to proceed without video
- WHEN the modal is open THEN the background game UI SHALL be dimmed and non-interactive
- WHEN keyboard navigation is used THEN Escape key SHALL close the modal, Space/Enter SHALL pause/play the video
- WHEN the operator panel has "Skip Animations" enabled THEN the video modal SHALL be skipped entirely

---

## Requirements Coverage Summary

- **Game Flow**: Requirements 1, 3, 4, 11, 13, 21
- **Content Management**: Requirements 2, 19
- **Scaling Meter**: Requirements 5, 7, 20
- **Visualization**: Requirements 6, 21
- **Unluck System**: Requirements 8, 9
- **Developer Tools**: Requirements 10, 20
- **UI/UX**: Requirements 14, 18, 21
- **Persistence & Analytics**: Requirements 1, 15
- **Quality & Performance**: Requirements 16, 17

All requirements are linked to specific features in the implementation plan (`docs/plan.md`) and detailed technical tasks (`docs/tasks.md`).

