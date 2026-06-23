const uiFolder = script.Parent?.Parent;

const base = uiFolder?.WaitForChild("base");
const tokens = uiFolder?.FindFirstChild("tokens");

/**
 * @hidden
 * @client
 */
export function useStyle() {
	return base;
}

/**
 * @hidden
 * @client
 */
export function useTokens() {
	return tokens;
}
