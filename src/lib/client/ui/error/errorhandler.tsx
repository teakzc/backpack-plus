import React from "@rbxts/react";
import { ErrorBoundary } from "./errorboundary";

/**
 * Wraps backpack UI so a thrown error is logged and the subtree is removed
 * rather than crashing the rest of the player's GUI.
 */
export function ErrorHandler({ children }: React.PropsWithChildren) {
	return (
		<ErrorBoundary
			onError={(err, info) => warn(`[backpack-plus] UI error caught: ${err}`, info.componentStack)}
			fallback={() => undefined}
		>
			{children}
		</ErrorBoundary>
	);
}
