import type { GameState } from "./types";

export type CreedBeaconId = "maker" | "redeemer" | "giver";

export interface CreedBeaconResult {
  state: GameState;
  message: string;
}

export const CREED_BEACON_ORDER: readonly CreedBeaconId[] = ["maker", "redeemer", "giver"];

const CREED_BEACON_LABELS: Record<CreedBeaconId, string> = {
  giver: "Giver",
  maker: "Maker",
  redeemer: "Redeemer",
};

const CREED_BEACON_MESSAGES: Record<CreedBeaconId, string> = {
  giver: "The Giver beacon answers: the Spirit makes dry bones live; the Lantern Ruins shine with received grace.",
  maker: "The Maker beacon answers: the Father made all things good and calls them beloved.",
  redeemer: "The Redeemer beacon answers: the Son seeks the lost by mercy, not by force.",
};

export function getNextCreedBeaconId(state: GameState): CreedBeaconId | undefined {
  return CREED_BEACON_ORDER[state.objectives.creedBeaconsLit];
}

export function getCreedBeaconLabel(beaconId: CreedBeaconId): string {
  return CREED_BEACON_LABELS[beaconId];
}

export function lightCreedBeacon(
  state: GameState,
  beaconId: CreedBeaconId,
): CreedBeaconResult {
  const beaconIndex = CREED_BEACON_ORDER.indexOf(beaconId);
  const nextBeacon = getNextCreedBeaconId(state);

  if (beaconIndex < state.objectives.creedBeaconsLit) {
    return {
      state,
      message: `The ${CREED_BEACON_LABELS[beaconId]} beacon is already lit.`,
    };
  }

  if (nextBeacon !== beaconId) {
    const nextLabel = nextBeacon ? CREED_BEACON_LABELS[nextBeacon] : "last";

    return {
      state,
      message: `The ${CREED_BEACON_LABELS[beaconId]} beacon waits for the ${nextLabel} beacon.`,
    };
  }

  const nextCount = state.objectives.creedBeaconsLit + 1;
  const restored = nextCount >= state.objectives.requiredCreedBeacons;

  return {
    state: {
      ...state,
      objectives: {
        ...state.objectives,
        creedBeaconsLit: nextCount,
        lanternRuinsRestored: restored,
      },
    },
    message: CREED_BEACON_MESSAGES[beaconId],
  };
}
