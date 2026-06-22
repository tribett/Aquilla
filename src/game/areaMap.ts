import type { AreaId, GameState } from "./types";
import { hasFlag } from "./flags";

export type AreaMapStatus = "current" | "locked" | "open";

export interface AreaMapEntry {
  id: Exclude<AreaId, "fold-of-the-lost">;
  label: string;
  status: AreaMapStatus;
}

const AREA_LABELS: Record<AreaMapEntry["id"], string> = {
  "ashen-spire": "Ashen Spire",
  "ashford-crossing": "Ashford Crossing",
  briarfold: "Briarfold",
  "elarion-gate": "Elarion Gate",
  "ember-fen": "Ember Fen",
  "forgotten-cathedral": "Forgotten Cathedral",
  "kingsroad-pass": "High Kingsroad",
  "lantern-ruins": "Lantern Ruins",
  "lucent-sanctum": "Lucent Sanctum",
  "monastic-ruins": "Monastic Ruins",
  "old-pasture": "Old Pasture",
  sanctum: "Sanctum",
};

export function getAreaMapEntries(state: GameState): AreaMapEntry[] {
  const chapterOne: AreaMapEntry[] = [
    {
      id: "briarfold",
      label: AREA_LABELS.briarfold,
      status: state.currentArea === "briarfold" || state.currentArea === "fold-of-the-lost"
        ? "current"
        : "open",
    },
    {
      id: "old-pasture",
      label: AREA_LABELS["old-pasture"],
      status: getAreaStatus(state, "old-pasture", state.objectives.foldRestored),
    },
    {
      id: "lantern-ruins",
      label: AREA_LABELS["lantern-ruins"],
      status: getAreaStatus(
        state,
        "lantern-ruins",
        state.objectives.fearEchoCalmed && state.inventory.includes("grove-lantern"),
      ),
    },
    {
      id: "sanctum",
      label: AREA_LABELS.sanctum,
      status: getAreaStatus(state, "sanctum", state.objectives.lanternRuinsRestored),
    },
  ];

  if (state.chapter < 2) {
    return chapterOne;
  }

  return [
    ...chapterOne.map((entry) => ({ ...entry, status: entry.status === "current" ? "open" as const : entry.status })),
    {
      id: "ashford-crossing",
      label: AREA_LABELS["ashford-crossing"],
      status: getAreaStatus(state, "ashford-crossing", hasFlag(state, "ashenMoorUnlocked")),
    },
    {
      id: "ember-fen",
      label: AREA_LABELS["ember-fen"],
      status: getAreaStatus(state, "ember-fen", hasFlag(state, "emberFenComplete")),
    },
    {
      id: "ashen-spire",
      label: AREA_LABELS["ashen-spire"],
      status: getAreaStatus(state, "ashen-spire", hasFlag(state, "ashenSpireDefeated")),
    },
    {
      id: "kingsroad-pass",
      label: AREA_LABELS["kingsroad-pass"],
      status: getAreaStatus(state, "kingsroad-pass", hasFlag(state, "kingsroadUnlocked")),
    },
    {
      id: "monastic-ruins",
      label: AREA_LABELS["monastic-ruins"],
      status: getAreaStatus(state, "monastic-ruins", hasFlag(state, "monasticRuinsComplete")),
    },
    {
      id: "elarion-gate",
      label: AREA_LABELS["elarion-gate"],
      status: getAreaStatus(state, "elarion-gate", hasFlag(state, "elarionUnlocked")),
    },
    {
      id: "forgotten-cathedral",
      label: AREA_LABELS["forgotten-cathedral"],
      status: getAreaStatus(state, "forgotten-cathedral", hasFlag(state, "cathedralComplete")),
    },
    {
      id: "lucent-sanctum",
      label: AREA_LABELS["lucent-sanctum"],
      status: getAreaStatus(state, "lucent-sanctum", hasFlag(state, "lucentCourtDefeated")),
    },
  ];
}

export function getCurrentAreaMapLabel(state: GameState): string {
  if (state.currentArea === "fold-of-the-lost") return "Fold of the Lost";

  return AREA_LABELS[state.currentArea];
}

export function getNextMapGate(state: GameState): string {
  if (!state.objectives.foldRestored) {
    return "Restore the Fold to open the Old Pasture.";
  }

  if (!state.objectives.fearEchoCalmed) {
    return "Calm the fear echo in the Old Pasture.";
  }

  if (!state.inventory.includes("grove-lantern")) {
    return "Find the grove lantern to enter the Lantern Ruins.";
  }

  if (!state.objectives.lanternRuinsRestored) {
    return "Light Maker, Redeemer, and Giver in order.";
  }

  if (!state.objectives.gameComplete) {
    if (state.currentArea !== "sanctum") {
      return "Enter the Sanctum and finish the witness path.";
    }

    return "Complete Remember, Receive, and Return.";
  }

  if (!state.objectives.returnedHome) {
    return "Return to Briarfold from the Sanctum threshold.";
  }

  if (!state.objectives.storyComplete) {
    return "Speak with Elder Mara to close Aquilla's witness.";
  }

  if (!hasFlag(state, "emberFenComplete")) {
    return "Cleanse Ember Fen's channels and heart shrine.";
  }

  if (!hasFlag(state, "lanternOfWitnessClaimed")) {
    return "Calm the False-Light Archon and claim the Lantern of Witness.";
  }

  if (!hasFlag(state, "undercroftSealOpened")) {
    return "Clear Kingsroad snares and open the undercroft seal.";
  }

  if (!hasFlag(state, "harpOfRemembranceClaimed")) {
    return "Restore the Monastic Vault: hymns, Memory Thief, and harp melody.";
  }

  if (!hasFlag(state, "cathedralComplete")) {
    return "Restore praise, confession, and sending in the Forgotten Cathedral.";
  }

  if (!hasFlag(state, "lucentCourtDefeated")) {
    return "Break false unity in the Lucent Court antechamber.";
  }

  if (state.currentArea !== "briarfold" && hasFlag(state, "lucentCourtDefeated")) {
    return "Return to Briarfold from the Lucent throne for the Crown Witness.";
  }

  if (!hasFlag(state, "crownWitnessComplete")) {
    return "Speak with Elder Mara to close the Crown Witness.";
  }

  return "Aquilla is sent back to love the valley.";
}

function getAreaStatus(
  state: GameState,
  area: AreaMapEntry["id"],
  unlocked: boolean,
): AreaMapStatus {
  if (state.currentArea === area) return "current";

  return unlocked ? "open" : "locked";
}
