/**
 * Higher Order Component for adding Error Boundary to specific components
 * Provides component-specific error fallbacks
 */

"use client";

import React, { Component, type ComponentType, type ReactNode } from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorFallbackProps {
	error: Error | null;
	componentName: string;
	onRetry?: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	componentName,
	onRetry,
}) => (
	<div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
		<div className="text-4xl mb-3">⚠️</div>
		<h3 className="text-lg font-semibold text-red-900 mb-2">
			{componentName} Error
		</h3>
		<p className="text-sm text-red-700 mb-4 text-center max-w-md">
			{error?.message || "An unexpected error occurred"}
		</p>
		{onRetry && (
			<button
				type="button"
				onClick={onRetry}
				className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
			>
				Retry
			</button>
		)}
	</div>
);

/**
 * Creates an Error Boundary wrapper for a component
 * @param WrappedComponent - Component to wrap
 * @param componentName - Display name for error messages
 * @param FallbackComponent - Custom fallback component (optional)
 */
export function withErrorBoundary<P extends object>(
	WrappedComponent: ComponentType<P>,
	componentName: string,
	FallbackComponent: ComponentType<ErrorFallbackProps> = DefaultErrorFallback,
) {
	return class WithErrorBoundary extends Component<P, ErrorBoundaryState> {
		constructor(props: P) {
			super(props);
			this.state = {
				hasError: false,
				error: null,
			};
		}

		static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
			return {
				hasError: true,
				error,
			};
		}

		componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
			console.error(`Error in ${componentName}:`, error, errorInfo);
		}

		handleRetry = () => {
			this.setState({
				hasError: false,
				error: null,
			});
		};

		render() {
			if (this.state.hasError) {
				return (
					<FallbackComponent
						error={this.state.error}
						componentName={componentName}
						onRetry={this.handleRetry}
					/>
				);
			}

			return <WrappedComponent {...this.props} />;
		}
	};
}

/**
 * Custom error fallback for AssetPreview component
 */
export const AssetPreviewErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	onRetry,
}) => (
	<div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg border border-gray-700">
		<div className="text-6xl mb-3">📦</div>
		<p className="text-sm text-gray-300 mb-2">Failed to load asset</p>
		<p className="text-xs text-gray-400 mb-4">{error?.message}</p>
		{onRetry && (
			<button
				type="button"
				onClick={onRetry}
				className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
			>
				Retry
			</button>
		)}
	</div>
);

/**
 * Custom error fallback for JunieConsole component
 */
export const JunieConsoleErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	onRetry,
}) => (
	<div className="flex flex-col items-center justify-center p-6 bg-gray-900 text-white rounded-lg h-full">
		<div className="text-4xl mb-3">⚠️</div>
		<p className="text-sm text-gray-300 mb-2 font-mono">Console Error</p>
		<p className="text-xs text-gray-400 mb-4 font-mono">{error?.message}</p>
		{onRetry && (
			<button
				type="button"
				onClick={onRetry}
				className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-mono"
			>
				Restart Console
			</button>
		)}
	</div>
);

