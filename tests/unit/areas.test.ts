import { describe, expect, it } from "vitest";
import { enterLanternRuinsIfReady, enterOldPastureIfReady } from "../../src/game/areas";
import { createInitialState } from "../../src/game/createInitialState";

describe("area progression", () => {
  it("does not leave Briarfold before the Fold is restored", () => {
    const state = createInitialState();

    expect(enterOldPastureIfReady(state)).toBe(state);
  });

  it("moves Aquilla and the sheepdog into Old Pasture after the Fold is restored", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      objectives: {
        ...initialState.objectives,
        foldRestored: true,
      },
    };

    const next = enterOldPastureIfReady(state);

    expect(next.currentArea).toBe("old-pasture");
    expect(next.player.position).toEqual({ x: 2, y: 6 });
    expect(next.player.facing).toBe("right");
    expect(next.dog.position).toEqual({ x: 1, y: 6 });
    expect(next.dog.command).toBe("follow");
  });

  it("opens the Lantern Ruins only after the fear echo is calmed", () => {
    const initialState = createInitialState();
    const oldPastureState = {
      ...initialState,
      currentArea: "old-pasture" as const,
    };

    expect(enterLanternRuinsIfReady(oldPastureState)).toBe(oldPastureState);

    const calmedState = {
      ...oldPastureState,
      objectives: {
        ...oldPastureState.objectives,
        fearEchoCalmed: true,
      },
    };

    const next = enterLanternRuinsIfReady(calmedState);

    expect(next.currentArea).toBe("lantern-ruins");
    expect(next.player.position).toEqual({ x: 2, y: 6 });
    expect(next.player.facing).toBe("right");
    expect(next.dog.position).toEqual({ x: 1, y: 6 });
    expect(next.dog.command).toBe("follow");
  });
});
