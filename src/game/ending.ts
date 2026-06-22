import type { GameState } from "./types";

export interface EndingResult {
  state: GameState;
  message: string;
}

export function canReturnHomeFromSanctum(state: GameState): boolean {
  return state.objectives.gameComplete && state.currentArea === "sanctum";
}

export function canWitnessFinale(state: GameState): boolean {
  return (
    state.objectives.gameComplete &&
    state.objectives.returnedHome &&
    !state.objectives.storyComplete &&
    state.currentArea === "briarfold"
  );
}

export function completeStory(state: GameState): EndingResult {
  if (!canWitnessFinale(state)) {
    return {
      state,
      message: "Aquilla's witness is not yet ready to close.",
    };
  }

  return {
    state: {
      ...state,
      objectives: {
        ...state.objectives,
        storyComplete: true,
      },
    },
    message: "Briarfold remembers its calling. Aquilla is sent in mercy, not in pride.",
  };
}
