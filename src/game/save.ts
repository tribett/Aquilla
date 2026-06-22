import type { Encounter, GameState, Interactable } from "./types";
import { getDefaultRoomForArea, getRoom } from "../content/worldRegistry";

export const AQUILLA_SAVE_KEY = "aquilla.save.v6";

export interface GameSaveSnapshot {
  fearEcho: Encounter;
  guardian: Encounter;
  questMessage: string;
  state: GameState;
  version: 6;
  waterChannel: Interactable;
}

type PersistedSaveSnapshot = Partial<Omit<GameSaveSnapshot, "version">> & {
  version?: 5 | 6;
};

export function saveGame(storage: Storage, snapshot: GameSaveSnapshot): void {
  storage.setItem(AQUILLA_SAVE_KEY, JSON.stringify(snapshot));
}

export function loadGameSave(storage: Storage): GameSaveSnapshot | undefined {
  const rawSave = storage.getItem(AQUILLA_SAVE_KEY) ?? storage.getItem("aquilla.save.v5");

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
  storage.removeItem("aquilla.save.v5");
}

function isValidSaveSnapshot(value: PersistedSaveSnapshot): boolean {
  return (
    (value.version === 5 || value.version === 6) &&
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

function normalizeSaveSnapshot(snapshot: PersistedSaveSnapshot): GameSaveSnapshot {
  const state = snapshot.state!;
  const hasGroveLantern = state.inventory.includes("grove-lantern");
  const shouldCarryGroveLantern =
    hasGroveLantern ||
    Boolean(state.objectives.hiddenGroveLanternClaimed || state.objectives.hiddenGroveFound);
  const currentArea = state.currentArea ?? "briarfold";
  const defaultRoom = getDefaultRoomForArea(currentArea);
  const currentRoom = resolveSavedRoom(state.currentRoom, currentArea, defaultRoom.id);

  return {
    fearEcho: snapshot.fearEcho!,
    guardian: snapshot.guardian!,
    questMessage: snapshot.questMessage!,
    version: 6,
    waterChannel: snapshot.waterChannel!,
    state: {
      ...state,
      chapter: state.chapter ?? 1,
      currentRoom,
      flags: state.flags ?? {},
      inventory:
        shouldCarryGroveLantern && !hasGroveLantern
          ? [...state.inventory, "grove-lantern"]
          : state.inventory,
      playtimeMinutes: state.playtimeMinutes ?? 0,
      region: state.region ?? defaultRoom.regionId,
      objectives: {
        ...state.objectives,
        hiddenGroveLanternClaimed: shouldCarryGroveLantern,
        introSeen: state.objectives.introSeen ?? false,
        returnedHome: state.objectives.returnedHome ?? false,
        storyComplete: state.objectives.storyComplete ?? false,
      },
    },
  };
}

const LEGACY_ROOM_MAP: Record<string, string> = {
  "ashen-spire-main": "ashen-spire-entry",
  "ember-fen-main": "ember-cistern-entry",
  "lantern-ruins-main": "lantern-antechamber",
  "lucent-sanctum-main": "lucent-antechamber",
  "monastic-ruins-main": "monastic-cloister",
  "sanctum-main": "sanctum-witness-hall",
};

function migrateLegacyRoom(roomId: string | undefined, areaId: string): string | undefined {
  if (!roomId) return undefined;
  if (LEGACY_ROOM_MAP[roomId]) return LEGACY_ROOM_MAP[roomId];

  try {
    getRoom(roomId);
    return roomId;
  } catch {
    return getDefaultRoomForArea(areaId).id;
  }
}

function resolveSavedRoom(
  roomId: string | undefined,
  areaId: string,
  fallbackRoomId: string,
): string {
  const migratedRoomId = migrateLegacyRoom(roomId, areaId) ?? roomId ?? fallbackRoomId;

  try {
    const room = getRoom(migratedRoomId);
    return room.areaId === areaId ? room.id : fallbackRoomId;
  } catch {
    return fallbackRoomId;
  }
}
