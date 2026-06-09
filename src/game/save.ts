import type { Encounter, GameState, Interactable } from "./types";

export const AQUILLA_SAVE_KEY = "aquilla.save.v5";

export interface GameSaveSnapshot {
  fearEcho: Encounter;
  guardian: Encounter;
  questMessage: string;
  state: GameState;
  version: 5;
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

    return normalizeSaveSnapshot(parsed);
  } catch {
    return undefined;
  }
}

export function clearGameSave(storage: Storage): void {
  storage.removeItem(AQUILLA_SAVE_KEY);
}

function isValidSaveSnapshot(value: Partial<GameSaveSnapshot>): value is GameSaveSnapshot {
  return (
    value.version === 5 &&
    typeof value.questMessage === "string" &&
    typeof value.state?.player?.health === "number" &&
    typeof value.state?.player?.maxHealth === "number" &&
    Array.isArray(value.state?.creatures) &&
    Array.isArray(value.state?.hazards) &&
    Array.isArray(value.state?.inventory) &&
    Boolean(value.state?.player?.position) &&
    Boolean(value.state?.dog?.position) &&
    Boolean(value.state?.objectives) &&
    Boolean(value.guardian?.state) &&
    Boolean(value.fearEcho?.state) &&
    Boolean(value.waterChannel)
  );
}

function normalizeSaveSnapshot(snapshot: GameSaveSnapshot): GameSaveSnapshot {
  const hasGroveLantern = snapshot.state.inventory.includes("grove-lantern");
  const shouldCarryGroveLantern =
    hasGroveLantern ||
    Boolean(
      snapshot.state.objectives.hiddenGroveLanternClaimed ||
      snapshot.state.objectives.hiddenGroveFound,
    );

  return {
    ...snapshot,
    state: {
      ...snapshot.state,
      inventory:
        shouldCarryGroveLantern && !hasGroveLantern
          ? [...snapshot.state.inventory, "grove-lantern"]
          : snapshot.state.inventory,
      objectives: {
        ...snapshot.state.objectives,
        hiddenGroveLanternClaimed: shouldCarryGroveLantern,
      },
    },
  };
}
