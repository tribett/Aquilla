import type { GameState, Vector2 } from "./types";

export const OLD_PASTURE_START: Vector2 = { x: 2, y: 6 };
export const OLD_PASTURE_DOG_START: Vector2 = { x: 1, y: 6 };

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
