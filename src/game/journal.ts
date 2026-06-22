import type { GameState } from "./types";
import { hasFlag } from "./flags";

const STORY_BEATS = [
  {
    id: "calling",
    label: "The calling",
    text: "Elder Mara sends Aquilla to gather the lost and restore the Fold.",
    isComplete: (state: GameState) => state.objectives.introSeen,
  },
  {
    id: "fold",
    label: "The Fold restored",
    text: "Sheep, spring, bell, and guardian are restored; Briarfold remembers refuge.",
    isComplete: (state: GameState) => state.objectives.foldRestored,
  },
  {
    id: "pasture",
    label: "The old pasture",
    text: "Fear is calmed and the grove lantern is received as gift, not prize.",
    isComplete: (state: GameState) =>
      state.objectives.fearEchoCalmed && state.inventory.includes("grove-lantern"),
  },
  {
    id: "ruins",
    label: "Lantern Ruins",
    text: "Maker, Redeemer, and Giver burn in order; false light cannot hold.",
    isComplete: (state: GameState) => state.objectives.lanternRuinsRestored,
  },
  {
    id: "sanctum",
    label: "Sanctum witness",
    text: "Remember the gift. Receive grace in Christ. Return as one sent.",
    isComplete: (state: GameState) => state.objectives.gameComplete,
  },
  {
    id: "homecoming",
    label: "Homecoming",
    text: "Aquilla returns to Briarfold with mercy learned in the valley.",
    isComplete: (state: GameState) => state.objectives.returnedHome,
  },
  {
    id: "finale",
    label: "Sent forth",
    text: "The first arc closes; the wider kingdom waits beyond the green road.",
    isComplete: (state: GameState) => state.objectives.storyComplete,
  },
  {
    id: "ashen-moor",
    label: "Ashen Moor",
    text: "Ember Fen is cleansed and the Lantern of Witness walks with Aquilla.",
    isComplete: (state: GameState) => hasFlag(state, "lanternOfWitnessClaimed"),
  },
  {
    id: "kingsroad",
    label: "High Kingsroad",
    text: "Monastic memory awakens; the Harp of Remembrance sings again.",
    isComplete: (state: GameState) => hasFlag(state, "harpOfRemembranceClaimed"),
  },
  {
    id: "elarion",
    label: "Elarion",
    text: "The Forgotten Cathedral worships in truth; false unity breaks in the Lucent Court.",
    isComplete: (state: GameState) => hasFlag(state, "lucentCourtDefeated"),
  },
  {
    id: "crown",
    label: "Crown Witness",
    text: "Aquilla's epic witness closes in Briarfold; mercy is sent to the wider kingdom.",
    isComplete: (state: GameState) => hasFlag(state, "crownWitnessComplete"),
  },
] as const;

export function getJournalStoryBeats(state: GameState): string[] {
  return STORY_BEATS.map((beat) => {
    const complete = beat.isComplete(state);

    return `${complete ? "✓" : "·"} ${beat.label}: ${beat.text}`;
  });
}

export function getCurrentStoryBeat(state: GameState): string {
  const activeBeat = STORY_BEATS.find((beat) => !beat.isComplete(state));

  return activeBeat?.text ?? "Aquilla's witness is complete. The Shepherd's mercy goes with you.";
}

export function markIntroSeen(state: GameState): GameState {
  if (state.objectives.introSeen) return state;

  return {
    ...state,
    objectives: {
      ...state.objectives,
      introSeen: true,
    },
  };
}
