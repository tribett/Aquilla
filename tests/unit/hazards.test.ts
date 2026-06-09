import { describe, expect, it } from "vitest";
import {
  BRIARFOLD_SAFE_DOG_POSITION,
  BRIARFOLD_SAFE_PLAYER_POSITION,
  resolveHazardStep,
  restoreThornSnare,
} from "../../src/game/hazards";
import { createInitialState } from "../../src/game/createInitialState";

describe("thorn hazards", () => {
  it("costs resolve and pushes Aquilla back when he steps into an active thorn snare", () => {
    const initialState = createInitialState();
    const thorn = initialState.hazards[0];
    const previousPosition = { x: thorn.position.x, y: thorn.position.y + 1 };
    const state = {
      ...initialState,
      player: {
        ...initialState.player,
        position: thorn.position,
      },
    };

    const result = resolveHazardStep(state, previousPosition);

    expect(result.state.player.health).toBe(2);
    expect(result.state.player.position).toEqual(previousPosition);
    expect(result.state.hazards[0].active).toBe(true);
    expect(result.message).toContain("steps back");
  });

  it("returns Aquilla to shelter when resolve is spent", () => {
    const initialState = createInitialState();
    const thorn = initialState.hazards[0];
    const state = {
      ...initialState,
      player: {
        ...initialState.player,
        health: 1,
        position: thorn.position,
      },
    };

    const result = resolveHazardStep(state, { x: thorn.position.x, y: thorn.position.y + 1 });

    expect(result.state.player.health).toBe(initialState.player.maxHealth);
    expect(result.state.player.position).toEqual(BRIARFOLD_SAFE_PLAYER_POSITION);
    expect(result.state.dog.position).toEqual(BRIARFOLD_SAFE_DOG_POSITION);
    expect(result.message).toContain("grace raises him");
  });

  it("restores thorn snares with the Shepherd's Staff instead of destroying them", () => {
    const initialState = createInitialState();
    const thorn = initialState.hazards[0];

    const restored = restoreThornSnare(initialState, thorn.id);

    expect(restored.state.hazards[0].active).toBe(false);
    expect(restored.state.objectives.thornSnaresCleared).toBe(1);
    expect(restored.message).toContain("wounded becomes a way");

    const repeated = restoreThornSnare(restored.state, thorn.id);

    expect(repeated.state.objectives.thornSnaresCleared).toBe(1);
    expect(repeated.message).toContain("already restored");
  });
});
