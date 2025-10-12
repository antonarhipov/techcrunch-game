/**
 * Unluck Popup component
 * Displays modal when unluck or Perfect Storm occurs
 */

"use client";

import { useEffect, useState } from "react";
import type { UnluckResult } from "@/types/game";

interface UnluckPopupProps {
	unluckResult: UnluckResult | null;
	onClose: () => void;
	skipAnimations?: boolean;
}

export function UnluckPopup({
	unluckResult,
	onClose,
	skipAnimations = false,
}: UnluckPopupProps) {
	const [isVisible, setIsVisible] = useState(false);

	// Auto-dismiss after 5 seconds
	useEffect(() => {
		if (unluckResult?.unluckApplied) {
			setIsVisible(true);
			const timer = setTimeout(() => {
				handleClose();
			}, 5000);
			return () => clearTimeout(timer);
		}
		setIsVisible(false);
	}, [unluckResult]);

	const handleClose = () => {
		setIsVisible(false);
		// Wait for exit animation before calling onClose
		const delay = skipAnimations ? 0 : 300;
		setTimeout(onClose, delay);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			handleClose();
		}
	};

	if (!unluckResult?.unluckApplied) {
		return null;
	}

	const isPerfectStorm = unluckResult.perfectStorm;
	const luckFactorPercent = Math.round(unluckResult.luckFactor * 100);

	return (
		<div
			className={`
				fixed inset-0 z-50 flex items-center justify-center p-4
				transition-opacity duration-300
				${isVisible ? "opacity-100" : "opacity-0"}
			`}
			role="dialog"
			aria-modal="true"
			aria-labelledby="unluck-title"
			onKeyDown={handleKeyDown}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black bg-opacity-50"
				onClick={handleClose}
			/>

			{/* Popup Card */}
			<div
				className={`
					relative max-w-md w-full rounded-2xl shadow-2xl p-6 transform transition-all duration-300
					${
						isVisible && !skipAnimations
							? "scale-100 translate-y-0"
							: "scale-90 -translate-y-4"
					}
					${
						isPerfectStorm
							? "bg-gradient-to-br from-red-500 to-red-700 text-white"
							: "bg-gradient-to-br from-pink-400 to-pink-600 text-white"
					}
				`}
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={handleClose}
					className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
					aria-label="Close"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Icon and Title */}
				<div className="text-center mb-4">
					<div className="text-6xl mb-2">
						{isPerfectStorm ? "💥" : "⚠️"}
					</div>
					<h2
						id="unluck-title"
						className="text-2xl font-bold uppercase tracking-wide"
					>
						{isPerfectStorm ? "PERFECT STORM!" : "Unluck!"}
					</h2>
				</div>

				{/* Message */}
				<div className="mb-4">
					<p className="text-center text-lg leading-relaxed">
						{unluckResult.message}
					</p>
				</div>

				{/* Luck Factor */}
				<div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
					<p className="text-sm font-semibold">
						{isPerfectStorm
							? "Multiple systems impacted!"
							: `Gains reduced to ${luckFactorPercent}%`}
					</p>
				</div>

				{/* Dismiss hint */}
				<div className="mt-4 text-center text-xs opacity-75">
					Click anywhere or press ESC to continue
				</div>
			</div>
		</div>
	);
}

