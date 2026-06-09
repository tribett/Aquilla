import type { Encounter, GameState, Interactable } from "./types";

export const AQUILLA_SAVE_KEY = "aquilla.save.v4";

export interface GameSaveSnapshot {
  fearEcho: Encounter;
  guardian: Encounter;
  questMessage: string;
  state: GameState;
  version: 4;
  waterChannel: Interactable;
}

export function saveGame(storage: Storage, snapshot: GameSaveSnapshot): void {
  storage.setItem(AQUILLA_SAVE_KEY, JSON.stringify(snapshot));
}

export function loadGameSave(storage: Storage): GameSaveSnapshot | undefined {
  const rawSave = storage.getItem(AQUILLA_SAVE_KEY);

  if (!rawSave) return undefined;

  try {
    const parsed = JSON.parse(rawSave) as Partial<GameSaveSnapshot>;

    if (!isValidSaveSnapshot(parsed)) return undefined;

    return parsed;
  } catch {
    return undefined;
  }
}

export function clearGameSave(storage: Storage): void {
  storage.removeItem(AQUILLA_SAVE_KEY);
}

function isValidSaveSnapshot(value: Partial<GameSaveSnapshot>): value is GameSaveSnapshot {
  return (
    value.version === 4 &&
    typeof value.questMessage === "string" &&
    typeof value.state?.player?.health === "number" &&
    typeof value.state?.player?.maxHealth === "number" &&
    Array.isArray(value.state?.hazards) &&
    Boolean(value.state?.player?.position) &&
    Boolean(value.state?.dog?.position) &&
    Boolean(value.state?.objectives) &&
    Boolean(value.guardian?.state) &&
    Boolean(value.fearEcho?.state) &&
    Boolean(value.waterChannel)
  );
}
