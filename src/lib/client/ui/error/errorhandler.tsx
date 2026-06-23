import React from "@rbxts/react";
import { ErrorBoundary } from "./errorboundary";

/**
 * @hidden
 * @client
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
