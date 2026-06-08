import type { GameState } from "./types";

export interface FoldProgress {
  gatheredAllSheep: boolean;
  waterRestored: boolean;
  guardianCalmed: boolean;
  foldRestored: boolean;
}

export function getFoldProgress(state: GameState): FoldProgress {
  return {
    gatheredAllSheep: state.objectives.gatheredSheep >= state.objectives.requiredSheep,
    waterRestored: state.objectives.waterRestored,
    guardianCalmed: state.objectives.guardianCalmed,
    foldRestored: state.objectives.foldRestored,
  };
}

export function restoreFoldIfReady(state: GameState): GameState {
  const progress = getFoldProgress(state);
  const ready = progress.gatheredAllSheep && progress.waterRestored && progress.guardianCalmed;

  if (!ready) {
    return state;
  }

  return {
    ...state,
    objectives: {
      ...state.objectives,
      foldRestored: true,
    },
  };
}
