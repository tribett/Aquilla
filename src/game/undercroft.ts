import { setFlag } from "./flags";
import type { GameState } from "./types";

export interface UndercroftResult {
  message: string;
  state: GameState;
}

export function openUndercroftSeal(state: GameState): UndercroftResult {
  if (state.currentRoom !== "undercroft-seal") {
    return { message: "The undercroft seal waits deeper beneath the Kingsroad.", state };
  }

  const snares = state.hazards.filter((hazard) => hazard.id.startsWith("kingsroad-snare"));
  const snaresCleared = snares.length >= 3 && snares.every((hazard) => !hazard.active);

  if (!snaresCleared) {
    return {
      message: "Thorn snares still bind the undercroft. Clear them with the Shepherd's Staff.",
      state,
    };
  }

  if (state.flags.undercroftSealOpened) {
    return { message: "The Kingsroad seal is already broken.", state };
  }

  return {
    message: "The undercroft seal breaks. The High Kingsroad remembers its King's servants.",
    state: setFlag(state, "undercroftSealOpened"),
  };
}
