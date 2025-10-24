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
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				{/* Title Section */}
				<div className="text-center mb-12">
					<h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
						Choose Your Own
						<br />
						<span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
							Startup Adventure
						</span>
					</h1>
					<p className="text-xl text-gray-300 mb-2">
						Build an AI Cofounder SaaS
					</p>
					<p className="text-base text-gray-400 max-w-lg mx-auto">
						Make critical decisions as you grow your startup. Every choice
						impacts your Revenue, Users, System, Customers, and Investors. Can
						you reach unicorn status?
					</p>
				</div>

				{/* Main Card */}
				<div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
					{/* Buttons */}
					<div className="space-y-4 mb-6">
						<button
							type="button"
							onClick={handleNewRun}
							className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
										? "bg-gray-700 text-white hover:bg-gray-600 hover:shadow-xl transform hover:scale-[1.02]"
										: "bg-gray-900 text-gray-600 cursor-not-allowed"
								}
							`}
						>
							{hasSavedRun ? "▶️ Resume Game" : "No Saved Game"}
						</button>
					</div>
				</div>

				{/* Game Info */}
				<div className="text-center space-y-2 text-sm text-gray-400">
					<p>⏱️ Playtime: ~5-7 minutes</p>
					<p>🎯 5 key decisions · 32 possible paths · 6 endings</p>
				</div>
			</div>
		</div>
	);
}

