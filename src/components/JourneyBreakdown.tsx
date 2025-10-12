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

const DIMENSION_COLORS = {
  R: "text-green-600 bg-green-50",
  U: "text-blue-600 bg-blue-50",
  S: "text-purple-600 bg-purple-50",
  C: "text-orange-600 bg-orange-50",
  I: "text-pink-600 bg-pink-50",
};

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header - Clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isOpen ? "📊" : "📈"}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Journey Breakdown
            </h3>
            <p className="text-sm text-gray-600">
              See how each choice impacted your score
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {isOpen ? "Hide details" : "Show details"}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="px-6 pb-6 border-t border-gray-200">
          {/* Formula Explanation Toggle */}
          <div className="mt-4 mb-6">
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showFormula ? "Hide" : "Show"} calculation formula
            </button>
          </div>

          {/* Formula Details */}
          {showFormula && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">
                How the Score is Calculated
              </h4>
              
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Your final score is calculated using a weighted sum of five dimensions,
                  then normalized through a sigmoid function:
                </p>
                
                {/* Step 1: Weighted Sum */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium mb-2">Step 1: Weighted Sum</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    Raw Score = (R × {weights.R}) + (U × {weights.U}) + (S × {weights.S}) + (C × {weights.C}) + (I × {weights.I})
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Each dimension has a different weight reflecting its importance to startup success.
                  </p>
                </div>

                {/* Step 2: Diminishing Returns */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium mb-2">Step 2: Diminishing Returns</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    Each dimension<sup>0.9</sup> (prevents over-optimization of single dimension)
                  </div>
                </div>

                {/* Step 3: Sigmoid Normalization */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium mb-2">Step 3: Sigmoid Normalization</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    Score = 100 / (1 + e<sup>-(Raw - μ) / σ</sup>)
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Maps the raw score to 0-100 range with smooth transitions (μ={DEFAULT_CONFIG.sigmoid.mu}, σ={DEFAULT_CONFIG.sigmoid.sigma}).
                  </p>
                </div>

                {/* Additional Mechanics */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium mb-2">Additional Mechanics</p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
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
            <h4 className="font-semibold text-gray-900 mb-3">
              Step-by-Step Impact
            </h4>

            {runState.stepHistory.map((step, index) => (
              <div
                key={step.stepId}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Step Header */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-700">
                      Step {step.stepId}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Choice {step.choice}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {step.meterBefore.toFixed(1)}%
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className={`text-sm font-semibold ${
                      step.meterAfter > step.meterBefore ? "text-green-600" : "text-red-600"
                    }`}>
                      {step.meterAfter.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Delta Details */}
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {(Object.keys(DIMENSION_NAMES) as Array<keyof typeof DIMENSION_NAMES>).map((key) => {
                      const value = step.appliedDelta[key];
                      const isPositive = value > 0;
                      const isNegative = value < 0;
                      
                      return (
                        <div
                          key={key}
                          className={`text-center p-2 rounded ${DIMENSION_COLORS[key]}`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {DIMENSION_NAMES[key]}
                          </div>
                          <div className={`text-lg font-bold ${
                            isPositive ? "text-green-700" : isNegative ? "text-red-700" : "text-gray-600"
                          }`}>
                            {isPositive ? "+" : ""}{value}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weighted Contribution */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Weighted impact:</span>{" "}
                    {(Object.keys(weights) as Array<keyof typeof weights>).map((key, idx) => {
                      const value = step.appliedDelta[key];
                      const weighted = value * weights[key];
                      return (
                        <span key={key}>
                          {idx > 0 && " + "}
                          {DIMENSION_NAMES[key]}×{weights[key]} = {weighted.toFixed(1)}
                        </span>
                      );
                    })}
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
                            step.perfectStorm ? "text-red-700" : "text-orange-700"
                          }`}>
                            {step.perfectStorm ? "Perfect Storm!" : "Unluck Event"}
                          </span>
                          <span className="text-gray-600 ml-2">
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
                        <div key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500">•</span>
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
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Final State</h4>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(DIMENSION_NAMES) as Array<keyof typeof DIMENSION_NAMES>).map((key) => {
                const value = runState.meterState.hiddenState[key];
                
                return (
                  <div key={key} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {DIMENSION_NAMES[key]}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ×{weights[key]} = {(value * weights[key]).toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Weighted Sum (before normalization):
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {(Object.keys(weights) as Array<keyof typeof weights>).reduce(
                    (sum, key) => sum + runState.meterState.hiddenState[key] * weights[key],
                    0
                  ).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">
                  Final Score (after sigmoid + effects):
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

