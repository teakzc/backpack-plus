import { HttpService } from "@rbxts/services";

/**
 * Generate a unique id
 *
 * @returns string
 *
 * @hidden
 */
export function getId(): string {
	return HttpService.GenerateGUID();
}
