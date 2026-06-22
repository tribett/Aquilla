import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { movePlayer } from "../../src/game/movement";
import {
  FOLD_ENTRANCE_STONE_TILES,
  isFoldEntranceStoneMoved,
  withFoldStoneCollision,
} from "../../src/game/foldStone";
import type { WorldMap } from "../../src/game/types";

const openFieldMap: WorldMap = {
  width: 20,
  height: 13,
  blockedTiles: [],
};

describe("fold entrance stone", () => {
  it("blocks the corridor until the staff moves it", () => {
    const state = {
      ...createInitialState(),
      currentArea: "fold-of-the-lost" as const,
      currentRoom: "fold-entrance",
      player: {
        ...createInitialState().player,
        position: { x: 11, y: 9 },
      },
    };

    const blocked = movePlayer(state, "right", withFoldStoneCollision(state, openFieldMap));
    const cleared = movePlayer(
      {
        ...state,
        flags: { foldEntranceStoneMoved: true },
      },
      "right",
      withFoldStoneCollision(
        { ...state, flags: { foldEntranceStoneMoved: true } },
        openFieldMap,
      ),
    );

    expect(isFoldEntranceStoneMoved(state)).toBe(false);
    expect(withFoldStoneCollision(state, openFieldMap).blockedTiles).toEqual(
      expect.arrayContaining(FOLD_ENTRANCE_STONE_TILES),
    );
    expect(blocked.player.position).toEqual({ x: 11, y: 9 });
    expect(cleared.player.position).toEqual({ x: 12, y: 9 });
  });
});
