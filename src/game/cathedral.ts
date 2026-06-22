import { setFlag } from "./flags";
import type { GameState } from "./types";
import { CATHEDRAL_WORSHIP_POSITIONS } from "./epicPositions";

export type CathedralWorshipId = keyof typeof CATHEDRAL_WORSHIP_POSITIONS;

export const CATHEDRAL_WORSHIP_ORDER: readonly CathedralWorshipId[] = [
  "praise",
  "confession",
  "sending",
];

const WORSHIP_FLAGS: Record<CathedralWorshipId, string> = {
  confession: "cathedralConfession",
  praise: "cathedralPraise",
  sending: "cathedralSending",
};

const WORSHIP_MESSAGES: Record<CathedralWorshipId, string> = {
  confession: "Aquilla confesses: grace is received, not performed.",
  praise: "Praise rises without pride; the cathedral remembers its King.",
  sending: "Worship closes in sending: restored servants go to love the broken.",
};

export interface CathedralResult {
  message: string;
  state: GameState;
}

export function getNextCathedralWorship(state: GameState): CathedralWorshipId | undefined {
  return CATHEDRAL_WORSHIP_ORDER.find((step) => !state.flags[WORSHIP_FLAGS[step]]);
}

export function completeCathedralWorship(
  state: GameState,
  step: CathedralWorshipId,
): CathedralResult {
  if (!state.inventory.includes("harp-of-remembrance")) {
    return {
      message: "The cathedral's silence waits for the Harp of Remembrance.",
      state,
    };
  }

  const next = getNextCathedralWorship(state);

  if (state.flags[WORSHIP_FLAGS[step]]) {
    return { message: "This worship has already been offered.", state };
  }

  if (next !== step) {
    const label = next ?? "last";
    return {
      message: `Worship returns in order; ${label} waits first.`,
      state,
    };
  }

  const updated = {
    ...state,
    flags: {
      ...state.flags,
      [WORSHIP_FLAGS[step]]: true,
    },
  };

  if (getNextCathedralWorship(updated)) {
    return { message: WORSHIP_MESSAGES[step], state: updated };
  }

  return {
    message: `${WORSHIP_MESSAGES[step]} The Forgotten Cathedral shines with restored worship.`,
    state: setFlag(updated, "cathedralComplete"),
  };
}

export function isNearCathedralWorship(
  position: { x: number; y: number },
  step: CathedralWorshipId,
  range = 1.5,
): boolean {
  const target = CATHEDRAL_WORSHIP_POSITIONS[step];
  const dx = position.x - target.x;
  const dy = position.y - target.y;

  return Math.hypot(dx, dy) <= range;
}
