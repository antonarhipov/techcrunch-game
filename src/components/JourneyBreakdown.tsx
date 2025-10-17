"use client";

/**
 * Journey Breakdown Component
 * Detailed explanation of how choices impacted the final score
 */

import { useState } from "react";
import type { RunState } from "@/types/game";
import { DEFAULT_CONFIG } from "@/lib/config";

interface JourneyBreakdownProps {
  runState: RunState;
}


const DIMENSION_NAMES = {
  R: "Revenue",
  U: "Users",
  S: "System",
  C: "Customers",
  I: "Investors",
};

export function JourneyBreakdown({ runState }: JourneyBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const weights = DEFAULT_CONFIG.weights;

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
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                    Maps the raw score to 0-100 range with smooth transitions (μ={DEFAULT_CONFIG.sigmoid.mu}, σ={DEFAULT_CONFIG.sigmoid.sigma}).
                  </p>
                </div>

                {/* Additional Mechanics */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="font-medium mb-2">Additional Mechanics</p>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>Random noise (±5) adds unpredictability</li>
                    <li>Momentum bonus (+3) for {DEFAULT_CONFIG.momentum.streakThreshold}+ consecutive gains</li>
                    <li>Rubber-band (+2 to System) helps if score drops below {DEFAULT_CONFIG.rubberBand.threshold}</li>
                    <li>Unluck events ({DEFAULT_CONFIG.unluck.probability * 100}% chance) reduce positive gains by {DEFAULT_CONFIG.unluck.factorRange[0] * 100}-{DEFAULT_CONFIG.unluck.factorRange[1] * 100}%</li>
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
                    <span className="px-2 py-1 text-xs font-medium rounded border border-purple-600 bg-purple-700/30 text-purple-300">
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

                  {/* Weighted Contribution */}
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

                  {/* Unluck/Perfect Storm Indicators */}
                  {step.unluckApplied && (
                    <div className={`mt-2 p-2 rounded ${
                      step.perfectStorm ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200"
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
                            Gains reduced to {((step.luckFactor ?? 1) * 100).toFixed(0)}%
                          </span>
                        </div>
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
                  {(Object.keys(weights) as Array<keyof typeof weights>).reduce(
                    (sum, key) => sum + runState.meterState.hiddenState[key] * weights[key],
                    0
                  ).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-300">
                  Final Score (after sigmoid + effects):
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
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

