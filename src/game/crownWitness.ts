import { setFlag } from "./flags";
import type { GameState } from "./types";

export interface CrownWitnessResult {
  message: string;
  state: GameState;
}

export function canWitnessCrownFinale(state: GameState): boolean {
  return (
    state.flags.lucentCourtDefeated &&
    !state.flags.crownWitnessComplete &&
    state.currentArea === "briarfold"
  );
}

export function completeCrownWitness(state: GameState): CrownWitnessResult {
  if (!canWitnessCrownFinale(state)) {
    return {
      message: "The Crown Witness waits until false light is broken and Aquilla returns home.",
      state,
    };
  }

  return {
    message: "Aquilla's epic witness is complete. The valley and kingdom are loved in mercy.",
    state: setFlag(
      {
        ...state,
        chapter: 5,
      },
      "crownWitnessComplete",
    ),
  };
}
