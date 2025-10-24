"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ContentPack,
  Delta,
  FeatureFlags,
  MeterConfig,
  MeterState,
  RunState,
  StepResult,
} from "@/types/game";
import { GameLayout } from "@/components/GameLayout";
import { ScalingMeter } from "@/components/ScalingMeter";
import { JourneyBreakdown } from "@/components/JourneyBreakdown";
import { mergeConfig, validateConfig } from "@/lib/config";
import { createInitialMeterState, updateMeterStateWithUnluck } from "@/lib/meter-engine";
import { createRNG } from "@/lib/rng";
import { useGame } from "@/contexts/GameContext";

// --- Types local to this page ---
interface StepChoiceEdit {
  selected: "A" | "B";
  optionA: Delta;
  optionB: Delta;
  // Per-step bad-luck overrides (all optional)
  forceUnluck?: boolean;
  unluckFactorOverride?: number; // e.g. 0.4..0.7
  forcePerfectStorm?: boolean;
}

interface ConfigOverrides extends Partial<MeterConfig> {}

// Utility: get deltas from pack
function extractPackDeltas(pack: ContentPack): StepChoiceEdit[] {
  return pack.steps
    .sort((a, b) => a.id - b.id)
    .map((step) => ({
      selected: "A",
      optionA: { ...step.optionA.delta },
      optionB: { ...step.optionB.delta },
    }));
}

