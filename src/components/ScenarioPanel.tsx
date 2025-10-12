/**
 * Scenario Panel component
 * Displays the current step's scenario and choice options
 */

"use client";

import { useState } from "react";
import type { Step } from "@/types/game";

interface ScenarioPanelProps {
	step: Step;
	onChoiceSelect: (choice: "A" | "B") => void;
	disabled?: boolean;
}

export function ScenarioPanel({
	step,
	onChoiceSelect,
	disabled = false,
}: ScenarioPanelProps) {
	const [hoveredChoice, setHoveredChoice] = useState<"A" | "B" | null>(null);

	const handleChoiceClick = (choice: "A" | "B") => {
		if (!disabled) {
			onChoiceSelect(choice);
		}
	};

	const handleKeyDown = (
		event: React.KeyboardEvent,
		choice: "A" | "B",
	) => {
		if (!disabled && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			onChoiceSelect(choice);
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Step Header */}
			<div className="mb-6">
				<div className="flex items-baseline gap-2 mb-2">
					<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
						Step {step.id} of 5
					</span>
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{step.title}
				</h1>
				{step.subtitle && (
					<p className="text-lg text-gray-600">{step.subtitle}</p>
				)}
			</div>

			{/* Scenario */}
			<div className="mb-6">
				<p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
					{step.scenario}
				</p>
			</div>

			{/* Choices */}
			<div className="space-y-4 flex-1">
				{/* Option A */}
				<ChoiceCard
					label="A"
					choice={step.optionA}
					onClick={() => handleChoiceClick("A")}
					onKeyDown={(e) => handleKeyDown(e, "A")}
					disabled={disabled}
					isHovered={hoveredChoice === "A"}
					onHoverChange={(hovered) => setHoveredChoice(hovered ? "A" : null)}
				/>

				{/* Option B */}
				<ChoiceCard
					label="B"
					choice={step.optionB}
					onClick={() => handleChoiceClick("B")}
					onKeyDown={(e) => handleKeyDown(e, "B")}
					disabled={disabled}
					isHovered={hoveredChoice === "B"}
					onHoverChange={(hovered) => setHoveredChoice(hovered ? "B" : null)}
				/>
			</div>
		</div>
	);
}

interface ChoiceCardProps {
	label: string;
	choice: { label: string; body: string };
	onClick: () => void;
	onKeyDown: (event: React.KeyboardEvent) => void;
	disabled: boolean;
	isHovered: boolean;
	onHoverChange: (hovered: boolean) => void;
}

function ChoiceCard({
	label,
	choice,
	onClick,
	onKeyDown,
	disabled,
	isHovered,
	onHoverChange,
}: ChoiceCardProps) {
	return (
		<div
			role="button"
			tabIndex={disabled ? -1 : 0}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			className={`
				p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
				${
					disabled
						? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
						: isHovered
							? "border-blue-500 shadow-lg scale-[1.02] bg-blue-50"
							: "border-gray-300 shadow-md bg-white hover:border-blue-400"
				}
				focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
			`}
			aria-label={`Choose option ${label}: ${choice.label}`}
			aria-disabled={disabled}
		>
			<div className="flex items-start gap-3">
				{/* Label Badge */}
				<div
					className={`
						flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
						${disabled ? "bg-gray-400 text-gray-100" : "bg-blue-500 text-white"}
					`}
				>
					{label}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{choice.label}
					</h3>
					<p className="text-sm text-gray-700 leading-relaxed">
						{choice.body}
					</p>
				</div>
			</div>
		</div>
	);
}

