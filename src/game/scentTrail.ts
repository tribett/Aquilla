import type { GameState, Vector2 } from "./types";

export const OLD_PASTURE_SCENT_START: Vector2 = { x: 3, y: 9 };
export const HIDDEN_GROVE_POSITION: Vector2 = { x: 3, y: 11 };
const SCENT_TRACKING_RANGE = 1.5;

export function canTrackOldPastureScent(state: GameState): boolean {
  return (
    state.currentArea === "old-pasture" &&
    !state.objectives.hiddenGroveFound &&
    distanceBetween(state.player.position, OLD_PASTURE_SCENT_START) <= SCENT_TRACKING_RANGE
  );
}

export function trackOldPastureScent(state: GameState): GameState {
  if (!canTrackOldPastureScent(state)) {
    return state;
  }

  return {
    ...state,
    dog: {
      ...state.dog,
      command: "fetch",
      position: { ...HIDDEN_GROVE_POSITION },
    },
    inventory: state.inventory.includes("grove-lantern")
      ? state.inventory
      : [...state.inventory, "grove-lantern"],
    objectives: {
      ...state.objectives,
      hiddenGroveFound: true,
      hiddenGroveLanternClaimed: true,
    },
  };
}

function distanceBetween(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
