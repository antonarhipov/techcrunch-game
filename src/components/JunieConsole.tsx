/**
 * Junie Console component
 * Simulates an AI coding assistant console with streaming logs
 */

"use client";

import { useEffect, useRef, memo } from "react";
import Image from "next/image";

export type LogType = "info" | "success" | "warning" | "error";

export interface LogEntry {
	type: LogType;
	text: string;
	timestamp?: string;
	codeDiff?: string;
}

interface JunieConsoleProps {
	logs: LogEntry[];
	isStreaming?: boolean;
	onClear?: () => void;
}

export const JunieConsole = memo(function JunieConsole({
	logs,
	isStreaming = false,
	onClear,
}: JunieConsoleProps) {
	const consoleEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new logs appear
	useEffect(() => {
		if (consoleEndRef.current) {
			consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [logs]);

	return (
		<div className="h-full flex flex-col">
			{/* Console Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
				<div className="flex items-center gap-3">
					{/* Junie Logo */}
					<div className={isStreaming ? "animate-rotate-slow" : ""}>
						<Image
							src="/junie.svg"
							alt="Junie"
							width={24}
							height={24}
							className="flex-shrink-0"
						/>
					</div>
					<h2 className="text-white font-semibold font-mono">Junie Console</h2>
					{isStreaming && (
						<span className="flex items-center gap-1 text-yellow-400 text-sm">
							<span className="animate-pulse">●</span>
							<span>Running</span>
						</span>
					)}
				</div>
				{onClear && logs.length > 0 && (
					<button
						type="button"
						onClick={onClear}
						className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
					>
						Clear
					</button>
				)}
			</div>

			{/* Console Output */}
			<div
				className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900"
				role="log"
				aria-live="polite"
				aria-label="Console output"
			>
				{logs.length === 0 ? (
					<div className="text-gray-500 italic">
						Console ready. Waiting for input...
					</div>
				) : (
					<div className="space-y-2">
						{logs.map((log, index) => (
							<LogEntryComponent
								key={`${log.text}-${
									// biome-ignore lint/suspicious/noArrayIndexKey: Logs are sequential and index is appropriate
									index
								}`}
								log={log}
								index={index}
							/>
						))}
					</div>
				)}
				<div ref={consoleEndRef} />
			</div>
		</div>
	);
});

interface LogEntryComponentProps {
	log: LogEntry;
	index: number;
}

function LogEntryComponent({ log, index }: LogEntryComponentProps) {
	const getLogColor = (type: LogType): string => {
		switch (type) {
			case "success":
				return "text-green-400";
			case "warning":
				return "text-yellow-400";
			case "error":
				return "text-red-400";
		case "info":
		default:
			return "text-purple-400";
		}
	};

	const getLogIcon = (type: LogType): string => {
		switch (type) {
			case "success":
				return "✓";
			case "warning":
				return "⚠";
			case "error":
				return "✗";
			case "info":
			default:
				return "ℹ";
		}
	};

	const colorClass = getLogColor(log.type);
	const icon = getLogIcon(log.type);

	return (
		<div
			className="animate-fade-in"
			style={{
				animationDelay: `${index * 50}ms`,
			}}
		>
			{/* Timestamp (if provided) */}
			{log.timestamp && (
				<span className="text-gray-600 mr-2">[{log.timestamp}]</span>
			)}

			{/* Icon and message */}
			<span className={`${colorClass} mr-2`}>{icon}</span>
			<span className="text-gray-300">{log.text}</span>

			{/* Code diff (if provided) */}
			{log.codeDiff && (
				<pre className="mt-2 ml-6 p-3 bg-gray-800 rounded border border-gray-700 text-xs overflow-x-auto">
					<code className="text-green-300">{log.codeDiff}</code>
				</pre>
			)}
		</div>
	);
}

