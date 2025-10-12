/**
 * Toast Context
 * Provides toast notification functionality across the app
 */

"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { ToastContainer, type ToastMessage, type ToastType } from "@/components/Toast";

interface ToastContextValue {
	showToast: (message: string, type?: ToastType, duration?: number) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [messages, setMessages] = useState<ToastMessage[]>([]);

	const showToast = useCallback(
		(message: string, type: ToastType = "info", duration = 5000) => {
			const id = `toast-${Date.now()}-${Math.random()}`;
			const newMessage: ToastMessage = {
				id,
				type,
				message,
				duration,
			};
			setMessages((prev) => [...prev, newMessage]);
		},
		[],
	);

	const removeToast = useCallback((id: string) => {
		setMessages((prev) => prev.filter((msg) => msg.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, removeToast }}>
			{children}
			<ToastContainer messages={messages} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return context;
}

