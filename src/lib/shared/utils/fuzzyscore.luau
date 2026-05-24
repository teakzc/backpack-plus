--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0

local function CharAt(value, index)
	local _value = value
	local _arg0 = index + 1
	local _arg1 = index + 1
	return string.sub(_value, _arg0, _arg1)
end

local function FuzzyScoreScore(term, query)
	local term_lower = string.lower(term)
	local query_lower = string.lower(query)
	local score = 0
	local term_index = 0
	local previous_matched_index = -1
	for query_char in string.gmatch(query_lower, utf8.charpattern) do
		local found = false
		-- Search term from current position onwards
		do
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					term_index += 1
				else
					_shouldIncrement = true
				end
				if not (term_index < #term_lower) then
					break
				end
				if CharAt(term_lower, term_index) == query_char then
					-- Base point for match
					score += 1
					-- Bonus for consecutive matches
					if previous_matched_index == term_index - 1 then
						score += 2
					end
					previous_matched_index = term_index
					term_index += 1
					found = true
					break
				end
			end
		end
		if not found then
			return 0
		end
	end
	return score
end

--[[
	*higher - better
	 * @param output_terms if terms were transformed, here could be the original terms
	 
]]
local function FuzzyScoreSorting(terms, query, output_terms)
	if output_terms == nil then
		output_terms = terms
	end
	local _exp = table.create(#terms, 0)
	-- ▼ ReadonlyArray.map ▼
	local _newValue = table.create(#_exp)
	local _callback = function(_, i)
		return { FuzzyScoreScore(terms[i + 1], query), output_terms[i + 1] }
	end
	for _k, _v in _exp do
		_newValue[_k] = _callback(_v, _k - 1, _exp)
	end
	-- ▲ ReadonlyArray.map ▲
	table.sort(_newValue, function(_param, _param_1)
		local a = _param[1]
		local b = _param_1[1]
		return a > b
	end)
	return _newValue
end
return {
	FuzzyScoreSorting = FuzzyScoreSorting,
}

-- Taken from @rbxts/fuzzy-search