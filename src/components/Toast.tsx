/**
 * Toast Notification Component
 * Displays temporary notification messages
 */

"use client";

import { useEffect, useState } from "react";

export type ToastType = "info" | "warning" | "error" | "success";

export interface ToastMessage {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

interface ToastProps {
	message: ToastMessage | null;
	onClose: (id: string) => void;
}

export function Toast({ message, onClose }: ToastProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (message) {
			setIsVisible(true);
			const duration = message.duration || 5000;

			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(() => onClose(message.id), 300); // Wait for exit animation
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [message, onClose]);

	if (!message) return null;

	const typeStyles = {
		info: "bg-blue-500 border-blue-600",
		warning: "bg-yellow-500 border-yellow-600",
		error: "bg-red-500 border-red-600",
		success: "bg-green-500 border-green-600",
	};

	const typeIcons = {
		info: "ℹ️",
		warning: "⚠️",
		error: "❌",
		success: "✅",
	};

	return (
		<div
			className={`
				fixed bottom-4 right-4 z-50 max-w-md
				transition-all duration-300 transform
				${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
			`}
			role="alert"
			aria-live="polite"
		>
			<div
				className={`
					${typeStyles[message.type]}
					text-white px-4 py-3 rounded-lg shadow-xl border-2
					flex items-start gap-3
				`}
			>
				{/* Icon */}
				<span className="text-xl flex-shrink-0" role="img" aria-label={message.type}>
					{typeIcons[message.type]}
				</span>

				{/* Message */}
				<p className="flex-1 text-sm leading-relaxed">{message.message}</p>

				{/* Close Button */}
				<button
					type="button"
					onClick={() => {
						setIsVisible(false);
						setTimeout(() => onClose(message.id), 300);
					}}
					className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
					aria-label="Close notification"
				>
					<svg
						className="w-5 h-5"
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
			</div>
		</div>
	);
}

/**
 * Toast Container Component
 * Manages multiple toast messages
 */
interface ToastContainerProps {
	messages: ToastMessage[];
	onRemove: (id: string) => void;
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2">
			{messages.map((message) => (
				<Toast key={message.id} message={message} onClose={onRemove} />
			))}
		</div>
	);
}

