/**
 * Scaling Meter component
 * Displays the visible meter value, tier, and contextual insights
 */

"use client";

import { useEffect, useState } from "react";
import type { MeterState } from "@/types/game";
import { getTierConfig, getTierGradientClass } from "@/lib/tiers";
import { generateInsights } from "@/lib/insights";

interface ScalingMeterProps {
	meterState: MeterState;
	previousValue?: number;
	showInsights?: boolean;
	skipAnimations?: boolean;
}

export function ScalingMeter({
	meterState,
	previousValue,
	showInsights = true,
	skipAnimations = false,
}: ScalingMeterProps) {
	const [insights, setInsights] = useState<string[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);

	const tierConfig = getTierConfig(meterState.tier);
	const gradientClass = getTierGradientClass(meterState.tier);
	const displayValue = meterState.displayValue;

	// Calculate delta if previous value is provided
	const delta =
		previousValue !== undefined ? displayValue - previousValue : null;
	const deltaText = delta !== null ? (delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : null;

	// Generate insights when meter state changes
	useEffect(() => {
		if (showInsights) {
			const newInsights = generateInsights(meterState, insights);
			setInsights(newInsights);
		}
	}, [meterState.displayValue, meterState.tier, showInsights]);

	// Trigger animation when value changes
	useEffect(() => {
		if (!skipAnimations && previousValue !== undefined) {
			setIsAnimating(true);
			const timer = setTimeout(() => setIsAnimating(false), 500);
			return () => clearTimeout(timer);
		}
	}, [displayValue, previousValue, skipAnimations]);

	const transitionDuration = skipAnimations ? "0ms" : "500ms";

	return (
		<div className="px-6 py-4">
			{/* Header with tier badge and value */}
			<div className="flex items-center justify-between mb-3">
				{/* Tier Badge */}
				<div
					className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradientClass} text-white font-semibold shadow-md transition-all ${
						isAnimating && !skipAnimations ? "scale-105" : ""
					}`}
					style={{ transitionDuration }}
					aria-label={`Current tier: ${tierConfig.label}`}
				>
					<span className="text-2xl" role="img" aria-label={tierConfig.label}>
						{tierConfig.emoji}
					</span>
					<span className="text-lg">{tierConfig.label}</span>
				</div>

				{/* Meter Value and Delta */}
				<div className="flex items-baseline gap-2">
					<span className="text-4xl font-bold text-gray-800">
						{displayValue.toFixed(1)}%
					</span>
					{deltaText && (
						<span
							className={`text-xl font-semibold ${
								delta && delta > 0 ? "text-green-600" : "text-red-600"
							} transition-opacity ${
								isAnimating && !skipAnimations ? "opacity-100" : "opacity-70"
							}`}
							style={{ transitionDuration }}
							aria-label={`Change: ${deltaText}`}
						>
							{deltaText}
						</span>
					)}
				</div>
			</div>

			{/* Progress Bar */}
			<div
				className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner"
				role="progressbar"
				aria-valuenow={displayValue}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Scaling meter progress"
			>
				<div
					className={`h-full bg-gradient-to-r ${gradientClass} transition-all ease-out shadow-sm`}
					style={{
						width: `${displayValue}%`,
						transitionDuration,
					}}
				/>
			</div>

			{/* Insights */}
			{showInsights && insights.length > 0 && (
				<div className="mt-3 space-y-1">
					{insights.map((insight, index) => (
						<div
							key={`${insight}-${
								// biome-ignore lint/suspicious/noArrayIndexKey: Insights are dynamically generated and may not have stable keys
								index
							}`}
							className="text-sm text-gray-600 flex items-center gap-2"
						>
							<span>{insight}</span>
						</div>
					))}
				</div>
			)}

			{/* Tier Description (subtle) */}
			<div className="mt-2 text-xs text-gray-400 text-center">
				{tierConfig.description}
			</div>
		</div>
	);
}

