import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { getFoldProgress, restoreFoldIfReady } from "../../src/game/dungeon";

describe("Fold of the Lost progression", () => {
  it("does not restore the fold before sheep, water, and guardian objectives are complete", () => {
    const state = createInitialState();

    expect(getFoldProgress(state)).toEqual({
      gatheredAllSheep: false,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    });
    expect(restoreFoldIfReady(state).objectives.foldRestored).toBe(false);
  });

  it("restores the fold when all required mercy objectives are complete", () => {
    const state = {
      ...createInitialState(),
      objectives: {
        gatheredSheep: 3,
        requiredSheep: 3,
        waterRestored: true,
        guardianCalmed: true,
        foldRestored: false,
      },
    };

    const next = restoreFoldIfReady(state);

    expect(next.objectives.foldRestored).toBe(true);
  });
});
