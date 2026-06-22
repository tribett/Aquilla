import { setFlag } from "./flags";
import type { GameState } from "./types";
import { MONASTIC_HYMN_POSITIONS } from "./epicPositions";

export type MonasticHymnId = keyof typeof MONASTIC_HYMN_POSITIONS;

export const MONASTIC_HYMN_ORDER: readonly MonasticHymnId[] = ["faith", "hope", "love"];

const HYMN_FLAGS: Record<MonasticHymnId, string> = {
  faith: "monasticHymnFaith",
  hope: "monasticHymnHope",
  love: "monasticHymnLove",
};

const HYMN_MESSAGES: Record<MonasticHymnId, string> = {
  faith: "A monk's voice returns: 'We believed before we saw the King's mercy.'",
  hope: "Stone echoes hope: 'The Shepherd still walks the ruined roads.'",
  love: "Love answers last: 'Mercy is the monastery's true foundation.'",
};

export interface MonasticResult {
  message: string;
  state: GameState;
}

export function getNextMonasticHymn(state: GameState): MonasticHymnId | undefined {
  return MONASTIC_HYMN_ORDER.find((hymn) => !state.flags[HYMN_FLAGS[hymn]]);
}

export function singMonasticHymn(state: GameState, hymn: MonasticHymnId): MonasticResult {
  if (!state.inventory.includes("lantern-of-witness")) {
    return {
      message: "Hidden paths remain sealed until the Lantern of Witness reveals them.",
      state,
    };
  }

  if (!state.flags.memoryThiefDefeated) {
    return {
      message: "The Memory Thief still steals the monks' songs. Calm it with mercy first.",
      state,
    };
  }

  const next = getNextMonasticHymn(state);

  if (state.flags[HYMN_FLAGS[hymn]]) {
    return { message: "This hymn already rests in the ruins.", state };
  }

  if (next !== hymn) {
    const label = next ?? "last";
    return {
      message: `The monks' memory awakens in order; ${label} waits first.`,
      state,
    };
  }

  const updated = {
    ...state,
    flags: {
      ...state.flags,
      [HYMN_FLAGS[hymn]]: true,
    },
  };

  if (getNextMonasticHymn(updated)) {
    return { message: HYMN_MESSAGES[hymn], state: updated };
  }

  return {
    message: `${HYMN_MESSAGES[hymn]} The Monastic Ruins are restored.`,
    state: setFlag(updated, "monasticRuinsComplete"),
  };
}

export function isNearMonasticHymn(
  position: { x: number; y: number },
  hymn: MonasticHymnId,
  range = 1.5,
): boolean {
  const target = MONASTIC_HYMN_POSITIONS[hymn];
  const dx = position.x - target.x;
  const dy = position.y - target.y;

  return Math.hypot(dx, dy) <= range;
}
