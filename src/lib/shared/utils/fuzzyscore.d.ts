/**higher - better
 * @param output_terms if terms were transformed, here could be the original terms
 * @hidden
 */
export declare function FuzzyScoreSorting<T = string>(
	terms: string[],
	query: string,
	output_terms?: T[],
): [number, T][];

// Taken from @rbxts/fuzzy-search
