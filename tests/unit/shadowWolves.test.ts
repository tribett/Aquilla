import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import {
  distractOrRestoreShadowWolf,
  resolveShadowWolfStep,
} from "../../src/game/shadowWolves";
import type { Creature } from "../../src/game/types";

const shadowWolf: Creature = {
  id: "fold-shadow-wolf",
  kind: "shadow-wolf",
  name: "Shadowed Wolf",
  patrol: [
    { x: 8, y: 8 },
    { x: 12, y: 8 },
  ],
  patrolIndex: 0,
  position: { x: 10, y: 8 },
  state: "hostile",
};

describe("shadow wolves", () => {
  it("blocks Aquilla until Bracken distracts the wolf", () => {
    const state = {
      ...createInitialState(),
      currentArea: "fold-of-the-lost" as const,
      currentRoom: "fold-inner",
      creatures: [shadowWolf],
      player: {
        ...createInitialState().player,
        position: { x: 10, y: 8 },
      },
    };

    const blocked = resolveShadowWolfStep(state, { x: 9, y: 8 });

    expect(blocked.message).toContain("shadowed wolf");
    expect(blocked.state.player.position).toEqual({ x: 9, y: 8 });
  });

  it("restores a shadowed wolf after distraction and staff mercy", () => {
    const distracted = {
      ...createInitialState(),
      currentArea: "fold-of-the-lost" as const,
      currentRoom: "fold-inner",
      creatures: [{ ...shadowWolf, state: "distracted" as const }],
      dog: {
        ...createInitialState().dog,
        command: "distract" as const,
      },
    };

    const result = distractOrRestoreShadowWolf(distracted, shadowWolf.id);

    expect(result.state.flags.foldShadowWolfRestored).toBe(true);
    expect(result.message).toContain("Shepherd's Staff");
  });
});
