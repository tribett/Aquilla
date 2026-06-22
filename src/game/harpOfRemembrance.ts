import type { GameState } from "./types";

const HARP_NOTE_ORDER = ["1", "2", "3", "4", "5"] as const;
export type HarpNote = (typeof HARP_NOTE_ORDER)[number];

const HARP_FREQUENCIES: Record<HarpNote, number> = {
  "1": 262,
  "2": 294,
  "3": 330,
  "4": 349,
  "5": 392,
};

export interface HarpResult {
  frequency?: number;
  message: string;
  state: GameState;
}

function harpFlag(note: HarpNote): string {
  return `harpNote${note}`;
}

export function getHarpProgress(state: GameState): number {
  return HARP_NOTE_ORDER.filter((note) => state.flags[harpFlag(note)]).length;
}

export function playHarpNote(state: GameState, note: HarpNote): HarpResult {
  if (!state.flags.monasticRuinsComplete) {
    return { message: "The harp sleeps until the Monastic Ruins are restored.", state };
  }

  if (state.inventory.includes("harp-of-remembrance")) {
    return { message: "The Harp of Remembrance is already carried.", state };
  }

  const progress = getHarpProgress(state);
  const expected = HARP_NOTE_ORDER[progress];

  if (note !== expected) {
    const resetFlags = { ...state.flags };
    HARP_NOTE_ORDER.forEach((step) => {
      delete resetFlags[harpFlag(step)];
    });

    return {
      message: "A wrong note fades. Aquilla listens and begins the melody again.",
      state: { ...state, flags: resetFlags },
    };
  }

  const updatedFlags = { ...state.flags, [harpFlag(note)]: true };
  const nextProgress = progress + 1;

  if (nextProgress < HARP_NOTE_ORDER.length) {
    return {
      frequency: HARP_FREQUENCIES[note],
      message: `The harp answers note ${note}; mercy remembers what fear forgot.`,
      state: { ...state, flags: updatedFlags },
    };
  }

  return {
    frequency: HARP_FREQUENCIES[note],
    message: "Aquilla receives the Harp of Remembrance: mercy that sings broken places whole.",
    state: {
      ...state,
      flags: { ...updatedFlags, harpOfRemembranceClaimed: true },
      inventory: [...state.inventory, "harp-of-remembrance"],
    },
  };
}

export function getNextHarpNote(state: GameState): HarpNote | undefined {
  return HARP_NOTE_ORDER[getHarpProgress(state)];
}
