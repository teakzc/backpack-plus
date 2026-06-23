import { useCallback, useRef } from "@rbxts/react";
import { CollectionService } from "@rbxts/services";

/**
 * @hidden
 * @client
 */
export function useTags<T extends Instance>(tags: string[], dependencies?: unknown[]) {
	const current = useRef<T | undefined>(undefined);

	return useCallback((instance: T | undefined) => {
		if (current.current !== undefined) {
			for (const tag of tags) {
				CollectionService.RemoveTag(current.current, tag);
			}
		}

		current.current = instance;

		if (instance !== undefined) {
			for (const tag of tags) {
				CollectionService.AddTag(instance, tag);
			}
		}
	}, dependencies || []);
}
