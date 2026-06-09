import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { commandDog, herdNearestSheep, herdSheepById } from "../../src/game/dog";

describe("dog commands", () => {
  it("sets the sheepdog command", () => {
    const state = createInitialState();

    const next = commandDog(state, "stay");

    expect(next.dog.command).toBe("stay");
  });

  it("gathers the nearest lost sheep when commanded to herd", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdNearestSheep(state);

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.filter((sheep) => sheep.gathered)).toHaveLength(1);
  });

  it("gathers the closest ungathered sheep even when it is not first", () => {
    const initialState = createInitialState();
    const state = commandDog(
      {
        ...initialState,
        dog: {
          ...initialState.dog,
          position: { x: 0, y: 0 },
        },
        sheep: [
          { id: "far-sheep", name: "Far Sheep", position: { x: 8, y: 8 }, gathered: false },
          { id: "near-sheep", name: "Near Sheep", position: { x: 1, y: 0 }, gathered: false },
          { id: "gathered-sheep", name: "Gathered Sheep", position: { x: 0, y: 1 }, gathered: true },
        ],
      },
      "herd",
    );

    const next = herdNearestSheep(state);

    expect(next.sheep.find((sheep) => sheep.id === "near-sheep")?.gathered).toBe(true);
    expect(next.sheep.find((sheep) => sheep.id === "far-sheep")?.gathered).toBe(false);
  });

  it("gathers a selected sheep by id for proximity interactions", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdSheepById(state, "sheep-2");

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.find((sheep) => sheep.id === "sheep-2")?.gathered).toBe(true);
    expect(next.sheep.find((sheep) => sheep.id === "sheep-1")?.gathered).toBe(false);
  });
});
