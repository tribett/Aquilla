import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import {
  canTrackOldPastureScent,
  HIDDEN_GROVE_POSITION,
  OLD_PASTURE_SCENT_START,
  trackOldPastureScent,
} from "../../src/game/scentTrail";

describe("old pasture scent trail", () => {
  it("is trackable only in the old pasture near the faint scent", () => {
    const briarfold = createInitialState();
    const oldPasture = {
      ...briarfold,
      currentArea: "old-pasture" as const,
      player: {
        ...briarfold.player,
        position: OLD_PASTURE_SCENT_START,
      },
    };

    expect(canTrackOldPastureScent(briarfold)).toBe(false);
    expect(canTrackOldPastureScent(oldPasture)).toBe(true);
  });

  it("sends the sheepdog down the trail and marks the hidden grove found with its lamp claimed", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      currentArea: "old-pasture" as const,
      player: {
        ...initialState.player,
        position: OLD_PASTURE_SCENT_START,
      },
    };

    const next = trackOldPastureScent(state);

    expect(next.dog.command).toBe("fetch");
    expect(next.dog.position).toEqual(HIDDEN_GROVE_POSITION);
    expect(next.inventory).toContain("grove-lantern");
    expect(next.objectives.hiddenGroveFound).toBe(true);
    expect(next.objectives.hiddenGroveLanternClaimed).toBe(true);
  });

  it("does not retrack the scent after the hidden grove has been found", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      currentArea: "old-pasture" as const,
      objectives: {
        ...initialState.objectives,
        hiddenGroveFound: true,
      },
      player: {
        ...initialState.player,
        position: OLD_PASTURE_SCENT_START,
      },
    };

    const next = trackOldPastureScent(state);

    expect(next).toBe(state);
  });
});
