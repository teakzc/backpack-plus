import { ToolId, ToolPlus } from "../shared/types";

/**
 * @hidden
 */
export const toolClientMap = new Map<ToolId, Player>();
export const toolMap = new Map<ToolId, ToolPlus>();
export const toolRegistry = new Map<ToolId, Tool>();
