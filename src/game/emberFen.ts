import { setFlag } from "./flags";
import type { GameState } from "./types";
import { EMBER_CHANNEL_POSITIONS, EMBER_FEN_SHRINE_POSITION } from "./epicPositions";

export type EmberChannelId = keyof typeof EMBER_CHANNEL_POSITIONS;

export const EMBER_CHANNEL_ORDER: readonly EmberChannelId[] = ["north", "center", "south"];

const CHANNEL_FLAGS: Record<EmberChannelId, string> = {
  center: "emberChannelCenter",
  north: "emberChannelNorth",
  south: "emberChannelSouth",
};

export interface EmberFenResult {
  message: string;
  state: GameState;
}

export function getNextEmberChannel(state: GameState): EmberChannelId | undefined {
  return EMBER_CHANNEL_ORDER.find((channel) => !state.flags[CHANNEL_FLAGS[channel]]);
}

export function redirectEmberChannel(
  state: GameState,
  channel: EmberChannelId,
): EmberFenResult {
  const next = getNextEmberChannel(state);

  if (state.flags[CHANNEL_FLAGS[channel]]) {
    return { message: "This channel already carries true light.", state };
  }

  if (next !== channel) {
    const label = next ?? "last";
    return {
      message: `The fen channels must be turned in order; ${label} waits first.`,
      state,
    };
  }

  const updated = {
    ...state,
    flags: {
      ...state.flags,
      [CHANNEL_FLAGS[channel]]: true,
    },
  };

  if (getNextEmberChannel(updated)) {
    return {
      message: "False fire bends aside; the channel remembers living water.",
      state: updated,
    };
  }

  return {
    message: "All fen channels run clear. The shrine at the heart may be cleansed.",
    state: updated,
  };
}

export function completeEmberFenShrine(state: GameState): EmberFenResult {
  if (state.currentRoom !== "ember-cistern-heart") {
    return { message: "The fen heart waits deeper in the cistern.", state };
  }

  if (state.flags.emberFenComplete) {
    return { message: "Ember Fen is already cleansed.", state };
  }

  if (getNextEmberChannel(state)) {
    return {
      message: "Redirect the fen channels before cleansing the central shrine.",
      state,
    };
  }

  return {
    message: "Aquilla redirects the fen channels; false fire dies and true light returns.",
    state: setFlag(state, "emberFenComplete"),
  };
}

export function isNearEmberChannel(
  position: { x: number; y: number },
  channel: EmberChannelId,
  range = 1.5,
): boolean {
  const target = EMBER_CHANNEL_POSITIONS[channel];
  const dx = position.x - target.x;
  const dy = position.y - target.y;

  return Math.hypot(dx, dy) <= range;
}

export function isNearEmberShrine(position: { x: number; y: number }, range = 1.5): boolean {
  const dx = position.x - EMBER_FEN_SHRINE_POSITION.x;
  const dy = position.y - EMBER_FEN_SHRINE_POSITION.y;

  return Math.hypot(dx, dy) <= range;
}
