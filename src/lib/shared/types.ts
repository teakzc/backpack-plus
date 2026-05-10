export interface ToolPlus {
	name: string;
	icon: string;
	tooltip: string;
	metadata: { [key: string]: unknown };
	instance: Tool;
}

export type ToolId = string;

export type ClientBackpack = Map<ToolId, ToolPlus>;

export type ClientBackpacks = Map<string, ClientBackpack>;
