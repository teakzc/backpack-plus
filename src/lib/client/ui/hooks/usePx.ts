import { effect } from "@rbxts/charm";
import { useBinding, useEffect, useMemo } from "@rbxts/react";
import { GetScreenSizeAtom, useScreenSize } from "./useScreenSize";

/**
 * @see https://discord.com/channels/476080952636997633/476080952636997635/1146857136358432900
 * @hidden
 */
function CalculateScale(viewport: Vector2, base_resolution: Vector2, dominant_axis: number) {
	const width = math.log(viewport.X / base_resolution.X, 2);
	const height = math.log(viewport.Y / base_resolution.Y, 2);
	const centered = width + (height - width) * dominant_axis;

	return 2 ** centered;
}

/**
 * @param dominant_axis 0 - prefer width, 1 - prefer height, defaults to .5
 * @hidden
 */
export function usePx(
	base_resolution: Vector2 = new Vector2(1920, 1080),
	dominant_axis: number = 1, // Changed default to 1 (height-based) since designs are 1080p height
) {
	const resolution = useScreenSize();
	return useMemo(() => {
		const scale = CalculateScale(resolution, base_resolution, dominant_axis);
		return (value: number) => value * scale;
	}, [resolution, dominant_axis]);
}

/**
 * Hook that provides a binding for UI scaling based on screen resolution
 * Useful for animations and dynamic UI changes
 *
 * @param base_resolution The resolution UI was designed for (default 1920x1080)
 * @param dominant_axis Scaling preference (default 1 = height-based)
 * @returns A binding containing the current scale factor
 * @hidden
 */
export function usePxBinding(
	base_resolution: Vector2 = new Vector2(1920, 1080),
	dominant_axis: number = 1, // Changed default to 1 (height-based)
) {
	const [scale_binding, SetScale] = useBinding(1);
	useEffect(() => {
		return effect(() => {
			const scale = CalculateScale(GetScreenSizeAtom(), base_resolution, dominant_axis);
			SetScale(scale);
		});
	}, [dominant_axis, base_resolution]);
	return scale_binding;
}
