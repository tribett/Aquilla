import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { movePlayer } from "../../src/game/movement";
import type { WorldMap } from "../../src/game/types";

const map: WorldMap = {
  width: 8,
  height: 8,
  blockedTiles: [{ x: 7, y: 5 }],
};

describe("movePlayer", () => {
  it("moves Aquilla one tile and updates facing when the path is clear", () => {
    const state = createInitialState();

    const next = movePlayer(state, "right", map);

    expect(next.player.position).toEqual({ x: 6, y: 5 });
    expect(next.player.facing).toBe("right");
  });

  it("keeps Aquilla in place when the destination is blocked", () => {
    const state = createInitialState();
    const next = movePlayer(state, "right", map);
    const blocked = movePlayer(next, "right", map);

    expect(blocked.player.position).toEqual({ x: 6, y: 5 });
    expect(blocked.player.facing).toBe("right");
  });
});
