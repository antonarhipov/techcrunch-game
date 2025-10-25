"use client";

/**
 * Journey Breakdown Component
 * Detailed explanation of how choices impacted the final score
 */

import { useState } from "react";
import type { RunState, MeterConfig } from "@/types/game";
import { DEFAULT_CONFIG } from "@/lib/config";

interface JourneyBreakdownProps {
  runState: RunState;
  config?: MeterConfig;
}


const DIMENSION_NAMES = {
  R: "Revenue",
  U: "Users",
  S: "System",
  C: "Customers",
  I: "Investors",
};

export function JourneyBreakdown({ runState, config = DEFAULT_CONFIG }: JourneyBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [openStepFormulas, setOpenStepFormulas] = useState<Record<number, boolean>>({});
  const [openUnluckDetails, setOpenUnluckDetails] = useState<Record<number, boolean>>({});

  const weights = config.weights;
  const hidden = runState.meterState.hiddenState;
  const rawWeightedSum = (Object.keys(weights) as Array<keyof typeof weights>).reduce(
    (sum, key) => sum + hidden[key] * weights[key],
    0
  );
  const { mu, sigma } = config.sigmoid;
  const sigmoid = (x: number) => 100 / (1 + Math.exp(-(x - mu) / sigma));
  const baseScore = sigmoid(rawWeightedSum);
  const effectsDelta = runState.meterState.displayValue - baseScore;
  const signedEffects = `${effectsDelta >= 0 ? "+" : ""}${effectsDelta.toFixed(1)}`;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
      {/* Header - Clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isOpen ? "📊" : "📈"}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">
              Your Journey Breakdown
            </h3>
            <p className="text-sm text-gray-300">
              See how each choice impacted your score
            </p>
            <div className="mt-1 text-xs text-gray-400">
              <span className="mr-1">Seed:</span>
              <code className="px-1 py-0.5 rounded bg-gray-900 border border-gray-700 text-gray-200">{runState.seed}</code>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {isOpen ? "Hide details" : "Show details"}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700">
          {/* Formula Explanation Toggle */}
          <div className="mt-4 mb-6">
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="inline-flex items-center gap-2 px-2 py-1 text-lg font-medium rounded border border-purple-600 bg-purple-700/10 text-purple-300 hover:border-purple-500 hover:bg-purple-700/75 transition-colors"
            >
              {showFormula ? "Hide" : "Show"} calculation formula
            </button>
          </div>

          {/* Formula Details */}
          {showFormula && (
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3">
                How the Score is Calculated
              </h4>
              
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  Your final score is calculated using a weighted sum of five dimensions,
                  then normalized through a sigmoid function:
                </p>
                
                {/* Step 1: Weighted Sum */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="font-medium mb-2">Step 1: Weighted Sum</p>
                  <div className="font-mono text-xs bg-gray-950 p-2 rounded">
                    Raw Score = (R × {weights.R}) + (U × {weights.U}) + (S × {weights.S}) + (C × {weights.C}) + (I × {weights.I})
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Each dimension has a different weight reflecting its importance to startup success.
                  </p>
                </div>

                {/* Step 2: Diminishing Returns */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="font-medium mb-2">Step 2: Diminishing Returns</p>
                  <div className="font-mono text-xs bg-gray-950 p-2 rounded">
                    Each dimension<sup>0.9</sup> (prevents over-optimization of single dimension)
                  </div>
                </div>

                {/* Step 3: Sigmoid Normalization */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="font-medium mb-2">Step 3: Sigmoid Normalization</p>
                  <div className="font-mono text-xs bg-gray-950 p-2 rounded">
                    Score = 100 / (1 + e<sup>-(Raw - μ) / σ</sup>)
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Maps the raw score to 0-100 range with smooth transitions (μ={config.sigmoid.mu}, σ={config.sigmoid.sigma}).
                  </p>
                </div>

                {/* Additional Mechanics */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="font-medium mb-2">Additional Mechanics</p>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>Random noise (±{config.randomness.bounds[1]}) adds unpredictability</li>
                    <li>Momentum bonus (+{config.momentum.bonus}) for {config.momentum.streakThreshold}+ consecutive gains</li>
                    <li>Rubber-band (+{config.rubberBand.bump} to System) helps if score drops below {config.rubberBand.threshold}</li>
                    <li>Unluck events ({config.unluck.probability * 100}% chance) reduce positive gains by {config.unluck.factorRange[0] * 100}-{config.unluck.factorRange[1] * 100}%</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-Step Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white mb-3">
              Step-by-Step Impact
            </h4>

            {runState.stepHistory.map((step, index) => (
              <div
                key={step.stepId}
                className="p-4 bg-gradient-to-r from-purple-900/20 to-orange-900/20 rounded-lg border border-purple-700"
              >
                {/* Step Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">
                      Step {step.stepId}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded border border-purple-300 bg-purple-900/5 text-purple-50">
                      Choice {step.choice}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {step.meterBefore.toFixed(1)}%
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className={`text-sm font-semibold ${
                      step.meterAfter > step.meterBefore ? "text-green-400" : "text-red-400"
                    }`}>
                      {step.meterAfter.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Delta Details */}
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {(Object.keys(DIMENSION_NAMES) as Array<keyof typeof DIMENSION_NAMES>).map((key) => {
                      const value = step.appliedDelta[key];
                      const isPositive = value > 0;
                      const isNegative = value < 0;
                      
                      return (
                        <div
                          key={key}
                          className="text-center p-2 rounded"
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {DIMENSION_NAMES[key]}
                          </div>
                          <div className={`text-2xl font-bold ${
                            isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-gray-300"
                          }`}>
                            {isPositive ? "+" : ""}{value.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ×{weights[key]} = {(value * weights[key]).toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-step formula toggle */}
                  <div className="mb-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenStepFormulas((prev) => ({ ...prev, [step.stepId]: !(prev[step.stepId] ?? false) }))
                      }
                      className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded border border-purple-600 bg-purple-700/30 text-purple-300 hover:border-purple-500 hover:bg-purple-700/40 transition-colors"
                    >
                      {(openStepFormulas[step.stepId] ?? false) ? "Hide formulas" : "Show formulas"}
                    </button>
                  </div>

                  {/* Weighted Contribution */}
                  {(openStepFormulas[step.stepId] ?? false) && (
                  <div className="text-xs text-gray-300 bg-purple-800/20 border border-purple-700 p-2 rounded">
                    <span className="font-medium">Weighted impact:</span>{" "}
                    <span className="font-mono">
                      {(Object.keys(weights) as Array<keyof typeof weights>).map((key, idx) => {
                        const value = step.appliedDelta[key];
                        const signed = `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
                        return (
                          <span key={key}>
                            {idx > 0 && " + "}
                            ({signed}×{weights[key]})
                          </span>
                        );
                      })}
                      {" = "}
                      {(Object.keys(weights) as Array<keyof typeof weights>).reduce(
                        (sum, key) => sum + step.appliedDelta[key] * weights[key],
                        0
                      ).toFixed(1)}
                    </span>
                  </div>
                  )}

                  {/* Sigmoid + Effects for this step */}
                  {(openStepFormulas[step.stepId] ?? false) && (() => {
                    const keys = Object.keys(weights) as Array<keyof typeof weights>;
                    const suffix: Record<keyof typeof weights, number> = keys.reduce((acc, key) => {
                      let s = 0;
                      for (let j = index; j < runState.stepHistory.length; j++) {
                        s += runState.stepHistory[j]?.appliedDelta[key] ?? 0;
                      }
                      acc[key] = s;
                      return acc;
                    }, {} as Record<keyof typeof weights, number>);

                    const hiddenBefore: Record<keyof typeof weights, number> = keys.reduce((obj, key) => {
                      obj[key] = hidden[key] - suffix[key];
                      return obj;
                    }, {} as Record<keyof typeof weights, number>);

                    const rawBefore = keys.reduce((sum, key) => sum + hiddenBefore[key] * weights[key], 0);

                    const hiddenAfter: Record<keyof typeof weights, number> = keys.reduce((obj, key) => {
                      obj[key] = hiddenBefore[key] + step.appliedDelta[key];
                      return obj;
                    }, {} as Record<keyof typeof weights, number>);

                    const rawAfter = keys.reduce((sum, key) => sum + hiddenAfter[key] * weights[key], 0);

                    const baseBefore = sigmoid(rawBefore);
                    const baseAfter = sigmoid(rawAfter);
                    const baseDelta = baseAfter - baseBefore;
                    const totalDelta = step.meterAfter - step.meterBefore;
                    const effectsDeltaStep = totalDelta - baseDelta;

                    const signedBase = `${baseDelta >= 0 ? "+" : ""}${baseDelta.toFixed(1)}`;
                    const signedEffectsStep = `${effectsDeltaStep >= 0 ? "+" : ""}${effectsDeltaStep.toFixed(1)}`;
                    const signedTotal = `${totalDelta >= 0 ? "+" : ""}${totalDelta.toFixed(1)}`;

                    return (
                      <div className="mt-2 text-xs text-gray-300 bg-purple-800/20 border border-purple-700 p-2 rounded">
                        <span className="font-medium">Score change (sigmoid + effects):</span>{" "}
                        <span className="font-mono">
                          100/(1 + e^-(({rawAfter.toFixed(1)} - {mu})/{sigma})) {" - "}
                          100/(1 + e^-(({rawBefore.toFixed(1)} - {mu})/{sigma})) {" = "}
                          {signedBase} {" + "}
                          effects ({signedEffectsStep}) {" = "}
                          {signedTotal}%
                        </span>
                      </div>
                    );
                  })()}

                  {/* Unluck/Perfect Storm Indicators */}
                  {step.unluckApplied && (
                    <div className={`mt-2 p-2 rounded ${
                      "bg-gray-600 border border-gray-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {step.perfectStorm ? "💥" : "⚠️"}
                        </span>
                        <div className="text-xs">
                          <span className={`font-semibold ${
                            step.perfectStorm ? "text-red-400" : "text-orange-400"
                          }`}>
                            {step.perfectStorm ? "Perfect Storm!" : "Bad Luck!"}
                          </span>
                          <span className="text-gray-300 ml-2">
                            {(() => {
                              const unluckMsg = step.unluckMessage ?? "Something unexpected went wrong, but you'll recover.";
                              const luckPct = Math.round((step.luckFactor ?? 1) * 100);
                              return `${unluckMsg} Gains trimmed to ${luckPct}%.`;
                            })()}
                          </span>
                        </div>
                      </div>
                      {step.perfectStorm && !(step.unluckMessage?.includes("PERFECT STORM")) && (
                        <div className="mt-1 text-xs text-gray-300">
                          Perfect Storm: a severe, compounding setback hit multiple systems (Revenue, Users, Customers, Investors).
                        </div>
                      )}

                      {/* What happened explanation */}
                      <div className="mt-2 text-xs text-gray-200">
                        <p className="text-gray-200">
                          {step.perfectStorm
                            ? "A rare Perfect Storm combined multiple setbacks at once. Even strong moves struggled to land this turn."
                            : ""}
                        </p>
                        {(() => {
                          const lf = step.luckFactor;
                          if (lf === undefined) return null;
                          const amp = 2 - lf;
                          return (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenUnluckDetails((prev) => ({
                                      ...prev,
                                      [step.stepId]: !(prev[step.stepId] ?? false),
                                    }))
                                  }
                                  className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded border border-purple-600 bg-purple-700/30 text-purple-300 hover:border-purple-500 hover:bg-purple-700/40 transition-colors"
                                >
                                  {(openUnluckDetails[step.stepId] ?? false) ? "Hide details" : "What happened?"}
                                </button>
                                <span className="text-gray-300">
                                  +deltas × {lf.toFixed(2)} • −deltas × {amp.toFixed(2)}
                                </span>
                              </div>

                              {(openUnluckDetails[step.stepId] ?? false) && (() => {
                                const keys = Object.keys(weights) as Array<keyof typeof weights>;
                                const affected = keys
                                  .map((k) => ({ k, v: step.appliedDelta[k], w: Math.abs(step.appliedDelta[k] * weights[k]) }))
                                  .filter((item) => item.v !== 0)
                                  .sort((a, b) => b.w - a.w)
                                  .slice(0, 3);
                                return (
                                  <div className="mt-2 bg-purple-800/20 border border-purple-700 p-2 rounded">
                                    <div className="text-gray-300">
                                      Most affected: {affected.length === 0
                                        ? "—"
                                        : affected.map((a, i) => {
                                            const name = DIMENSION_NAMES[a.k];
                                            const signed = `${a.v >= 0 ? "+" : ""}${a.v.toFixed(1)}`;
                                            return (
                                              <span key={String(a.k)}>{i > 0 ? ", " : ""}{name} ({signed})</span>
                                            );
                                          })}
                                    </div>
                                    <div className="mt-1 text-gray-400">
                                      Positive gains were cut to {(lf * 100).toFixed(0)}% and negatives hit {(amp * 100).toFixed(0)}% strength this turn.
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {step.insights.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {step.insights.map((insight, idx) => (
                        <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final State Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-orange-900/20 rounded-lg border border-purple-700">
            <h4 className="font-semibold text-white mb-3">Final State</h4>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(DIMENSION_NAMES) as Array<keyof typeof DIMENSION_NAMES>).map((key) => {
                const value = runState.meterState.hiddenState[key];
                
                return (
                  <div key={key} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {DIMENSION_NAMES[key]}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ×{weights[key]} = {(value * weights[key]).toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-purple-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Total Weighted Sum (before normalization):
                </span>
                <span className="text-lg font-bold text-white">
                  {rawWeightedSum.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-300 bg-purple-800/20 border border-purple-700 p-2 rounded">
                <span className="font-medium">Total Weighted Sum:</span>{" "}
                <span className="font-mono">
                  {(Object.keys(weights) as Array<keyof typeof weights>).map((key, idx) => {
                    const value = hidden[key];
                    const signed = `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
                    return (
                      <span key={key}>
                        {idx > 0 && " + "}
                        ({signed}×{weights[key]})
                      </span>
                    );
                  })}
                  {" = "}
                  {rawWeightedSum.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-300">
                  Final Score (after sigmoid + effects):
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                  {runState.meterState.displayValue.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-300 bg-purple-800/20 border border-purple-700 p-2 rounded">
                <span className="font-medium">Final Score:</span>{" "}
                <span className="font-mono">
                  100/(1 + e^-(({rawWeightedSum.toFixed(1)} - {mu})/{sigma})) {" = "}
                  {baseScore.toFixed(1)} {" + "}
                  effects ({signedEffects}) {" = "}
                  {runState.meterState.displayValue.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

