/**
 * Main game layout component with three-panel design
 * - Left panel: Scenario and choices
 * - Right panel: Junie Console
 * - Bottom: Scaling Meter
 */

import type { ReactNode } from "react";

interface GameLayoutProps {
	scenarioPanel: ReactNode;
	consolePanel: ReactNode;
	meterPanel: ReactNode;
}

export function GameLayout({
	scenarioPanel,
	consolePanel,
	meterPanel,
}: GameLayoutProps) {
	return (
		<div className="h-screen overflow-hidden flex flex-col bg-gray-50">
			{/* Main content area with scenario and console */}
			<div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
				{/* Scenario Panel - Left side on desktop, top on mobile */}
				<div className="lg:col-span-2 overflow-auto bg-white rounded-lg shadow-md border border-gray-200 p-6">
					{scenarioPanel}
				</div>

				{/* Console Panel - Right side on desktop, bottom on mobile */}
				<div className="lg:col-span-3 overflow-auto bg-gray-900 rounded-lg shadow-md border border-gray-700">
					{consolePanel}
				</div>
			</div>

			{/* Meter Panel - Always at bottom */}
			<div className="shrink-0 bg-white border-t border-gray-200 shadow-lg">
				{meterPanel}
			</div>
		</div>
	);
}

