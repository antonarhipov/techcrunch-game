/**
 * Insights generation for the scaling meter
 * Provides contextual feedback about dimension performance
 */

import type { Delta, MeterState } from "@/types/game";

/**
 * Dimension display names
 */
const DIMENSION_NAMES: Record<keyof Delta, string> = {
	R: "Revenue",
	U: "Users",
	S: "System",
	C: "Customers",
	I: "Investors",
};

/**
 * Insight messages for top-performing dimensions
 */
const TOP_MESSAGES: Record<keyof Delta, string[]> = {
	R: [
		"💰 Revenue momentum strong",
		"💰 Monetization working well",
		"💰 Cash flow looking healthy",
	],
	U: [
		"👥 User growth impressive",
		"👥 Activation strong",
		"👥 User acquisition on track",
	],
	S: [
		"⚙️ Infrastructure solid",
		"⚙️ Scaling smoothly",
		"⚙️ System performance good",
	],
	C: [
		"❤️ Customers love you",
		"❤️ Retention excellent",
		"❤️ Customer satisfaction high",
	],
	I: [
		"📊 Investors confident",
		"📊 Metrics visibility strong",
		"📊 Investor relations good",
	],
};

/**
 * Insight messages for bottleneck dimensions
 */
const BOTTLENECK_MESSAGES: Record<keyof Delta, string[]> = {
	R: [
		"⚠️ Revenue lagging",
		"⚠️ Need pricing strategy",
		"⚠️ Monetization needs work",
	],
	U: [
		"⚠️ Struggling to acquire users",
		"⚠️ Activation needs work",
		"⚠️ User growth stalling",
	],
	S: [
		"⚠️ Infrastructure bottleneck",
		"⚠️ Consider autoscaling",
		"⚠️ System strain showing",
	],
	C: [
		"⚠️ Churn risk increasing",
		"⚠️ Need better support",
		"⚠️ Customer satisfaction dropping",
	],
	I: [
		"⚠️ Story unclear to investors",
		"⚠️ Need better reporting",
		"⚠️ Metrics visibility poor",
	],
};

/**
 * Get the dimension with the highest value
 */
export function getTopDimension(state: Delta): keyof Delta {
	let topDim: keyof Delta = "R";
	let topValue = state.R;

	for (const dim of ["U", "S", "C", "I"] as const) {
		if (state[dim] > topValue) {
			topValue = state[dim];
			topDim = dim;
		}
	}

	return topDim;
}

/**
 * Get the dimension with the lowest value
 */
export function getBottleneckDimension(state: Delta): keyof Delta {
	let bottomDim: keyof Delta = "R";
	let bottomValue = state.R;

	for (const dim of ["U", "S", "C", "I"] as const) {
		if (state[dim] < bottomValue) {
			bottomValue = state[dim];
			bottomDim = dim;
		}
	}

	return bottomDim;
}

/**
 * Select a message from an array (uses simple rotation to avoid repetition)
 */
function selectMessage(messages: string[], index: number): string {
	return messages[index % messages.length] ?? messages[0] ?? "";
}

/**
 * Generate 1-2 contextual insights based on meter state
 * Returns insights about top performer and potential bottleneck
 */
export function generateInsights(
	meterState: MeterState,
	lastInsights?: string[],
): string[] {
	const insights: string[] = [];
	const { hiddenState } = meterState;

	// Get top and bottom dimensions
	const topDim = getTopDimension(hiddenState);
	const bottomDim = getBottleneckDimension(hiddenState);

	// Calculate message index based on display value (varies insights over time)
	const messageIndex = Math.floor(meterState.displayValue / 20);

	// Add top dimension insight
	const topMessages = TOP_MESSAGES[topDim];
	if (topMessages) {
		const topInsight = selectMessage(topMessages, messageIndex);
		insights.push(topInsight);
	}

	// Add bottleneck insight only if significantly different from top
	// and if the bottleneck is actually negative or significantly lower
	const topValue = hiddenState[topDim];
	const bottomValue = hiddenState[bottomDim];

	// Show bottleneck if it's at least 5 points lower than top, or if it's negative
	if (
		topDim !== bottomDim &&
		(bottomValue < 0 || topValue - bottomValue >= 5)
	) {
		const bottomMessages = BOTTLENECK_MESSAGES[bottomDim];
		if (bottomMessages) {
			const bottomInsight = selectMessage(bottomMessages, messageIndex);
			insights.push(bottomInsight);
		}
	}

	return insights;
}

/**
 * Get display name for a dimension
 */
export function getDimensionName(dimension: keyof Delta): string {
	return DIMENSION_NAMES[dimension] ?? dimension;
}

/**
 * Get insights for ending screen (more detailed)
 */
export function getEndingInsights(hiddenState: Delta): {
	topDrivers: string[];
	bottleneck: string;
} {
	// Get top 2 dimensions
	const dimensions = (Object.keys(hiddenState) as Array<keyof Delta>).sort(
		(a, b) => hiddenState[b] - hiddenState[a],
	);

	const topDrivers = dimensions.slice(0, 2).map((dim) => getDimensionName(dim));
	const bottleneck = getDimensionName(dimensions[dimensions.length - 1] ?? "S");

	return { topDrivers, bottleneck };
}

