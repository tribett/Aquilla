import type { AreaId, GameState } from "./types";

export type AreaMapStatus = "current" | "locked" | "open";

export interface AreaMapEntry {
  id: Exclude<AreaId, "fold-of-the-lost">;
  label: string;
  status: AreaMapStatus;
}

const AREA_LABELS: Record<AreaMapEntry["id"], string> = {
  briarfold: "Briarfold",
  "lantern-ruins": "Lantern Ruins",
  "old-pasture": "Old Pasture",
  sanctum: "Sanctum",
};

export function getAreaMapEntries(state: GameState): AreaMapEntry[] {
  return [
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
}

export function getCurrentAreaMapLabel(state: GameState): string {
  if (state.currentArea === "fold-of-the-lost") return "Fold of the Lost";

  return AREA_LABELS[state.currentArea];
}

export function getNextMapGate(state: GameState): string {
  if (!state.objectives.foldRestored) {
    return "Restore the Fold to open the Old Pasture.";
  }

  if (state.currentArea === "briarfold" || state.currentArea === "fold-of-the-lost") {
    return "Enter the Old Pasture through the restored Fold.";
  }

  if (!state.objectives.fearEchoCalmed) {
    return "Calm the fear echo in the Old Pasture.";
  }

  if (!state.inventory.includes("grove-lantern")) {
    return "Find the grove lantern to enter the Lantern Ruins.";
  }

  if (state.currentArea === "old-pasture") {
    return "Enter the Lantern Ruins from the eastern waymark.";
  }

  if (!state.objectives.lanternRuinsRestored) {
    return "Light Maker, Redeemer, and Giver in order.";
  }

  if (state.currentArea !== "sanctum") {
    return "Enter the Sanctum and finish the witness path.";
  }

  if (!state.objectives.gameComplete) {
    return "Complete Remember, Receive, and Return.";
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
