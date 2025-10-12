/**
 * Video Modal component
 * Displays video playback between choices
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface VideoModalProps {
	isOpen: boolean;
	videoSrc: string;
	onClose: () => void;
	onComplete: () => void;
}

export function VideoModal({
	isOpen,
	videoSrc,
	onClose,
	onComplete,
}: VideoModalProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [hasError, setHasError] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	// Handle video end
	const handleVideoEnd = () => {
		onComplete();
	};

	// Handle video error
	const handleVideoError = () => {
		console.error("Video failed to load:", videoSrc);
		setHasError(true);
	};

	// Handle escape key
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isOpen) return;

			if (event.key === "Escape") {
				onClose();
			} else if (event.key === " " || event.key === "Enter") {
				event.preventDefault();
				if (videoRef.current) {
					if (videoRef.current.paused) {
						videoRef.current.play();
						setIsPlaying(true);
					} else {
						videoRef.current.pause();
						setIsPlaying(false);
					}
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Auto-play when opened
	useEffect(() => {
		if (isOpen && videoRef.current && !hasError) {
			videoRef.current.play().catch((error) => {
				console.warn("Auto-play failed:", error);
				// Auto-play might be blocked, but user can still click play
			});
			setIsPlaying(true);
		}
	}, [isOpen, hasError]);

	// Reset error state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setHasError(false);
			setIsPlaying(false);
		}
	}, [isOpen]);

	// Trap focus within modal
	useEffect(() => {
		if (isOpen) {
			const focusableElements = document.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			const handleTabKey = (event: KeyboardEvent) => {
				if (event.key !== "Tab") return;

				if (event.shiftKey) {
					if (document.activeElement === firstElement) {
						event.preventDefault();
						lastElement?.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						event.preventDefault();
						firstElement?.focus();
					}
				}
			};

			document.addEventListener("keydown", handleTabKey);
			return () => document.removeEventListener("keydown", handleTabKey);
		}
	}, [isOpen]);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
			role="dialog"
			aria-modal="true"
			aria-label="Video player"
		>
			{/* Modal Content */}
			<div className="relative max-w-4xl w-full bg-black rounded-lg shadow-2xl overflow-hidden">
				{/* Close/Skip Button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
					aria-label="Skip video"
				>
					Skip →
				</button>

				{/* Video Player or Error */}
				{hasError ? (
					<div className="flex flex-col items-center justify-center p-12 text-white">
						<div className="text-6xl mb-4">⚠️</div>
						<h3 className="text-2xl font-bold mb-2">Video Unavailable</h3>
						<p className="text-gray-400 mb-6">
							The video could not be loaded. You can continue without it.
						</p>
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
						>
							Continue
						</button>
					</div>
				) : (
					<div className="relative">
						{/* biome-ignore lint/a11y/useMediaCaption: Video is decorative and optional */}
						<video
							ref={videoRef}
							src={videoSrc}
							controls
							onEnded={handleVideoEnd}
							onError={handleVideoError}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
							className="w-full h-auto max-h-[80vh] rounded-lg"
						/>

						{/* Play/Pause indicator (optional) */}
						{!isPlaying && !hasError && (
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<div className="bg-black bg-opacity-50 rounded-full p-6">
									<svg
										className="w-16 h-16 text-white"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
									</svg>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Keyboard hints */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
				<span className="bg-gray-900 px-3 py-1 rounded">ESC</span> to skip •{" "}
				<span className="bg-gray-900 px-3 py-1 rounded">SPACE</span> to
				play/pause
			</div>
		</div>
	);
}

