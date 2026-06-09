import type { GameState, Vector2 } from "./types";

export const OLD_PASTURE_START: Vector2 = { x: 2, y: 6 };
export const OLD_PASTURE_DOG_START: Vector2 = { x: 1, y: 6 };
export const LANTERN_RUINS_START: Vector2 = { x: 2, y: 6 };
export const LANTERN_RUINS_DOG_START: Vector2 = { x: 1, y: 6 };
export const SANCTUM_START: Vector2 = { x: 2, y: 6 };
export const SANCTUM_DOG_START: Vector2 = { x: 1, y: 6 };

export function enterOldPastureIfReady(state: GameState): GameState {
  if (!state.objectives.foldRestored || state.currentArea === "old-pasture") {
    return state;
  }

  return {
    ...state,
    currentArea: "old-pasture",
    dog: {
      ...state.dog,
      command: "follow",
      position: OLD_PASTURE_DOG_START,
    },
    player: {
      ...state.player,
      facing: "right",
      position: OLD_PASTURE_START,
    },
  };
}

export function enterLanternRuinsIfReady(state: GameState): GameState {
  if (
    !state.objectives.fearEchoCalmed ||
    state.currentArea !== "old-pasture" ||
    !state.inventory.includes("grove-lantern")
  ) {
    return state;
  }

  return {
    ...state,
    currentArea: "lantern-ruins",
    dog: {
      ...state.dog,
      command: "follow",
      position: LANTERN_RUINS_DOG_START,
    },
    player: {
      ...state.player,
      facing: "right",
      position: LANTERN_RUINS_START,
    },
  };
}

export function enterSanctumIfReady(state: GameState): GameState {
  if (
    !state.objectives.lanternRuinsRestored ||
    state.currentArea !== "lantern-ruins"
  ) {
    return state;
  }

  return {
    ...state,
    currentArea: "sanctum",
    dog: {
      ...state.dog,
      command: "follow",
      position: SANCTUM_DOG_START,
    },
    player: {
      ...state.player,
      facing: "right",
      position: SANCTUM_START,
    },
  };
}
