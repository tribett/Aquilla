import type { GameState } from "./types";
import { hasFlag } from "./flags";
import { KINGSROAD_SNARE_COUNT } from "./areaContent";

export interface SideQuest {
  id: string;
  label: string;
  detail: string;
  chapter: number;
  isComplete: (state: GameState) => boolean;
}

export const SIDE_QUESTS: readonly SideQuest[] = [
  {
    chapter: 1,
    detail: "Clear every thorn snare in Briarfold.",
    id: "valley-thorns",
    isComplete: (state) => state.objectives.thornSnaresCleared >= state.objectives.requiredThornSnares,
    label: "Valley Thorns",
  },
  {
    chapter: 1,
    detail: "Restore the patrolling prowler without striking it.",
    id: "valley-prowler",
    isComplete: (state) => state.objectives.thornProwlersRestored >= state.objectives.requiredThornProwlers,
    label: "Merciful Guard",
  },
  {
    chapter: 1,
    detail: "Find the hidden grove lantern.",
    id: "valley-grove",
    isComplete: (state) => state.objectives.hiddenGroveFound,
    label: "Hidden Grove",
  },
  {
    chapter: 1,
    detail: "Ring the fold-bell before the Fold is restored.",
    id: "valley-bell",
    isComplete: (state) => state.objectives.foldBellRung,
    label: "Bell of Calling",
  },
  {
    chapter: 1,
    detail: "Gather every lost sheep.",
    id: "valley-sheep",
    isComplete: (state) => state.objectives.gatheredSheep >= state.objectives.requiredSheep,
    label: "Lost Sheep",
  },
  {
    chapter: 2,
    detail: "Speak with the pilgrim at Ashford Crossing.",
    id: "ashford-pilgrim",
    isComplete: (state) => hasFlag(state, "ashfordMet"),
    label: "Ashford Pilgrim",
  },
  {
    chapter: 2,
    detail: "Redirect all three Ember Fen channels.",
    id: "ember-channels",
    isComplete: (state) =>
      Boolean(state.flags.emberChannelNorth && state.flags.emberChannelCenter && state.flags.emberChannelSouth),
    label: "Fen Channels",
  },
  {
    chapter: 2,
    detail: "Calm the Ember Fen sentinel.",
    id: "ember-sentinel",
    isComplete: (state) => Boolean(state.flags.emberSentinelCalmed),
    label: "Fen Sentinel",
  },
  {
    chapter: 2,
    detail: "Break the False-Light Archon at the Ashen Spire.",
    id: "ashen-archon",
    isComplete: (state) => hasFlag(state, "ashenSpireDefeated"),
    label: "Ashen Archon",
  },
  {
    chapter: 3,
    detail: "Clear every Kingsroad thorn snare.",
    id: "kingsroad-snares",
    isComplete: (state) => {
      const snares = state.hazards.filter((hazard) => hazard.id.startsWith("kingsroad-snare"));
      return snares.length >= KINGSROAD_SNARE_COUNT && snares.every((hazard) => !hazard.active);
    },
    label: "Kingsroad Snares",
  },
  {
    chapter: 3,
    detail: "Sing faith, hope, and love in the Monastic Ruins.",
    id: "monastic-hymns",
    isComplete: (state) => hasFlag(state, "monasticRuinsComplete"),
    label: "Monastic Hymns",
  },
  {
    chapter: 3,
    detail: "Play the full Harp of Remembrance melody.",
    id: "harp-melody",
    isComplete: (state) => hasFlag(state, "harpOfRemembranceClaimed"),
    label: "Harp Melody",
  },
  {
    chapter: 3,
    detail: "Read the High Kingsroad waymark.",
    id: "kingsroad-waymark",
    isComplete: (state) => Boolean(state.flags.kingsroadWaymarkRead),
    label: "Kingsroad Waymark",
  },
  {
    chapter: 4,
    detail: "Read the Elarion gate inscription.",
    id: "elarion-inscription",
    isComplete: (state) => Boolean(state.flags.elarionInscriptionRead),
    label: "Elarion Gate",
  },
  {
    chapter: 4,
    detail: "Offer praise, confession, and sending in the cathedral.",
    id: "cathedral-worship",
    isComplete: (state) => hasFlag(state, "cathedralComplete"),
    label: "Cathedral Worship",
  },
  {
    chapter: 4,
    detail: "Break the Lucent Court's false unity.",
    id: "lucent-court",
    isComplete: (state) => hasFlag(state, "lucentCourtDefeated"),
    label: "Lucent Court",
  },
  {
    chapter: 5,
    detail: "Return to Briarfold and close the Crown Witness.",
    id: "crown-witness",
    isComplete: (state) => hasFlag(state, "crownWitnessComplete"),
    label: "Crown Witness",
  },
  {
    chapter: 2,
    detail: "Gather moor flowers near Ashford Crossing.",
    id: "ashford-flowers",
    isComplete: (state) =>
      Boolean(state.flags.ashfordFlower1 && state.flags.ashfordFlower2 && state.flags.ashfordFlower3),
    label: "Moor Flowers",
  },
];

export function getSideQuestLog(state: GameState): string[] {
  const chapter = state.chapter;

  return SIDE_QUESTS.filter((quest) => quest.chapter <= chapter).map((quest) => {
    const complete = quest.isComplete(state);
    return `${complete ? "✓" : "·"} ${quest.label}: ${quest.detail}`;
  });
}

export function getSideQuestCompletion(state: GameState): { complete: number; total: number } {
  const available = SIDE_QUESTS.filter((quest) => quest.chapter <= state.chapter);
  const complete = available.filter((quest) => quest.isComplete(state)).length;

  return { complete, total: available.length };
}

export function gatherAshfordFlower(state: GameState): GameState {
  if (!state.flags.ashfordFlower1) {
    return { ...state, flags: { ...state.flags, ashfordFlower1: true } };
  }

  if (!state.flags.ashfordFlower2) {
    return { ...state, flags: { ...state.flags, ashfordFlower2: true } };
  }

  if (!state.flags.ashfordFlower3) {
    return { ...state, flags: { ...state.flags, ashfordFlower3: true } };
  }

  return state;
}
