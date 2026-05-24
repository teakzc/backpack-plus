export interface ToolPlus<T = Record<string, unknown>> {
	name: string;
	icon: string;
	tooltip: string;
	metadata: T;
	instance?: Tool;
}

export type ToolId = string;
