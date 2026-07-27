import React from "@rbxts/react";
import { ErrorBoundary } from "@/client/ui/error/errorboundary";

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
