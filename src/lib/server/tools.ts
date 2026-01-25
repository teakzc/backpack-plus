export interface tool {
	image?: string;
	tooltip?: string;
	model?: Instance;
	id: number;
}

export interface toolData {
	image?: string;
	tooltip?: string;
	model?: Instance;
}

export function addTool(client: Player, toolData: toolData) {}
