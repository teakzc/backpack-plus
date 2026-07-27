import { ToolId, ToolPlus } from "@/shared/types";

/**
 * @hidden
 * @server
 */
export const toolClientMap = new Map<ToolId, Player>();

/**
 * @hidden
 * @server
 */
export const toolMap = new Map<ToolId, ToolPlus>();

/**
 * @hidden
 * @server
 */
export const toolRegistry = new Map<ToolId, Tool>();
