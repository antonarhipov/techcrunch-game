# Choose Your Own Startup Adventure: Building AI Cofounder with Junie

Interactive expo/demo game where players act as a founder building AI Cofounder SaaS. 
Players make branching choices each step; the game visualizes the agent at work and updates a Scaling Meter.

Game levels description is in `docs/game-levels.md` file.
Scaling meter description is in `docs/scaling-meter.md` file.
Unluck system description is in `docs/unluck.md` file.
Content packs are described in `docs/content-packs.md` file.

## Core Loop (per Step aka "Game Level")
1.	Present Scenario (from content pack).
2.	Player Chooses option A or B.
3.	Play Video Clip: show video in modal dialog; auto-proceed when complete or allow manual close.
4.	Visualize Feedback: show meter delta, short insights, and unlock next step.
5.	Proceed until final step → Ending selection.

## Game Flow
•	Start Screen → “New Run” / “Resume” → consent to analytics.
•	Steps 1–5 (levels already defined): each has two choices, each mapped to one agent prompt.
•	Finale: compute ending tier from final meter; show summary and sharable card.
•	Replay: offer alternate path hints.

## UI Requirements
•	Layout
•	Left: Scenario + Options (A/B).
•	Right: Junie Console (streaming logs, code diffs, artifact previews).
•	Bottom: Scaling Meter (bar + delta + tier tag + 1–2 insights).
•	No scrolling for the main screen; all parts are scrollable separately

## Endings Logic (High-Level)
•	Use final meter and dominant dimensions to select:
•	Unicorn, Scaling Up, Gaining Steam, Finding Fit, Scrappy/Zombie, Crash & Burn.
•	Show personalized summary: top 2 positive drivers, 1 bottleneck, and “next step” suggestion.

## Content Management
•	Content is JSON/YAML; hot-swappable without code deploy.
•	Versioned packs allow A/B testing (copy tweaks, deltas).
•	Demo assets referenced by URL; fallback to simulated output if missing.

## Persistence
•	Browser localStorage for expo kiosks; optional short-lived server session.
•	“Reset Run” clears state; “Resume” reloads latest RunState.