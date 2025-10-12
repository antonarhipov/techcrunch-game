/**
 * Error Boundary component
 * Catches and handles React component errors gracefully
 */

"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console
		console.error("Error caught by boundary:", error, errorInfo);
		
		// Store error info in state
		this.setState({
			error,
			errorInfo,
		});

		// TODO: Send error to error tracking service (Sentry, LogRocket, etc.)
		// if (window.SENTRY_DSN) {
		//   Sentry.captureException(error, { extra: errorInfo });
		// }
	}

	handleRestart = () => {
		// Clear localStorage and reload
		try {
			localStorage.clear();
		} catch (e) {
			console.warn("Could not clear localStorage:", e);
		}
		window.location.href = "/";
	};

	handleReportIssue = () => {
		const issueBody = `
## Error Report

**Error:** ${this.state.error?.message}

**Stack Trace:**
\`\`\`
${this.state.error?.stack}
\`\`\`

**Component Stack:**
\`\`\`
${this.state.errorInfo?.componentStack}
\`\`\`

**User Agent:** ${navigator.userAgent}
**URL:** ${window.location.href}
		`.trim();

		const issueUrl = `https://github.com/yourusername/startup-game/issues/new?body=${encodeURIComponent(issueBody)}`;
		window.open(issueUrl, "_blank");
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
					<div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
						{/* Icon */}
						<div className="text-center mb-6">
							<div className="text-6xl mb-4">⚠️</div>
							<h1 className="text-3xl font-bold text-white mb-2">
								Something went wrong
							</h1>
							<p className="text-lg text-gray-300">
								We encountered an unexpected error. Don't worry, your progress might be saved.
							</p>
						</div>

						{/* Error Details (collapsed by default) */}
						<details className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
							<summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
								Technical Details
							</summary>
							<div className="mt-4 space-y-2">
								<div>
									<p className="text-sm font-mono text-red-400 break-all">
										{this.state.error?.message}
									</p>
								</div>
								{this.state.error?.stack && (
									<div>
										<p className="text-xs text-gray-400 mb-1">Stack Trace:</p>
										<pre className="text-xs bg-gray-950 text-gray-300 p-2 rounded overflow-auto max-h-40">
											{this.state.error.stack}
										</pre>
									</div>
								)}
							</div>
						</details>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								type="button"
								onClick={this.handleRestart}
								className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
							>
								🔄 Restart Game
							</button>
							<button
								type="button"
								onClick={this.handleReportIssue}
								className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:bg-gray-600 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								🐛 Report Issue
							</button>
						</div>

						{/* Helpful Tips */}
						<div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
							<p className="text-sm text-purple-900">
								<strong>Tip:</strong> Try refreshing the page first. If the problem persists, click "Restart Game" to clear your session and start fresh.
							</p>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

