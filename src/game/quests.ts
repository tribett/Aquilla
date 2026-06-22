import type { GameState } from "./types";
import { getChapterFromState, hasFlag } from "./flags";

export interface QuestEntry {
  id: string;
  label: string;
  detail: string;
  isComplete: (state: GameState) => boolean;
  chapter: number;
}

export const MAIN_QUESTS: readonly QuestEntry[] = [
  {
    chapter: 1,
    detail: "Restore Briarfold's Fold and open the valley road.",
    id: "restore-fold",
    isComplete: (state) => state.objectives.foldRestored,
    label: "The Fold of the Lost",
  },
  {
    chapter: 1,
    detail: "Calm the fear echo and receive the grove lantern.",
    id: "old-pasture",
    isComplete: (state) =>
      state.objectives.fearEchoCalmed && state.inventory.includes("grove-lantern"),
    label: "The Old Pasture",
  },
  {
    chapter: 1,
    detail: "Light Maker, Redeemer, and Giver in the Lantern Ruins.",
    id: "lantern-ruins",
    isComplete: (state) => state.objectives.lanternRuinsRestored,
    label: "Lantern Ruins",
  },
  {
    chapter: 1,
    detail: "Remember, receive, and return in the Sanctum.",
    id: "sanctum-witness",
    isComplete: (state) => state.objectives.gameComplete,
    label: "Sanctum Witness",
  },
  {
    chapter: 2,
    detail: "Cross into Ashen Moor and cleanse Ember Fen.",
    id: "ember-fen",
    isComplete: (state) => hasFlag(state, "emberFenComplete"),
    label: "Ember Fen",
  },
  {
    chapter: 2,
    detail: "Restore the Ashen Spire and claim the Lantern of Witness.",
    id: "ashen-spire",
    isComplete: (state) => hasFlag(state, "lanternOfWitnessClaimed"),
    label: "Lantern of Witness",
  },
  {
    chapter: 3,
    detail: "Walk the High Kingsroad and restore the Monastic Ruins.",
    id: "monastic-ruins",
    isComplete: (state) => hasFlag(state, "monasticRuinsComplete"),
    label: "Monastic Ruins",
  },
  {
    chapter: 3,
    detail: "Awaken the Harp of Remembrance.",
    id: "harp",
    isComplete: (state) => hasFlag(state, "harpOfRemembranceClaimed"),
    label: "Harp of Remembrance",
  },
  {
    chapter: 4,
    detail: "Enter Elarion and restore the Forgotten Cathedral.",
    id: "cathedral",
    isComplete: (state) => hasFlag(state, "cathedralComplete"),
    label: "Forgotten Cathedral",
  },
  {
    chapter: 4,
    detail: "Break the Lucent Court's false light in the deep sanctum.",
    id: "lucent-court",
    isComplete: (state) => hasFlag(state, "lucentCourtDefeated"),
    label: "Lucent Court",
  },
  {
    chapter: 5,
    detail: "Return to Briarfold and receive the Crown Witness.",
    id: "crown-witness",
    isComplete: (state) => hasFlag(state, "crownWitnessComplete"),
    label: "Crown Witness",
  },
];

export function getActiveMainQuest(state: GameState): QuestEntry | undefined {
  const chapter = getChapterFromState(state);

  return MAIN_QUESTS.find((quest) => !quest.isComplete(state) && quest.chapter <= chapter);
}

export function getQuestLog(state: GameState): string[] {
  const chapter = getChapterFromState(state);

  return MAIN_QUESTS.filter((quest) => quest.chapter <= chapter).map((quest) => {
    const complete = quest.isComplete(state);

    return `${complete ? "✓" : "·"} ${quest.label}: ${quest.detail}`;
  });
}

export function getChapterTitle(chapter: number): string {
  switch (chapter) {
    case 1:
      return "Chapter I — Briarfold Valley";
    case 2:
      return "Chapter II — Ashen Moor";
    case 3:
      return "Chapter III — High Kingsroad";
    case 4:
      return "Chapter IV — Elarion";
    case 5:
      return "Chapter V — Crown Witness";
    default:
      return "Aquilla";
  }
}
