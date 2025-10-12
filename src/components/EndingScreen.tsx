/**
 * Ending Screen component
 * Displays final results, insights, and sharing options
 */

"use client";

import { useEffect, useState } from "react";
import type { RunState } from "@/types/game";
import { getTierConfig } from "@/lib/tiers";
import { useGame } from "@/contexts/GameContext";

export interface EndingData {
	tier: string;
	emoji: string;
	title: string;
	description: string;
	topDrivers: string[];
	bottleneck: string;
	nextStepSuggestion: string;
}

interface EndingScreenProps {
	runState: RunState;
	ending: EndingData;
	hints: string[];
}

export function EndingScreen({ runState, ending, hints }: EndingScreenProps) {
	const { resetRun } = useGame();
	const [showConfetti, setShowConfetti] = useState(false);

	const finalMeter = runState.meterState.displayValue;
	const tierConfig = getTierConfig(runState.meterState.tier);

	// Get path taken
	const pathTaken = runState.stepHistory
		.map((result) => result.choice)
		.join(" → ");

	// Show confetti for high scores
	useEffect(() => {
		if (finalMeter >= 70) {
			setShowConfetti(true);
		}
	}, [finalMeter]);


	const handleShare = (platform: "twitter" | "linkedin") => {
		const text = `I just built an AI startup and reached ${tierConfig.label} (${finalMeter.toFixed(1)}%)! 🚀\n\nPath: ${pathTaken}\n\nPlay Choose Your Own Startup Adventure:`;
		const url = window.location.origin;

		if (platform === "twitter") {
			window.open(
				`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
				"_blank",
			);
		} else {
			window.open(
				`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
				"_blank",
			);
		}
	};

	const handleCopyLink = () => {
		const url = `${window.location.origin}?seed=${runState.seed}`;
		navigator.clipboard.writeText(url);
		alert("Link copied! Share it with friends to compare runs.");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-auto">
			{showConfetti && <ConfettiEffect />}

			<div className="max-w-4xl w-full py-8">
				{/* Main Results Card */}
				<div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
					{/* Tier Badge */}
					<div className="text-center mb-6">
						<div className="text-8xl mb-4">{tierConfig.emoji}</div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							{tierConfig.label}
						</h1>
						<div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
							{finalMeter.toFixed(1)}%
						</div>
					</div>

					{/* Description */}
					<div className="mb-8">
						<p className="text-lg text-gray-700 leading-relaxed text-center max-w-2xl mx-auto">
							{ending.description}
						</p>
					</div>

					{/* Insights Grid */}
					<div className="grid md:grid-cols-2 gap-6 mb-8">
						{/* Strengths */}
						<div className="bg-green-50 rounded-lg p-4 border border-green-200">
							<h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
								<span>✓</span>
								<span>Your Strengths</span>
							</h3>
							<ul className="space-y-1 text-green-800">
								{ending.topDrivers.map((driver) => (
									<li key={driver}>• {driver}</li>
								))}
							</ul>
						</div>

						{/* Challenge */}
						<div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
							<h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
								<span>⚠</span>
								<span>Your Challenge</span>
							</h3>
							<p className="text-orange-800">• {ending.bottleneck}</p>
						</div>
					</div>

					{/* Next Steps */}
					<div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-8">
						<h3 className="font-semibold text-blue-900 mb-2">
							💡 Next Steps
						</h3>
						<p className="text-blue-800">{ending.nextStepSuggestion}</p>
					</div>

					{/* Path Taken */}
					<div className="text-center mb-8">
						<h3 className="font-semibold text-gray-700 mb-2">Your Journey</h3>
						<div className="text-2xl text-gray-600 font-mono">{pathTaken}</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							type="button"
							onClick={resetRun}
							className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							🔄 Play Again
						</button>
						<button
							type="button"
							onClick={() => handleShare("twitter")}
							className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
						>
							🐦 Share on Twitter
						</button>
						<button
							type="button"
							onClick={() => handleShare("linkedin")}
							className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
						>
							💼 Share on LinkedIn
						</button>
						<button
							type="button"
							onClick={handleCopyLink}
							className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-xl hover:bg-gray-300 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						>
							🔗 Copy Link
						</button>
					</div>
				</div>

				{/* Alternate Path Hints */}
				<div className="bg-white rounded-xl shadow-lg p-6 text-center">
					<p className="text-lg font-semibold text-gray-800 mb-4">
						🤔 Curious about other paths?
					</p>
					<div className="space-y-2 mb-4">
						{hints.map((hint, index) => (
							<p key={index} className="text-sm text-gray-600 italic">
								{hint}
							</p>
						))}
					</div>
					<p className="text-sm text-gray-500">
						Try different choices to discover all 6 possible endings!
					</p>
				</div>
			</div>
		</div>
	);
}

function ConfettiEffect() {
	return (
		<div className="fixed inset-0 pointer-events-none z-50">
			<div className="absolute top-0 left-0 w-full h-full animate-confetti">
				{/* Simple confetti effect with CSS */}
				<style jsx>{`
					@keyframes confetti {
						0% {
							transform: translateY(-100vh) rotate(0deg);
						}
						100% {
							transform: translateY(100vh) rotate(360deg);
						}
					}
					.animate-confetti {
						animation: confetti 3s ease-out;
					}
				`}</style>
			</div>
		</div>
	);
}