export default function SimulationPage() {
  const { contentPack, isLoading } = useGame();

  // Seed: keep a stable deterministic seed while editing
  const [seed, setSeed] = useState<number>(123456);

  // Live config overrides for formula tuning
  const [overrides, setOverrides] = useState<ConfigOverrides>({});

  // Per-step edits (initialized from content pack)
  const [steps, setSteps] = useState<StepChoiceEdit[] | null>(null);

  useEffect(() => {
    if (contentPack && !steps) {
      setSteps(extractPackDeltas(contentPack));
    }
  }, [contentPack, steps]);

  // Compose effective config and validate
  const config: MeterConfig = useMemo(() => mergeConfig(overrides), [overrides]);
  const configErrors = useMemo(() => validateConfig(config), [config]);

  // Core simulation: recompute entire journey whenever anything changes
  const simulated = useMemo(() => {
    if (!contentPack || !steps) return null;

    // Build a synthetic RunState, but don’t touch GameContext
    let meter: MeterState = createInitialMeterState();
    const rng = createRNG(seed);
    const stepHistory: StepResult[] = [];

    contentPack.steps
      .sort((a, b) => a.id - b.id)
      .forEach((step, idx) => {
        const edit = steps[idx];
        const choice: "A" | "B" = edit.selected;
        const original: Delta = choice === "A" ? edit.optionA : edit.optionB;

        // Per-step unluck overrides
        const unluckOptions = {
          forceUnluck: !!edit.forceUnluck,
          forcePerfectStorm: !!edit.forcePerfectStorm,
          unluckFactorOverride: edit.unluckFactorOverride,
        } satisfies Partial<FeatureFlags>;

        const before = meter.displayValue;
        const { meterState, unluckResult } = updateMeterStateWithUnluck(
          meter,
          original,
          step.id,
          choice,
          rng,
          config,
          unluckOptions
        );

        const after = meterState.displayValue;

        // Minimal `StepResult` to feed JourneyBreakdown
        const stepResult: StepResult = {
          stepId: step.id,
          choice,
          appliedDelta: meterState.lastDelta || original,
          meterBefore: before,
          meterAfter: after,
          tierBefore: meter.tier,
          tierAfter: meterState.tier,
          insights: [], // optional; JourneyBreakdown handles empty
          unluckApplied: unluckResult.unluckApplied,
          luckFactor: unluckResult.luckFactor,
          perfectStorm: unluckResult.perfectStorm,
          timestamp: new Date().toISOString(),
        };

        stepHistory.push(stepResult);
        meter = meterState;
      });

    const runState: RunState = {
      seed,
      currentStep: 6, // completed
      meterState: meter,
      stepHistory,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      contentPackId: contentPack.id,
    };

    return { runState, meter };
  }, [contentPack, steps, seed, config]);

  if (isLoading || !contentPack || !steps) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-300">Loading simulation…</p>
      </div>
    );
  }

  return (
    <GameLayout
      scenarioPanel={(
        <div className="space-y-6">
          <FormulaEditor overrides={overrides} setOverrides={setOverrides} />
          <SeedEditor seed={seed} setSeed={setSeed} />
          {configErrors.length > 0 && (
            <div className="p-3 rounded border border-red-600 bg-red-900/20 text-red-200 text-sm">
              <div className="font-semibold mb-1">Config errors</div>
              <ul className="list-disc list-inside">
                {configErrors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}
          <JourneyEditor steps={steps} setSteps={setSteps} />
        </div>
      )}
      consolePanel={(
        <div className="p-4">
          {simulated && (
            <JourneyBreakdown runState={simulated.runState} config={config} />
          )}
        </div>
      )}
      meterPanel={(
        <div className="p-4">
          {simulated && (
            <ScalingMeter meterState={simulated.meter} previousValue={undefined} showInsights={true} />
          )}
        </div>
      )}
    />
  );
}

// --- UI Subcomponents (compact, focused on essentials) ---
function SeedEditor({ seed, setSeed }: { seed: number; setSeed: (v: number) => void }) {
  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded">
      <div className="text-sm font-semibold text-gray-200 mb-2">Deterministic Seed</div>
      <input type="number" value={seed}
        onChange={(e) => setSeed(Number(e.target.value) || 0)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
    </div>
  );
}

function FormulaEditor({ overrides, setOverrides }: { overrides: ConfigOverrides; setOverrides: (u: ConfigOverrides) => void; }) {
  const cfg = mergeConfig(overrides);
  const set = <T extends keyof MeterConfig>(k: T, v: MeterConfig[T]) => setOverrides({ ...overrides, [k]: v });
  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded space-y-4">
      <div className="text-sm font-semibold text-gray-200">Formula</div>
      {/* Weights */}
      <fieldset className="grid grid-cols-5 gap-2">
        {(["R","U","S","C","I"] as const).map(key => (
          <label key={key} className="text-xs text-gray-300">
            <div>Weight {key}</div>
            <input type="number" step={0.01} value={cfg.weights[key]}
              onChange={(e) => set("weights", { ...cfg.weights, [key]: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white" />
          </label>
        ))}
      </fieldset>
      {/* Sigmoid */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-300">
          <div>μ (mu)</div>
          <input type="number" step={0.1} value={cfg.sigmoid.mu}
            onChange={(e) => set("sigmoid", { ...cfg.sigmoid, mu: Number(e.target.value) })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white" />
        </label>
        <label className="text-xs text-gray-300">
          <div>σ (sigma)</div>
          <input type="number" step={0.1} value={cfg.sigmoid.sigma}
            onChange={(e) => set("sigmoid", { ...cfg.sigmoid, sigma: Number(e.target.value) })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white" />
        </label>
      </div>
      {/* Other switches kept compact; expand as needed */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cfg.diminishingReturns.enabled}
            onChange={(e) => set("diminishingReturns", { ...cfg.diminishingReturns, enabled: e.target.checked })} />
          Diminishing Returns (power {cfg.diminishingReturns.power})
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cfg.randomness.enabled}
            onChange={(e) => set("randomness", { ...cfg.randomness, enabled: e.target.checked })} />
          Randomness [{cfg.randomness.bounds.join(", ")}] 
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cfg.momentum.enabled}
            onChange={(e) => set("momentum", { ...cfg.momentum, enabled: e.target.checked })} />
          Momentum (+{cfg.momentum.bonus} after {cfg.momentum.streakThreshold})
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cfg.rubberBand.enabled}
            onChange={(e) => set("rubberBand", { ...cfg.rubberBand, enabled: e.target.checked })} />
          Rubber-band (&lt; {cfg.rubberBand.threshold} → +{cfg.rubberBand.bump} S)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cfg.unluck.enabled}
            onChange={(e) => set("unluck", { ...cfg.unluck, enabled: e.target.checked })} />
          Enable Bad Luck (p={cfg.unluck.probability})
        </label>
      </div>
    </div>
  );
}

function JourneyEditor({ steps, setSteps }: { steps: StepChoiceEdit[]; setSteps: (s: StepChoiceEdit[]) => void; }) {
  const update = (idx: number, patch: Partial<StepChoiceEdit>) => {
    const clone = steps.slice();
    clone[idx] = { ...clone[idx], ...patch };
    setSteps(clone);
  };
  const editDelta = (idx: number, which: "optionA"|"optionB", key: keyof Delta, value: number) => {
    const clone = steps.slice();
    clone[idx] = { ...clone[idx], [which]: { ...(clone[idx] as any)[which], [key]: value } } as StepChoiceEdit;
    setSteps(clone);
  };
  return (
    <div className="space-y-4">
      {steps.map((st, idx) => (
        <div key={idx} className="p-3 bg-gray-900 border border-gray-700 rounded">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-200">Step {idx+1}</div>
            <select value={st.selected}
              onChange={(e) => update(idx, { selected: e.target.value as "A"|"B" })}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm">
              <option value="A">Choose A</option>
              <option value="B">Choose B</option>
            </select>
          </div>

          {/* Deltas for A and B */}
          {(["optionA","optionB"] as const).map((which) => (
            <fieldset key={which} className="mt-3">
              <div className="text-xs text-gray-400 mb-1">{which === "optionA" ? "Option A deltas" : "Option B deltas"}</div>
              <div className="grid grid-cols-5 gap-2">
                {(["R","U","S","C","I"] as const).map((key) => (
                  <label key={key} className="text-xs text-gray-300">
                    <div>{key}</div>
                    <input type="number" step={0.1} value={st[which][key]}
                      onChange={(e) => editDelta(idx, which, key, Number(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white" />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {/* Bad luck controls */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!st.forceUnluck}
                onChange={(e) => update(idx, { forceUnluck: e.target.checked })} />
              Force Bad Luck (this step)
            </label>
            <label className="flex items-center gap-2">
              <span>Luck factor</span>
              <input type="number" step={0.05} min={0} max={1}
                value={st.unluckFactorOverride ?? ""}
                onChange={(e) => update(idx, { unluckFactorOverride: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white w-24" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!st.forcePerfectStorm}
                onChange={(e) => update(idx, { forcePerfectStorm: e.target.checked })} />
              Force Perfect Storm
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
