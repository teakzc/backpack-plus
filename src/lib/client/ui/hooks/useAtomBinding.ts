import { subscribe } from "@rbxts/charm";
import React, { useBinding, useEffect, useMemo } from "@rbxts/react";

export function useAtomBinding<T>(callback: () => T, deps?: unknown[]): React.Binding<T> {
	const init_value = useMemo(callback, []);

	const [v, SetValue] = useBinding(init_value);
	useEffect(() => {
		SetValue(callback());
		return subscribe(callback, SetValue);
	}, deps ?? []);

	return v;
}
