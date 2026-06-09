import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { commandDog } from "../../src/game/dog";
import { movePlayer } from "../../src/game/movement";
import {
  isShepherdGateOpen,
  sendDogToShepherdGatePlate,
  SHEPHERD_GATE_PLATE_POSITION,
  SHEPHERD_GATE_TILES,
  withShepherdGateCollision,
} from "../../src/game/shepherdGate";
import type { WorldMap } from "../../src/game/types";

const openFieldMap: WorldMap = {
  width: 20,
  height: 13,
  blockedTiles: [],
};

describe("shepherd gate pressure plate", () => {
  it("starts closed and adds gate blockers to the map", () => {
    const state = createInitialState();

    const map = withShepherdGateCollision(state, openFieldMap);

    expect(isShepherdGateOpen(state)).toBe(false);
    expect(map.blockedTiles).toEqual(expect.arrayContaining(SHEPHERD_GATE_TILES));
  });

  it("opens while the sheepdog stays on the old pressure plate", () => {
    const fetched = sendDogToShepherdGatePlate(createInitialState());
    const state = commandDog(fetched, "stay");

    const map = withShepherdGateCollision(state, openFieldMap);

    expect(state.dog.position).toEqual(SHEPHERD_GATE_PLATE_POSITION);
    expect(isShepherdGateOpen(state)).toBe(true);
    SHEPHERD_GATE_TILES.forEach((tile) => {
      expect(map.blockedTiles).not.toContainEqual(tile);
    });
  });

  it("blocks Aquilla before the plate is held and lets him pass after it opens", () => {
    const stateAtGate = {
      ...createInitialState(),
      player: {
        ...createInitialState().player,
        position: { x: 13, y: 6 },
      },
    };
    const closed = movePlayer(
      stateAtGate,
      "right",
      withShepherdGateCollision(stateAtGate, openFieldMap),
    );
    const gateOpen = commandDog(sendDogToShepherdGatePlate(stateAtGate), "stay");
    const opened = movePlayer(
      gateOpen,
      "right",
      withShepherdGateCollision(gateOpen, openFieldMap),
    );

    expect(closed.player.position).toEqual({ x: 13, y: 6 });
    expect(opened.player.position).toEqual({ x: 14, y: 6 });
  });

  it("stays open after the Fold has been restored", () => {
    const state = {
      ...createInitialState(),
      objectives: {
        ...createInitialState().objectives,
        foldRestored: true,
      },
    };

    expect(isShepherdGateOpen(state)).toBe(true);
  });
});
