/**
 * Confetti component
 * Displays celebratory confetti animation for high-score endings
 */

"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
	active: boolean;
	duration?: number; // in milliseconds
}

interface ConfettiPiece {
	id: number;
	left: number;
	delay: number;
	duration: number;
	color: string;
}

const COLORS = [
	"#ff0000",
	"#00ff00",
	"#0000ff",
	"#ffff00",
	"#ff00ff",
	"#00ffff",
	"#ffa500",
	"#ff1493",
	"#9370db",
	"#32cd32",
];

export function Confetti({ active, duration = 5000 }: ConfettiProps) {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

	useEffect(() => {
		if (active) {
			// Generate confetti pieces
			const newPieces: ConfettiPiece[] = [];
			for (let i = 0; i < 50; i++) {
				newPieces.push({
					id: i,
					left: Math.random() * 100,
					delay: Math.random() * 1000,
					duration: 2000 + Math.random() * 2000,
					color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ff0000",
				});
			}
			setPieces(newPieces);

			// Clear confetti after duration
			const timer = setTimeout(() => {
				setPieces([]);
			}, duration);

			return () => clearTimeout(timer);
		} else {
			setPieces([]);
		}
	}, [active, duration]);

	if (!active || pieces.length === 0) {
		return null;
	}

	return (
		<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="absolute w-2 h-2 rounded-sm"
					style={{
						left: `${piece.left}%`,
						top: "-10px",
						backgroundColor: piece.color,
						animation: `confetti-fall ${piece.duration}ms linear forwards`,
						animationDelay: `${piece.delay}ms`,
					}}
				/>
			))}
		</div>
	);
}

