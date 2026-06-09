import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { getAreaMapEntries, getNextMapGate } from "../../src/game/areaMap";

describe("area map progress", () => {
  it("starts with Briarfold current and every later region locked", () => {
    const state = createInitialState();

    expect(getAreaMapEntries(state)).toEqual([
      { id: "briarfold", label: "Briarfold", status: "current" },
      { id: "old-pasture", label: "Old Pasture", status: "locked" },
      { id: "lantern-ruins", label: "Lantern Ruins", status: "locked" },
      { id: "sanctum", label: "Sanctum", status: "locked" },
    ]);
    expect(getNextMapGate(state)).toBe("Restore the Fold to open the Old Pasture.");
  });

  it("points Aquilla to the grove lantern after the fear echo is calmed", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      currentArea: "old-pasture" as const,
      objectives: {
        ...initialState.objectives,
        fearEchoCalmed: true,
        foldRestored: true,
      },
    };

    expect(getAreaMapEntries(state)).toEqual([
      { id: "briarfold", label: "Briarfold", status: "open" },
      { id: "old-pasture", label: "Old Pasture", status: "current" },
      { id: "lantern-ruins", label: "Lantern Ruins", status: "locked" },
      { id: "sanctum", label: "Sanctum", status: "locked" },
    ]);
    expect(getNextMapGate(state)).toBe("Find the grove lantern to enter the Lantern Ruins.");
  });

  it("marks Lantern Ruins and Sanctum as open only when their gates are complete", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      currentArea: "lantern-ruins" as const,
      inventory: [...initialState.inventory, "grove-lantern" as const],
      objectives: {
        ...initialState.objectives,
        fearEchoCalmed: true,
        foldRestored: true,
        hiddenGroveFound: true,
        hiddenGroveLanternClaimed: true,
        lanternRuinsRestored: true,
      },
    };

    expect(getAreaMapEntries(state)).toEqual([
      { id: "briarfold", label: "Briarfold", status: "open" },
      { id: "old-pasture", label: "Old Pasture", status: "open" },
      { id: "lantern-ruins", label: "Lantern Ruins", status: "current" },
      { id: "sanctum", label: "Sanctum", status: "open" },
    ]);
    expect(getNextMapGate(state)).toBe("Enter the Sanctum and finish the witness path.");
  });
});
