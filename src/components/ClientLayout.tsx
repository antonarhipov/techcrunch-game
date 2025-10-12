/**
 * Client Layout Wrapper
 * Wraps children with ErrorBoundary, ToastProvider, and GameProvider
 */

"use client";

import { GameProvider } from "@/contexts/GameContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ErrorBoundary } from "./ErrorBoundary";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<ErrorBoundary>
			<ToastProvider>
				<GameProvider>
					{children}
				</GameProvider>
			</ToastProvider>
		</ErrorBoundary>
	);
}

