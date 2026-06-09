import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { getFoldProgress, restoreFoldIfReady } from "../../src/game/dungeon";

describe("Fold of the Lost progression", () => {
  it("does not restore the fold before sheep, water, guardian, and bell objectives are complete", () => {
    const state = createInitialState();

    expect(getFoldProgress(state)).toEqual({
      gatheredAllSheep: false,
      foldBellRung: false,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    });
    expect(restoreFoldIfReady(state).objectives.foldRestored).toBe(false);
  });

  it("does not restore the fold until the old fold-bell has rung", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      objectives: {
        ...initialState.objectives,
        gatheredSheep: 3,
        guardianCalmed: true,
        waterRestored: true,
      },
    };

    const next = restoreFoldIfReady(state);

    expect(next.objectives.foldRestored).toBe(false);
  });

  it("restores the fold when all required mercy objectives and the bell are complete", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      objectives: {
        ...initialState.objectives,
        foldBellRung: true,
        gatheredSheep: 3,
        guardianCalmed: true,
        waterRestored: true,
      },
    };

    const next = restoreFoldIfReady(state);

    expect(next.objectives.foldRestored).toBe(true);
  });
});
