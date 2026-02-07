import { getCount } from "../utils/increment";
import { modify_client, retrieve_client } from "./clients";

export interface tool {
	image?: string;
	tooltip?: string;
	tool?: Tool;
	name?: string;
	id: number;
	metadata: { [key: string]: unknown }; // Map<string, unknown>;
}

export interface toolData {
	image?: string;
	tooltip?: string;
	name?: string;
	tool?: Tool;
	metadata?: { [key: string]: unknown }; // Map<string, unknown>;
}

/**
 * Gives the client a tool
 *
 * @param client The client to add to
 * @param toolData The tool
 * @returns The `id` of the tool
 */
export function add_tool(client: Player, toolData: toolData): number {
	if (!retrieve_client(client)) {
		warn("Client is not registered yet!");
		return -1;
	}

	const data = {
		...toolData,
		id: getCount(),
		metadata: toolData.metadata ?? {}, //new Map<string, unknown>(),
	};

	modify_client(client, (current) => {
		const cloned = table.clone(current);
		cloned.push(data);

		return cloned;
	});

	return data.id;
}

/**
 * Removes the tool from the client
 *
 * @param client The client to remove from
 * @param id The tool id to remove
 */
export function remove_tool(client: Player, id: number) {
	if (!retrieve_client(client)) {
		warn("Client is not registered yet!");
		return;
	}

	modify_client(client, (current) => {
		const cloned = table.clone(current);

		const index = cloned.findIndex((tool) => tool.id === id);

		if (index !== -1) {
			cloned.remove(index);
		} else warn("Tool `id` not found!");

		return cloned;
	});
}
