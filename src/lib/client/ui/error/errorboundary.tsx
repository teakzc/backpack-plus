import React, { Component, ErrorInfo, ReactComponent } from "@rbxts/react";

interface ErrorBoundaryProps {
	/**
	 * Rendered when a descendant throws. Receives the caught error. Return an
	 * element to render a fallback UI, or `undefined` to render nothing.
	 */
	fallback?: (err: unknown) => React.Element | undefined;
	/** Called when an error is caught — use for logging/telemetry. */
	onError?: (err: unknown, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	err?: unknown;
}

/**
 * @hidden
 * @client
 */
@ReactComponent
export class ErrorBoundary extends Component<React.PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
	public state: ErrorBoundaryState = {
		hasError: false,
	};

	public componentDidCatch(err: unknown, info: ErrorInfo) {
		this.props.onError?.(err, info);

		this.setState({
			hasError: true,
			err,
		});
	}

	public render() {
		if (this.state.hasError) {
			return this.props.fallback?.(this.state.err);
		}

		return this.props.children;
	}
}
