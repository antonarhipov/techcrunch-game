/**
 * Start Screen component
 * Entry point for the game with New Run and Resume options
 */

"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

export function StartScreen() {
	const { startNewRun, loadSavedRun } = useGame();
	const [hasSavedRun, setHasSavedRun] = useState(false);
	const [analyticsConsent, setAnalyticsConsent] = useState(false);

	// Check for saved run on mount
	useEffect(() => {
		const savedState = localStorage.getItem("startup-game-run-state");
		setHasSavedRun(!!savedState);

		// Load analytics consent preference
		const consent = localStorage.getItem("startup-game-analytics-consent");
		setAnalyticsConsent(consent === "true");
	}, []);

	const handleNewRun = () => {
		// Save analytics consent
		localStorage.setItem(
			"startup-game-analytics-consent",
			analyticsConsent.toString(),
		);
		startNewRun();
	};

	const handleResume = () => {
		try {
			loadSavedRun();
		} catch (error) {
			console.error("Failed to resume game:", error);
			alert("Failed to load saved game. Starting a new run instead.");
			startNewRun();
		}
	};

	const handleConsentChange = (checked: boolean) => {
		setAnalyticsConsent(checked);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				{/* Title Section */}
				<div className="text-center mb-12">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
						Choose Your Own
						<br />
						<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Startup Adventure
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-2">
						Build an AI Cofounder SaaS
					</p>
					<p className="text-base text-gray-500 max-w-lg mx-auto">
						Make critical decisions as you grow your startup. Every choice
						impacts your Revenue, Users, System, Customers, and Investors. Can
						you reach unicorn status?
					</p>
				</div>

				{/* Main Card */}
				<div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
					{/* Buttons */}
					<div className="space-y-4 mb-6">
						<button
							type="button"
							onClick={handleNewRun}
							className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							🚀 Start New Run
						</button>

						<button
							type="button"
							onClick={handleResume}
							disabled={!hasSavedRun}
							className={`
								w-full py-4 px-6 text-lg font-semibold rounded-lg shadow-md transition-all duration-200
								focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
								${
									hasSavedRun
										? "bg-gray-200 text-gray-900 hover:bg-gray-300 hover:shadow-xl transform hover:scale-[1.02]"
										: "bg-gray-100 text-gray-400 cursor-not-allowed"
								}
							`}
						>
							{hasSavedRun ? "▶️ Resume Game" : "No Saved Game"}
						</button>
					</div>

					{/* Analytics Consent */}
					<div className="pt-6 border-t border-gray-200">
						<label className="flex items-start gap-3 cursor-pointer group">
							<input
								type="checkbox"
								checked={analyticsConsent}
								onChange={(e) => handleConsentChange(e.target.checked)}
								className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<span className="text-sm text-gray-600 group-hover:text-gray-800">
								Allow anonymous analytics to help improve the game (no personal
								information collected)
							</span>
						</label>
					</div>
				</div>

				{/* Game Info */}
				<div className="text-center space-y-2 text-sm text-gray-500">
					<p>⏱️ Playtime: ~10-15 minutes</p>
					<p>🎯 5 key decisions · 32 possible paths · 6 endings</p>
				</div>
			</div>
		</div>
	);
}

