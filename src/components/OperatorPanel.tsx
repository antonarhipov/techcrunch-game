/**
 * Operator Panel component
 * Debug panel for developers and operators (activated via ?operator=true)
 */

"use client";

import { useState, useEffect } from "react";
import type { MeterState } from "@/types/game";
import type { FeatureFlags } from "@/types/game";

interface OperatorPanelProps {
	currentMeterState?: MeterState;
	featureFlags: FeatureFlags;
	onFlagsChange: (flags: FeatureFlags) => void;
}

export function OperatorPanel({
	currentMeterState,
	featureFlags,
	onFlagsChange,
}: OperatorPanelProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isEnabled, setIsEnabled] = useState(false);

	// Check if operator mode is enabled via URL parameter
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setIsEnabled(params.get("operator") === "true");
	}, []);

	if (!isEnabled) {
		return null;
	}

	const handleToggle = (
		key: keyof FeatureFlags,
		value: boolean | number | undefined,
	) => {
		onFlagsChange({ ...featureFlags, [key]: value });
	};

	const copyCurrentState = () => {
		if (currentMeterState) {
			const stateJson = JSON.stringify(currentMeterState, null, 2);
			navigator.clipboard.writeText(stateJson);
			alert("Current state copied to clipboard!");
		}
	};

	return (
		<>
			{/* Toggle Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
				aria-label="Toggle operator panel"
			>
				{isOpen ? "✕" : "🛠️"} Operator
			</button>

			{/* Panel */}
			{isOpen && (
				<div className="fixed right-0 top-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-40 overflow-y-auto">
					<div className="p-6 pt-20">
						<h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
							🛠️ Operator Panel
						</h2>

						{/* Feature Toggles */}
						<div className="space-y-4 mb-6">
							<h3 className="font-semibold text-sm uppercase text-gray-400">
								Feature Flags
							</h3>

							<Toggle
								label="Force Unluck"
								checked={featureFlags.forceUnluck}
								onChange={(checked) => handleToggle("forceUnluck", checked)}
								description="Trigger unluck on every step"
							/>

							<Toggle
								label="Force Perfect Storm"
								checked={featureFlags.forcePerfectStorm}
								onChange={(checked) =>
									handleToggle("forcePerfectStorm", checked)
								}
								description="Trigger Perfect Storm (Step 4B only)"
							/>

							<Toggle
								label="Show Hidden State"
								checked={featureFlags.showHiddenState}
								onChange={(checked) => handleToggle("showHiddenState", checked)}
								description="Display R, U, S, C, I values"
							/>

							<Toggle
								label="Enable Debug Console"
								checked={featureFlags.enableDebugConsole}
								onChange={(checked) =>
									handleToggle("enableDebugConsole", checked)
								}
								description="Show debug logs in console"
							/>

							<Toggle
								label="Skip Animations"
								checked={featureFlags.skipAnimations}
								onChange={(checked) => handleToggle("skipAnimations", checked)}
								description="Disable all animations"
							/>
						</div>

						{/* Numeric Inputs */}
						<div className="space-y-4 mb-6">
							<h3 className="font-semibold text-sm uppercase text-gray-400">
								Overrides
							</h3>

							<NumberInput
								label="Fixed Seed"
								value={featureFlags.fixedSeed}
								onChange={(value) => handleToggle("fixedSeed", value)}
								placeholder="Leave empty for random"
								min={0}
							/>

							<NumberInput
								label="Bad Luck Factor Override"
								value={featureFlags.unluckFactorOverride}
								onChange={(value) => handleToggle("unluckFactorOverride", value)}
								placeholder="0.4-0.7"
								min={0.4}
								max={0.7}
								step={0.1}
							/>
						</div>

						{/* Current State Display */}
						{featureFlags.showHiddenState && currentMeterState && (
							<div className="bg-gray-800 rounded-lg p-4 mb-6">
								<h3 className="font-semibold text-sm uppercase text-gray-400 mb-3">
									Hidden State
								</h3>
								<div className="space-y-2 font-mono text-sm">
									<StateValue
										label="Revenue (R)"
										value={currentMeterState.hiddenState.R}
									/>
									<StateValue
										label="Users (U)"
										value={currentMeterState.hiddenState.U}
									/>
									<StateValue
										label="System (S)"
										value={currentMeterState.hiddenState.S}
									/>
									<StateValue
										label="Customers (C)"
										value={currentMeterState.hiddenState.C}
									/>
									<StateValue
										label="Investors (I)"
										value={currentMeterState.hiddenState.I}
									/>
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="space-y-3">
							<button
								type="button"
								onClick={copyCurrentState}
								className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold"
								disabled={!currentMeterState}
							>
								📋 Copy Current State
							</button>
						</div>

						{/* Info */}
						<div className="mt-8 text-xs text-gray-500 border-t border-gray-700 pt-4">
							<p>
								Operator mode is for development and debugging. Changes may
								affect game determinism.
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

interface ToggleProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	description?: string;
}

function Toggle({ label, checked, onChange, description }: ToggleProps) {
	return (
		<label className="flex items-start gap-3 cursor-pointer group">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="mt-1 w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 bg-gray-800"
			/>
			<div className="flex-1">
				<div className="text-sm font-medium group-hover:text-purple-400 transition-colors">
					{label}
				</div>
				{description && (
					<div className="text-xs text-gray-500">{description}</div>
				)}
			</div>
		</label>
	);
}

interface NumberInputProps {
	label: string;
	value?: number;
	onChange: (value: number | undefined) => void;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number;
}

function NumberInput({
	label,
	value,
	onChange,
	placeholder,
	min,
	max,
	step = 1,
}: NumberInputProps) {
	return (
		<div>
			<label className="block text-sm font-medium mb-2">{label}</label>
			<input
				type="number"
				value={value ?? ""}
				onChange={(e) =>
					onChange(e.target.value ? Number(e.target.value) : undefined)
				}
				placeholder={placeholder}
				min={min}
				max={max}
				step={step}
				className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
			/>
		</div>
	);
}

interface StateValueProps {
	label: string;
	value: number;
}

function StateValue({ label, value }: StateValueProps) {
	return (
		<div className="flex justify-between">
			<span className="text-gray-400">{label}:</span>
			<span
				className={value >= 0 ? "text-green-400" : "text-red-400"}
			>
				{value.toFixed(2)}
			</span>
		</div>
	);
}

