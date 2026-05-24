import { atom } from "@rbxts/charm";
import { ClientBackpacks } from "../shared/networking";

export const clientBackpacks = atom<ClientBackpacks>(new Map());
