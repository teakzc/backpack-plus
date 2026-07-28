opt server_output = "lib/server/networking.luau"
opt client_output = "lib/client/networking.luau"
opt remote_folder = "backpack-plus_ZAP_REMOTES"
opt casing = "camelCase"

opt typescript = true

event SyncState = {
	from: Server,
	type: Reliable,
	call: SingleAsync,
	data: (payload: struct {
		data: struct {
            backpackplus: struct {
                backpack: map {
                    [string.binary]: struct {
                        metadata: map {
                            [string.binary]: unknown
                        }?,
                        name: string.binary?,
                        icon: string.binary?,
                        tooltip: string.binary?,
                        instance: Instance.Tool?,
                    }
                }?,
                equip: string.binary?,
            }
		},
		type: enum { "init", "patch" }
	}[])
}

event RequestState = {
	from: Client,
	type: Reliable,
	call: ManyAsync,
	data: ()
}

event RequestEquip = {
	from: Client,
	type: Reliable,
	call: ManyAsync,
	data: (toolId: string.binary)
}