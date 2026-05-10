import { atom } from "@rbxts/charm";
import { ClientBackpacks } from "../shared/types";

export const clientBackpacks = atom<ClientBackpacks>(new Map());
