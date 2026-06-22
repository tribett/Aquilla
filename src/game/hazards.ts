import type { GameState, Hazard, Vector2 } from "./types";

export const BRIARFOLD_SAFE_PLAYER_POSITION: Vector2 = { x: 5, y: 5 };
export const BRIARFOLD_SAFE_DOG_POSITION: Vector2 = { x: 4, y: 5 };

export interface HazardStepResult {
  state: GameState;
  message?: string;
}

export interface ThornRestoreResult {
  state: GameState;
  message: string;
}

export function getActiveHazardAt(state: GameState, position: Vector2): Hazard | undefined {
  if (state.currentArea !== "briarfold" && state.currentArea !== "kingsroad-pass") return undefined;

  return state.hazards.find(
    (hazard) =>
      hazard.active &&
      hazard.position.x === position.x &&
      hazard.position.y === position.y,
  );
}

export function resolveHazardStep(
  state: GameState,
  previousPosition: Vector2,
): HazardStepResult {
  const hazard = getActiveHazardAt(state, state.player.position);

  if (!hazard) {
    return { state };
  }

  const nextHealth = state.player.health - 1;

  if (nextHealth <= 0) {
    return {
      state: {
        ...state,
        dog: {
          ...state.dog,
          command: "follow",
          position: BRIARFOLD_SAFE_DOG_POSITION,
        },
        player: {
          ...state.player,
          health: state.player.maxHealth,
          position: BRIARFOLD_SAFE_PLAYER_POSITION,
        },
      },
      message: "Aquilla falls back to the Fold's shelter; grace raises him to try again.",
    };
  }

  return {
    state: {
      ...state,
      player: {
        ...state.player,
        health: nextHealth,
        position: previousPosition,
      },
    },
    message: "The thorn snare tears at Aquilla's cloak; he steps back and steadies his heart.",
  };
}

export function restoreThornSnare(
  state: GameState,
  hazardId: string,
): ThornRestoreResult {
  const hazard = state.hazards.find((candidate) => candidate.id === hazardId);

  if (!hazard) {
    return {
      state,
      message: "There is no thorn snare here to restore.",
    };
  }

  if (!hazard.active) {
    return {
      state,
      message: "This thorn snare is already restored.",
    };
  }

  const isKingsroadSnare = hazardId.startsWith("kingsroad-snare");

  return {
    state: {
      ...state,
      hazards: state.hazards.map((candidate) =>
        candidate.id === hazardId
          ? { ...candidate, active: false }
          : candidate,
      ),
      objectives: isKingsroadSnare
        ? state.objectives
        : {
            ...state.objectives,
            thornSnaresCleared: state.objectives.thornSnaresCleared + 1,
          },
    },
    message: "The Shepherd's Staff loosens the thorn snare; what wounded becomes a way through.",
  };
}
