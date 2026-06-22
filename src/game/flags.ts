import type { GameState } from "./types";

export type StoryFlag =
  | "foldDungeonEntered"
  | "foldDungeonComplete"
  | "ashenMoorUnlocked"
  | "ashfordMet"
  | "emberFenComplete"
  | "ashenSpireDefeated"
  | "lanternOfWitnessClaimed"
  | "kingsroadUnlocked"
  | "monasticRuinsComplete"
  | "harpOfRemembranceClaimed"
  | "elarionUnlocked"
  | "cathedralComplete"
  | "lucentCourtDefeated"
  | "undercroftSealOpened"
  | "memoryThiefDefeated"
  | "crownWitnessComplete";

export function hasFlag(state: GameState, flag: StoryFlag): boolean {
  return Boolean(state.flags[flag]);
}

export function setFlag(state: GameState, flag: StoryFlag, value = true): GameState {
  if (state.flags[flag] === value) return state;

  return {
    ...state,
    flags: {
      ...state.flags,
      [flag]: value,
    },
  };
}

export function getChapterFromState(state: GameState): number {
  if (hasFlag(state, "crownWitnessComplete")) return 5;
  if (hasFlag(state, "lucentCourtDefeated")) return 5;
  if (hasFlag(state, "elarionUnlocked")) return 4;
  if (hasFlag(state, "kingsroadUnlocked")) return 3;
  if (hasFlag(state, "ashenMoorUnlocked")) return 2;
  return 1;
}
