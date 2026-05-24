const uiFolder = script.Parent?.Parent;

const base = uiFolder?.WaitForChild("base");
const tokens = uiFolder?.FindFirstChild("tokens");

export function useStyle() {
	return base;
}

export function useTokens() {
	return tokens;
}
